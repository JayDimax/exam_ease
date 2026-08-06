import type { QuestionType } from '../types';

export const QUESTION_TYPE_ORDER: QuestionType[] = [
  'multiple-choice',
  'true-false',
  'identification',
  'enumeration',
  'matching',
  'fill-blank',
  'short-answer',
  'essay',
  'case-analysis',
  'problem-solving',
];

export function normalizeSelectedQuestionTypes(value: unknown): QuestionType[] {
  if (!Array.isArray(value)) return [];
  const requested = new Set(value.map(String));
  return QUESTION_TYPE_ORDER.filter((type) => requested.has(type));
}

export function selectedTypesFromDistribution(distribution: unknown): QuestionType[] {
  if (!distribution || typeof distribution !== 'object') return [];
  return QUESTION_TYPE_ORDER.filter((type) => Number((distribution as Record<string, unknown>)[type]) > 0);
}

export function buildSelectedQuestionDistribution(
  selectedValue: unknown,
  totalValue: unknown,
): Record<QuestionType, number> {
  const selected = normalizeSelectedQuestionTypes(selectedValue);
  const requestedTotal = Math.max(0, Math.floor(Number(totalValue) || 0));
  const total = selected.length ? Math.max(selected.length, requestedTotal) : 0;
  const baseCount = selected.length ? Math.floor(total / selected.length) : 0;
  let remainder = selected.length ? total % selected.length : 0;

  return Object.fromEntries(QUESTION_TYPE_ORDER.map((type) => {
    if (!selected.includes(type)) return [type, 0];
    const count = baseCount + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return [type, count];
  })) as Record<QuestionType, number>;
}
