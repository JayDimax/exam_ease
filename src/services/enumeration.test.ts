import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractExplicitLists,
  normalizeEnumerationQuestion,
  scoreEnumerationAnswer,
  validateEnumerationQuestion,
} from './enumeration.ts';
import type { Question } from '../types';

const source = `Project phases:
1. Planning
2. Implementation
3. Evaluation

The unrelated paragraph explains project ownership.`;

const question: Question = {
  id: 'enum-1',
  type: 'enumeration',
  question: 'Enumerate all 3 project phases.',
  correctAnswer: ['Planning', 'Implementation', 'Evaluation'],
  enumerationAnswers: ['Planning', 'Implementation', 'Evaluation'],
  explanation: 'The phases are listed in the source.',
  difficulty: 'Easy',
  bloomLevel: 'Remember',
  points: 3,
};

test('extracts numbered source lists without turning prose into a list', () => {
  assert.deepEqual(extractExplicitLists(source)[0].items, ['Planning', 'Implementation', 'Evaluation']);
  assert.equal(extractExplicitLists('This sentence has several longer words but no explicit list.').length, 0);
});

test('normalizes legacy comma-delimited enumeration keys into arrays', () => {
  const normalized = normalizeEnumerationQuestion({ ...question, enumerationAnswers: undefined, correctAnswer: 'Planning, Implementation, Evaluation' });
  assert.deepEqual(normalized.enumerationAnswers, ['Planning', 'Implementation', 'Evaluation']);
  assert.deepEqual(normalized.correctAnswer, normalized.enumerationAnswers);
});

test('requires the stated count and complete explicit source list', () => {
  assert.equal(validateEnumerationQuestion(question, source).valid, true);
  assert.equal(validateEnumerationQuestion({ ...question, question: 'Enumerate 2 project phases.' }, source).valid, false);
  assert.equal(validateEnumerationQuestion({ ...question, enumerationAnswers: ['Planning', 'Evaluation'], correctAnswer: ['Planning', 'Evaluation'] }, source).valid, false);
});

test('awards partial credit, ignores order by default, and blocks duplicate credit', () => {
  assert.equal(scoreEnumerationAnswer(question, 'Evaluation\nPlanning\nImplementation'), 1);
  assert.equal(scoreEnumerationAnswer(question, 'Planning\nPlanning\nEvaluation'), 2 / 3);
  assert.equal(scoreEnumerationAnswer(question, 'Planning'), 1 / 3);
});

test('supports order-sensitive keys and per-answer aliases', () => {
  const configured = {
    ...question,
    enumerationOrderMatters: true,
    enumerationAnswerVariations: [['Plan'], ['Execution'], ['Assessment']],
  };
  assert.equal(scoreEnumerationAnswer(configured, 'Plan\nExecution\nAssessment'), 1);
  assert.equal(scoreEnumerationAnswer(configured, 'Execution\nPlan\nAssessment'), 1 / 3);
});
