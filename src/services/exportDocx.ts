import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
} from 'docx';
import { GeneratedExam, Question } from '../types';

export async function generateDocxBlob(exam: GeneratedExam, includeAnswerKey: boolean = false): Promise<Blob> {
  const { config, questions } = exam;

  // Group questions by type
  const groupedQuestions = groupQuestionsByType(questions);

  const docChildren: any[] = [];

  // Header / Title Block
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (config.school || 'INSTITUTION / SCHOOL NAME').toUpperCase(),
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${config.department || 'Department'} - ${config.subject || 'Subject'}`,
          size: 20,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (config.title || 'EXAMINATION').toUpperCase(),
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 200 } })
  );

  // Student Info Header Table
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'NAME: ____________________________', bold: true, size: 20 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `COURSE/YEAR: ${config.course || ''} ${config.academicYear || ''}`, size: 18 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'DATE: ______________', bold: true, size: 20 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `INSTRUCTOR: ${config.teacher || 'Teacher'}`, size: 18 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: 'SCORE: ______ / ' + getTotalPoints(questions), bold: true, size: 20 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  docChildren.push(infoTable);
  docChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // General Instructions
  if (config.instructions) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'GENERAL INSTRUCTIONS: ', bold: true, size: 20 }),
          new TextRun({ text: config.instructions, size: 20 }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Question Sections
  let partNumber = 1;
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  for (const [type, qList] of Object.entries(groupedQuestions)) {
    if (qList.length === 0) continue;

    const partTitle = getPartTitle(type);
    const roman = romanNumerals[partNumber - 1] || `${partNumber}`;

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `PART ${roman}: ${partTitle.toUpperCase()} (${qList.length} items)`,
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 150 },
      })
    );

    let qCounter = 1;
    for (const q of qList) {
      docChildren.push(...formatQuestionForDocx(q, qCounter++));
    }

    partNumber++;
  }

  // Answer Key Section (If requested)
  if (includeAnswerKey) {
    docChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `ANSWER KEY & SOLUTIONS - ${config.title}`,
            bold: true,
            size: 26,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    let keyCounter = 1;
    for (const q of questions) {
      const answerStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer;
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${keyCounter}. `, bold: true, size: 20 }),
            new TextRun({ text: `Correct Answer: ${answerStr}`, bold: true, color: '0066CC', size: 20 }),
          ],
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `   Explanation: `, italics: true, size: 18 }),
            new TextRun({ text: q.explanation || 'N/A', size: 18 }),
          ],
          spacing: { after: 100 },
        })
      );
      keyCounter++;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function groupQuestionsByType(questions: Question[]): Record<string, Question[]> {
  const groups: Record<string, Question[]> = {};
  for (const q of questions) {
    if (!groups[q.type]) groups[q.type] = [];
    groups[q.type].push(q);
  }
  return groups;
}

function getPartTitle(type: string): string {
  switch (type) {
    case 'multiple-choice': return 'Multiple Choice - Select the best answer';
    case 'true-false': return 'True or False - State whether statements are True or False';
    case 'identification': return 'Identification - Provide the correct term or concept';
    case 'enumeration': return 'Enumeration - List the required items';
    case 'fill-blank': return 'Fill in the Blanks - Complete each statement';
    case 'matching': return 'Matching Type - Match Column A with Column B';
    case 'short-answer': return 'Short Answer Questions';
    case 'essay': return 'Essay Questions - Answer comprehensively';
    case 'case-analysis': return 'Case Analysis';
    case 'problem-solving': return 'Problem Solving';
    default: return 'Questions';
  }
}

function formatQuestionForDocx(q: Question, index: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${index}. `, bold: true, size: 20 }),
        new TextRun({ text: q.question, size: 20 }),
        new TextRun({ text: ` (${q.points} pt${q.points > 1 ? 's' : ''})`, italics: true, size: 18 }),
      ],
      spacing: { before: 120, after: 60 },
    })
  );

  if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    q.options.forEach((opt, idx) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `    ${optionLabels[idx] || idx + 1}. `,
              bold: true,
              size: 20,
            }),
            new TextRun({ text: opt, size: 20 }),
          ],
          spacing: { after: 40 },
        })
      );
    });
  } else if (q.type === 'matching' && q.matchingPairs && q.matchingPairs.length > 0) {
    // Render matching columns
    q.matchingPairs.forEach((pair, idx) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `   [   ]  ${idx + 1}. ${pair.left}`, size: 20 }),
            new TextRun({ text: `            ${String.fromCharCode(65 + idx)}. ${pair.right}`, size: 20 }),
          ],
          spacing: { after: 40 },
        })
      );
    });
  } else if (q.type === 'essay' || q.type === 'case-analysis' || q.type === 'problem-solving') {
    // Blank lines for student response
    for (let i = 0; i < 4; i++) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '_________________________________________________________________________________', color: 'CCCCCC', size: 18 })],
          spacing: { after: 30 },
        })
      );
    }
  }

  return paragraphs;
}

function getTotalPoints(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 1), 0);
}
