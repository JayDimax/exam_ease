import type { Question } from '../types';

export interface TrueFalseValidation {
  valid: boolean;
  errors: string[];
  statement: string;
}

const HEADING_PATTERN = /^(?:suggested\s+activities?|learning\s+objectives?|chapter\b|unit\b|module\b|lesson\b|table\s+of\s+contents|references?|activity\b)/i;
const META_PATTERN = /\b(?:according to|as stated in|found in)\s+(?:the\s+)?(?:source|document|text|material)\b/i;
const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with']);

export function stripTrueFalsePrefix(value: unknown): string {
  return String(value ?? '')
    .replace(/^\s*true\s*(?:or|\/)\s*false\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function comparable(value: unknown): string {
  return stripTrueFalsePrefix(value)
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentWords(value: unknown): string[] {
  return comparable(value).split(' ').filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function sourceStatements(sourceText: string): string[] {
  return String(sourceText || '')
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((part) => part.replace(/^\s*(?:[-*•▪◦]|\d+[.)]|[a-zA-Z][.)])\s+/, '').trim())
    .filter(Boolean);
}

export function normalizeTrueFalseQuestion<T extends Partial<Question>>(question: T): T {
  if (question.type !== 'true-false') return question;
  const statement = stripTrueFalsePrefix(question.question);
  const key = String(question.correctAnswer || '').trim().toLowerCase();
  const correctAnswer = key === 'false' ? 'False' : key === 'true' ? 'True' : question.correctAnswer;
  return {
    ...question,
    question: statement && !/[.!?]$/.test(statement) ? `${statement}.` : statement,
    options: ['True', 'False'],
    correctAnswer,
    distractors: correctAnswer === 'True' ? ['False'] : correctAnswer === 'False' ? ['True'] : question.distractors,
  };
}

export function validateTrueFalseQuestion(question: Partial<Question>, sourceText: string): TrueFalseValidation {
  const errors: string[] = [];
  const statement = stripTrueFalsePrefix(question.question);
  const normalizedStatement = comparable(statement);
  const key = String(question.correctAnswer || '').trim().toLowerCase();

  if (!statement || statement.split(/\s+/).length < 6) errors.push('Statement is too short to assess conceptual understanding.');
  if (HEADING_PATTERN.test(statement)) errors.push('Statement begins with a heading or document label.');
  if (META_PATTERN.test(statement)) errors.push('Statement asks about the source document instead of subject knowledge.');
  if (/[:–—-]\s*$/.test(statement)) errors.push('Statement is a label or heading rather than a complete educational proposition.');
  if (key !== 'true' && key !== 'false') errors.push('Correct answer must be True or False.');

  const copiedDirectly = sourceStatements(sourceText).some((sourceStatement) => comparable(sourceStatement) === normalizedStatement);
  if (copiedDirectly) errors.push('Statement copies a source sentence or bullet directly instead of rewriting the concept.');

  const sourceWordSet = new Set(contentWords(sourceText));
  const statementWords = [...new Set(contentWords(statement))];
  const supportedWords = statementWords.filter((word) => sourceWordSet.has(word));
  if (statementWords.length && supportedWords.length < Math.min(2, statementWords.length)) {
    errors.push('Statement is not sufficiently traceable to the source concept.');
  }

  if (key === 'false' && !String(question.explanation || '').trim()) {
    errors.push('A false statement must explain the single altered fact.');
  }

  return { valid: errors.length === 0, errors, statement };
}
