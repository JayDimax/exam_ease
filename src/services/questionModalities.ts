import { ExamConfig, Question, QuestionType } from '../types';
import {
  extractExplicitLists,
  getEnumerationAnswers,
  normalizeEnumerationQuestion,
  validateEnumerationQuestion,
} from './enumeration';

const DEFAULT_POINTS: Record<QuestionType, number> = {
  'multiple-choice': 1,
  'true-false': 1,
  identification: 1,
  enumeration: 2,
  'fill-blank': 1,
  matching: 2,
  'short-answer': 3,
  essay: 5,
  'case-analysis': 10,
  'problem-solving': 5,
};

const TYPE_ALIASES: Record<string, QuestionType> = {
  'multiple choice': 'multiple-choice',
  multiplechoice: 'multiple-choice',
  mcq: 'multiple-choice',
  'true false': 'true-false',
  truefalse: 'true-false',
  'fill blank': 'fill-blank',
  'fill in the blank': 'fill-blank',
  'fill in the blanks': 'fill-blank',
  'matching type': 'matching',
  'short answer': 'short-answer',
  'case analysis': 'case-analysis',
  'problem solving': 'problem-solving',
};

function normalizeType(value: unknown): QuestionType | null {
  const raw = String(value || '').trim().toLowerCase();
  const hyphenated = raw.replace(/[\s_]+/g, '-');
  if (hyphenated in DEFAULT_POINTS) return hyphenated as QuestionType;
  return TYPE_ALIASES[raw] || null;
}

function sourceParts(text: string) {
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter((part) => part.length > 20);
  return sentences.length ? sentences : ['The uploaded learning material contains the concept being assessed'];
}

function lectureBasedDistractors(text: string, correctAnswer: unknown, existing: unknown[] = []): string[] {
  const answer = String(correctAnswer || '').trim().toLowerCase();
  const sourceLower = text.toLowerCase();
  const sourceTerms = text
    .match(/[A-Za-z][A-Za-z-]{4,}(?:\s+[A-Za-z][A-Za-z-]{3,})?/g) || [];
  const candidates = [...existing.map(String), ...sourceTerms]
    .map((term) => term.trim().replace(/[.,;:!?]+$/, ''))
    .filter((term) => {
      const normalized = term.toLowerCase();
      return normalized !== answer && !answer.includes(normalized) && !normalized.includes(answer) && sourceLower.includes(normalized);
    });
  const unique = [...new Map(candidates.map((term) => [term.toLowerCase(), term] as const)).values()];
  return unique.slice(0, 3);
}

function groundMultipleChoice(question: Question, text: string): Question {
  if (question.type !== 'multiple-choice') return question;
  const distractors = lectureBasedDistractors(text, question.correctAnswer, question.distractors || question.options || []);
  const correct = String(question.correctAnswer);
  return {
    ...question,
    distractors,
    options: [correct, ...distractors].sort(() => Math.random() - 0.5),
  };
}

