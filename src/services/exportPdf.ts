import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { GeneratedExam } from '../types';
import { getEnumerationAnswers } from './enumeration';

export async function generatePdfBlob(exam: GeneratedExam, includeAnswerKey: boolean = false): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  const margin = 50;
  const contentWidth = width - 2 * margin;

  // Header
  page.drawText((exam.config.school || 'INSTITUTION NAME').toUpperCase(), {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 20;

  page.drawText(`${exam.config.subject || 'Subject'} - ${exam.config.title || 'Examination'}`.toUpperCase(), {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });
  y -= 25;

  // Student Info Box
  page.drawRectangle({
    x: margin,
    y: y - 35,
    width: contentWidth,
    height: 45,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });

  page.drawText('NAME: ____________________________________', { x: margin + 10, y: y - 15, size: 10, font });
  page.drawText('DATE: ______________', { x: margin + 350, y: y - 15, size: 10, font });
  page.drawText(`INSTRUCTOR: ${exam.config.teacher || 'N/A'}`, { x: margin + 10, y: y - 30, size: 10, font });
  page.drawText(`SCORE: _______ / ${exam.questions.reduce((a, b) => a + (b.points || 1), 0)}`, { x: margin + 350, y: y - 30, size: 10, font });

  y -= 60;

  // Instructions
  if (exam.config.instructions) {
    page.drawText(`Instructions: ${exam.config.instructions}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 25;
  }

  // Questions
  let qNum = 1;
  for (const q of exam.questions) {
    if (y < 80) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    const qTitle = `${qNum}. ${q.question} (${q.points} pt${q.points > 1 ? 's' : ''})`;
    page.drawText(truncateText(qTitle, 80), {
      x: margin,
      y,
      size: 10,
      font: boldFont,
    });
    y -= 16;

    if (q.type === 'multiple-choice' && q.options) {
      const labels = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < q.options.length; i++) {
        if (y < 60) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = height - 50;
        }
        page.drawText(`   ${labels[i]}. ${q.options[i]}`, {
          x: margin + 10,
          y,
          size: 9,
          font,
        });
        y -= 14;
      }
    } else if (q.type === 'enumeration') {
      for (let answerIndex = 0; answerIndex < Math.max(2, getEnumerationAnswers(q).length); answerIndex += 1) {
        page.drawText(`   ${answerIndex + 1}. ______________________________________________`, { x: margin + 10, y, size: 9, font });
        y -= 14;
      }
    } else if (q.type === 'essay' || q.type === 'case-analysis' || q.type === 'problem-solving') {
      y -= 30; // Leave space for writing
    }

    y -= 10;
    qNum++;
  }

  // Answer Key Page
  if (includeAnswerKey) {
    page = pdfDoc.addPage([595.28, 841.89]);
    y = height - 50;

    page.drawText('ANSWER KEY & EXPLANATIONS', {
      x: margin,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.5, 0.2),
    });
    y -= 30;

    let keyNum = 1;
    for (const q of exam.questions) {
      if (y < 80) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }

      const enumerationAnswers = q.type === 'enumeration' ? getEnumerationAnswers(q) : [];
      const ansStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer;
      page.drawText(`${keyNum}. Answer${enumerationAnswers.length ? ` (${enumerationAnswers.length} items)` : ''}:`, {
        x: margin,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0.3, 0.7),
      });
      y -= 14;

      if (enumerationAnswers.length) {
        for (let answerIndex = 0; answerIndex < enumerationAnswers.length; answerIndex += 1) {
          if (y < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = height - 50;
          }
          page.drawText(`   ${answerIndex + 1}. ${truncateText(enumerationAnswers[answerIndex], 85)}`, { x: margin + 10, y, size: 9, font: boldFont });
          y -= 13;
        }
      } else {
        page.drawText(`   ${truncateText(String(ansStr || ''), 90)}`, { x: margin + 10, y, size: 9, font: boldFont });
        y -= 13;
      }

      if (q.explanation) {
        page.drawText(`   Explanation: ${truncateText(q.explanation, 90)}`, {
          x: margin,
          y,
          size: 8,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 14;
      }

      y -= 6;
      keyNum++;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

function truncateText(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function triggerPrintWindow(exam: GeneratedExam, includeAnswerKey: boolean = false) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${exam.config.title || 'Exam Print'}</title>
        <style>
          @body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .school { font-size: 18px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 5px; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .meta-table td { padding: 6px; border: 1px solid #ccc; font-size: 14px; }
          .instructions { font-style: italic; font-size: 13px; background: #f9f9f9; padding: 10px; border-left: 4px solid #333; margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-top: 25px; border-bottom: 1px solid #666; padding-bottom: 4px; }
          .question-box { margin-bottom: 16px; page-break-inside: avoid; }
          .question-text { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
          .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-left: 20px; font-size: 13px; }
          .writing-area { height: 80px; border-bottom: 1px dashed #ccc; margin-top: 8px; }
          .page-break { page-break-before: always; }
          .answer-key { font-size: 13px; line-height: 1.6; }
          .correct-ans { font-weight: bold; color: #0066cc; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school">${exam.config.school || 'INSTITUTION / UNIVERSITY NAME'}</div>
          <div>${exam.config.department || ''} - ${exam.config.subject || ''}</div>
          <div class="title">${exam.config.title || 'EXAMINATION'}</div>
        </div>

        <table class="meta-table">
          <tr>
            <td><strong>Student Name:</strong> ____________________________________</td>
            <td><strong>Date:</strong> ____________________</td>
          </tr>
          <tr>
            <td><strong>Course/Section:</strong> ${exam.config.course || ''} ${exam.config.academicYear || ''}</td>
            <td><strong>Score:</strong> _______ / ${exam.questions.reduce((a, b) => a + (b.points || 1), 0)}</td>
          </tr>
        </table>

        ${exam.config.instructions ? `<div class="instructions"><strong>Instructions:</strong> ${exam.config.instructions}</div>` : ''}

        <div class="questions-container">
          ${exam.questions.map((q, idx) => `
            <div class="question-box">
              <div class="question-text">${idx + 1}. ${q.question} <span style="font-weight:normal; font-size:12px;">(${q.points} pt${q.points > 1 ? 's' : ''})</span></div>
              ${q.options && q.options.length > 0 ? `
                <div class="options-grid">
                  ${q.options.map((opt, oIdx) => `<div><strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt}</div>`).join('')}
                </div>
              ` : ''}
              ${q.type === 'enumeration' ? `
                <div style="margin-left:20px; line-height:2;">
                  ${Array.from({ length: Math.max(2, getEnumerationAnswers(q).length) }, (_, answerIndex) => `<div>${answerIndex + 1}. ______________________________________________</div>`).join('')}
                </div>
              ` : ''}
              ${q.type === 'essay' || q.type === 'case-analysis' || q.type === 'problem-solving' ? `
                <div class="writing-area"></div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        ${includeAnswerKey ? `
          <div class="page-break"></div>
          <div class="header">
            <div class="title">OFFICIAL ANSWER KEY & EXPLANATIONS</div>
          </div>
          <div class="answer-key">
            ${exam.questions.map((q, idx) => `
              <div style="margin-bottom: 12px;">
                <div><strong>Q${idx + 1}:</strong> ${q.question}</div>
                <div class="correct-ans">Correct Answer${q.type === 'enumeration' ? ` (${getEnumerationAnswers(q).length} items)` : ''}:</div>
                ${q.type === 'enumeration'
                  ? `<ol>${getEnumerationAnswers(q).map((answer) => `<li>${answer}</li>`).join('')}</ol>`
                  : `<div class="correct-ans">${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</div>`}
                <div style="color: #555; font-size: 12px;">Explanation: ${q.explanation || 'N/A'}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
