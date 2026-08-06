import type { Question } from '../types';

export interface ExplicitSourceList {
  items: string[];
  sourceSection: string;
}

export interface EnumerationValidation {
  valid: boolean;
  errors: string[];
  answers: string[];
  matchedList?: ExplicitSourceList;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function cleanItem(value: unknown): string {
  return String(value ?? '')
    .replace(/^\s*(?:[-*•▪◦]|\d+[.)]|[a-zA-Z][.)])\s+/, '')
    .replace(/\s+/g, ' ')
    .replace(/[.;]+$/, '')
    .trim();
}

export function normalizeEnumerationText(value: unknown): string {
  return cleanItem(value)
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitEnumerationAnswers(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Map(value.map(cleanItem).filter(Boolean).map((item) => [normalizeEnumerationText(item), item])).values()];
  }

  const raw = String(value ?? '').trim();
  if (!raw) return [];

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return splitEnumerationAnswers(parsed);
    } catch {
      // Continue with legacy delimiter parsing.
    }
  }

  return splitEnumerationAnswers(raw.split(/\r?\n|\s*;\s*|\s*,\s*/));
}

export function getEnumerationAnswers(question: Partial<Question> | null | undefined): string[] {
  if (!question) return [];
  return splitEnumerationAnswers(question.enumerationAnswers ?? question.correctAnswer);
}

function splitInlineList(value: string): string[] {
  return value
    .replace(/\s+(?:and|or)\s+([^,;]+)$/i, ', $1')
    .split(/\s*[,;]\s*/)
    .map(cleanItem)
    .filter((item) => item.length > 1);
}

export function extractExplicitLists(text: string): ExplicitSourceList[] {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const lists: ExplicitSourceList[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*(?:[-*•▪◦]|\d+[.)]|[a-zA-Z][.)])\s+\S/.test(lines[index])) continue;
    const itemLines: string[] = [];
    while (index < lines.length && /^\s*(?:[-*•▪◦]|\d+[.)]|[a-zA-Z][.)])\s+\S/.test(lines[index])) {
      itemLines.push(lines[index]);
      index += 1;
    }
    index -= 1;
    const items = splitEnumerationAnswers(itemLines);
    if (items.length >= 2) {
      const heading = lines.slice(Math.max(0, index - itemLines.length - 1), index - itemLines.length + 1).find((line) => line.trim());
      lists.push({ items, sourceSection: [heading, ...itemLines].filter(Boolean).join('\n') });
    }
  }

  const inlinePattern = /([^\n.!?]{0,160}\b(?:include|includes|included|are|consist of|consists of|following)\s*:?)\s+([^\n.!?]+[.!?]?)/gi;
  for (const match of text.matchAll(inlinePattern)) {
    const items = splitInlineList(match[2].replace(/[.!?]+$/, ''));
    if (items.length >= 2 && /[,;]/.test(match[2])) {
      lists.push({ items, sourceSection: `${match[1]} ${match[2]}`.trim() });
    }
  }

  const seen = new Set<string>();
  return lists.filter((list) => {
    const key = list.items.map(normalizeEnumerationText).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function findSupportingExplicitList(question: Partial<Question>, sourceText: string): ExplicitSourceList | undefined {
  const answerKeys = getEnumerationAnswers(question).map(normalizeEnumerationText);
  const citedSource = normalizeEnumerationText(question.sourceSection || '');
  return extractExplicitLists(sourceText).find((list) => {
    const sourceKeys = list.items.map(normalizeEnumerationText);
    const answersFit = answerKeys.length > 0 && answerKeys.every((answer) => sourceKeys.includes(answer));
    const listCitation = normalizeEnumerationText(list.sourceSection);
    const citationFits = citedSource.length > 0 && (
      citedSource.includes(listCitation) || listCitation.includes(citedSource)
    );
    return answersFit || citationFits;
  });
}

export function requestedEnumerationCount(questionText: string): number | null {
  const match = String(questionText || '').match(/\b(?:enumerate|list|name|identify)\s+(?:(?:all|the)\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
  if (!match) return null;
  return /^\d+$/.test(match[1]) ? Number(match[1]) : NUMBER_WORDS[match[1].toLowerCase()] ?? null;
}

export function validateEnumerationQuestion(question: Partial<Question>, sourceText: string): EnumerationValidation {
  const errors: string[] = [];
  const answers = getEnumerationAnswers(question);
  const requested = requestedEnumerationCount(String(question.question || ''));

  if (answers.length < 2) errors.push('Enumeration must contain at least two distinct answers.');
  if (requested === null) errors.push('Question must state the exact number of requested answers.');
  if (requested !== null && requested !== answers.length) errors.push(`Question requests ${requested} answers but the key contains ${answers.length}.`);

  const answerKeys = answers.map(normalizeEnumerationText);
  const matchedList = extractExplicitLists(sourceText).find((list) => {
    const sourceKeys = list.items.map(normalizeEnumerationText);
    return sourceKeys.length === answerKeys.length && answerKeys.every((answer) => sourceKeys.includes(answer));
  });
  if (!matchedList) errors.push('The complete answer set does not match an explicit list in the source.');

  return { valid: errors.length === 0, errors, answers, matchedList };
}

export function normalizeEnumerationQuestion<T extends Partial<Question>>(question: T): T {
  if (question.type !== 'enumeration') return question;
  const answers = getEnumerationAnswers(question);
  return {
    ...question,
    correctAnswer: answers,
    enumerationAnswers: answers,
    enumerationOrderMatters: Boolean(question.enumerationOrderMatters),
    points: answers.length || question.points,
  };
}

export function scoreEnumerationAnswer(question: Partial<Question>, studentValue: unknown): number {
  const expected = getEnumerationAnswers(question);
  if (!expected.length) return 0;
  const submitted = splitEnumerationAnswers(studentValue);
  if (!submitted.length) return 0;

  const variations = question.enumerationAnswerVariations || [];
  const accepted = expected.map((answer, index) =>
    [answer, ...(variations[index] || [])].map(normalizeEnumerationText).filter(Boolean),
  );
  const submittedKeys = submitted.map(normalizeEnumerationText);

  if (question.enumerationOrderMatters) {
    const correct = accepted.reduce((count, aliases, index) => count + (aliases.includes(submittedKeys[index]) ? 1 : 0), 0);
    return correct / expected.length;
  }

  const unused = new Set(submittedKeys.map((_, index) => index));
  let correct = 0;
  for (const aliases of accepted) {
    const matchIndex = [...unused].find((index) => aliases.includes(submittedKeys[index]));
    if (matchIndex !== undefined) {
      unused.delete(matchIndex);
      correct += 1;
    }
  }
  return correct / expected.length;
}
