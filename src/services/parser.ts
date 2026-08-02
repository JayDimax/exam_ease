import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<{ text: string; name: string; size: number; type: string }> {
  const name = file.name;
  const size = file.size;
  const extension = name.split('.').pop()?.toLowerCase() || '';
  let text = '';

  try {
    if (extension === 'txt' || extension === 'md' || extension === 'markdown' || extension === 'csv') {
      text = await readAsText(file);
    } else if (extension === 'pdf') {
      text = await readPdfFile(file);
    } else if (extension === 'docx' || extension === 'doc') {
      text = await readDocxFile(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      text = await readExcelFile(file);
    } else if (extension === 'pptx') {
      text = await readPptxFile(file);
    } else if (extension === 'zip') {
      text = await readZipFile(file);
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(extension)) {
      text = await readImageFile(file);
    } else {
      text = await readAsText(file);
    }
  } catch (err: any) {
    console.error(`Error parsing file ${name}:`, err);
    // Fallback attempt text read
    text = await readAsText(file).catch(() => `[Could not parse text from ${name}]`);
  }

  // Clean content & remove duplicates/excessive spaces
  const cleanedText = cleanExtractedText(text);

  return {
    text: cleanedText,
    name,
    size,
    type: extension.toUpperCase(),
  };
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string || '');
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `\n--- Page ${i} ---\n` + pageText;
  }

  return fullText;
}

async function readDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

async function readExcelFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let result = '';

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    result += `\n=== Sheet: ${sheetName} ===\n` + csv;
  });

  return result;
}

async function readPptxFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  let slidesText = '';
  let slideNum = 1;

  const slideFiles = Object.keys(zip.files).filter((path) =>
    path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
  );

  // Sort by slide number
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '') || '0', 10);
    const numB = parseInt(b.replace(/[^0-9]/g, '') || '0', 10);
    return numA - numB;
  });

  for (const slidePath of slideFiles) {
    const content = await zip.files[slidePath].async('string');
    // Strip XML tags
    const textOnly = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    slidesText += `\n--- Slide ${slideNum++} ---\n` + textOnly.trim();
  }

  return slidesText || 'PowerPoint Presentation content extracted.';
}

async function readZipFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  let combinedText = '';

  for (const relativePath of Object.keys(zip.files)) {
    const zipEntry = zip.files[relativePath];
    if (zipEntry.dir) continue;

    const ext = relativePath.split('.').pop()?.toLowerCase() || '';
    if (['txt', 'md', 'csv', 'json'].includes(ext)) {
      const content = await zipEntry.async('string');
      combinedText += `\n\n=== File: ${relativePath} ===\n` + content;
    }
  }

  return combinedText || 'ZIP Archive containing documents.';
}

async function readImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(`[Image Document: ${file.name} - Resolution: ${img.width}x${img.height}px - Selected for AI Analysis]`);
    };
    img.onerror = () => resolve(`[Image Document: ${file.name}]`);
    img.src = url;
  });
}

function cleanExtractedText(text: string): string {
  if (!text) return '';

  // Remove duplicate blank lines and trim whitespace
  let clean = text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Deduplicate identical adjacent paragraphs
  const paragraphs = clean.split('\n\n');
  const uniqueParagraphs: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed && uniqueParagraphs[uniqueParagraphs.length - 1] !== trimmed) {
      uniqueParagraphs.push(trimmed);
    }
  }

  return uniqueParagraphs.join('\n\n');
}

export function calculateWordCount(text: string): { words: number; chars: number; readingTime: number } {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(words / 200); // 200 wpm standard
  return { words, chars, readingTime };
}