function makeFallback(type: QuestionType, index: number, text: string, config: ExamConfig): Question | null {
  const sentences = sourceParts(text);
  const sentence = sentences[index % sentences.length];
  const words = sentence.split(/\s+/).map((word) => word.replace(/[^a-zA-Z0-9-]/g, '')).filter((word) => word.length > 4);
  const answer = words[Math.floor(words.length / 2)] || 'concept';
  const listAnswers = words.slice(0, Math.max(1, Math.min(3, words.length)));
  const base = {
    id: `q_${type}_${Date.now()}_${index}`,
    type,
    explanation: `The answer is supported by this source statement: "${sentence}"`,
    difficulty: config.difficulty === 'Mixed' ? 'Medium' as const : config.difficulty,
    bloomLevel: config.bloomTaxonomy[index % config.bloomTaxonomy.length] || 'Understand' as const,
    sourceSection: sentence,
    confidenceScore: 85,
    points: DEFAULT_POINTS[type],
  };

  switch (type) {
    case 'multiple-choice': {
      const distractors = lectureBasedDistractors(text, answer);
      return { ...base, question: `Which term completes this source statement: "${sentence.replace(answer, '_____')}"?`, options: [answer, ...distractors], distractors, correctAnswer: answer };
    }
    case 'true-false':
      return { ...base, question: `True or False: ${sentence}`, options: ['True', 'False'], correctAnswer: 'True' };
    case 'identification':
      return { ...base, question: `Identify the missing term: "${sentence.replace(answer, '_____')}"`, correctAnswer: answer, acceptableVariations: [answer] };
    case 'enumeration':
      {
        const sourceList = extractExplicitLists(text)[index];
        if (!sourceList) return null;
        return {
          ...base,
          question: `Enumerate all ${sourceList.items.length} items in the source list: "${sourceList.sourceSection.split('\n')[0]}"`,
          correctAnswer: sourceList.items,
          enumerationAnswers: sourceList.items,
          enumerationOrderMatters: false,
          sourceSection: sourceList.sourceSection,
        };
      }
    case 'fill-blank':
      return { ...base, question: `Fill in the blank: ${sentence.replace(answer, '_____')}`, correctAnswer: answer, acceptableVariations: [answer] };
    case 'matching': {
      const matchingPairs = listAnswers.map((term, pairIndex) => ({ left: term, right: `Source term ${pairIndex + 1}` }));
      return { ...base, question: 'Match each term with its corresponding source description.', correctAnswer: matchingPairs.map((pair) => `${pair.left} - ${pair.right}`), matchingPairs };
    }
    case 'short-answer':
      return { ...base, question: `Briefly explain this concept from the source: "${sentence}"`, correctAnswer: sentence, rubric: 'Award full credit for a concise explanation containing the central source idea.' };
    case 'case-analysis':
      return { ...base, question: `Analyze a practical situation where this source concept applies: "${sentence}"`, correctAnswer: sentence, rubric: 'Assess application of the source concept, reasoning, and conclusion.' };
    case 'problem-solving':
      return { ...base, question: `Propose a solution using this principle from the source: "${sentence}"`, correctAnswer: sentence, rubric: 'Assess the solution process and its alignment with the cited principle.' };
    case 'essay':
      return { ...base, question: `Explain and evaluate the importance of this source statement: "${sentence}"`, correctAnswer: sentence, rubric: 'Assess accuracy, depth, organization, and use of source evidence.' };
  }
}

export function enforceQuestionDistribution(
  generated: unknown[],
  config: ExamConfig,
  documentText: string,
): Question[] {
  const seenEnumerationKeys = new Set<string>();
  const normalized = generated
    .map((question: any) => {
      const type = normalizeType(question?.type);
      if (!type) return null;
      const normalizedQuestion = normalizeEnumerationQuestion({
        ...question,
        type,
        points: Number(question.points) || DEFAULT_POINTS[type],
      }) as Question;
      if (type === 'enumeration' && !validateEnumerationQuestion(normalizedQuestion, documentText).valid) return null;
      return normalizedQuestion;
    })
    .filter((question): question is Question => Boolean(question))
    .filter((question) => {
      if (question.type !== 'enumeration') return true;
      const key = getEnumerationAnswers(question).map((answer) => answer.toLowerCase()).sort().join('|');
      if (seenEnumerationKeys.has(key)) return false;
      seenEnumerationKeys.add(key);
      return true;
    });

  const result: Question[] = [];
  const fallbackIndexes: Partial<Record<QuestionType, number>> = {};

  for (const [type, rawCount] of Object.entries(config.questionDistribution) as [QuestionType, number][]) {
    const count = Math.max(0, Number(rawCount) || 0);
    const matching = normalized.filter((question) => question.type === type).slice(0, count);
    fallbackIndexes[type] = type === 'enumeration' ? 0 : matching.length;
    const usedEnumerationKeys = new Set(
      matching.map((question) => getEnumerationAnswers(question).map((answer) => answer.toLowerCase()).sort().join('|')),
    );
    result.push(...matching);
    while (matching.length < count) {
      const fallbackIndex = fallbackIndexes[type] || 0;
      fallbackIndexes[type] = fallbackIndex + 1;
      const fallback = makeFallback(type, fallbackIndex, documentText, config);
      if (!fallback) break;
      if (type === 'enumeration') {
        const key = getEnumerationAnswers(fallback).map((answer) => answer.toLowerCase()).sort().join('|');
        if (usedEnumerationKeys.has(key)) continue;
        usedEnumerationKeys.add(key);
      }
      matching.push(fallback);
      result.push(fallback);
    }
  }

  return result.map((question, index) => groundMultipleChoice({
    ...question,
    id: question.id || `q_${Date.now()}_${index}`,
  }, documentText));
}
