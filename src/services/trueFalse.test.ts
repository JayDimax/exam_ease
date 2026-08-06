import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTrueFalseQuestion, validateTrueFalseQuestion } from './trueFalse.ts';
import type { Question } from '../types';

const source = `Class diagrams
A class diagram models classes and their relationships.
Sequence diagrams show interactions between objects over time.`;

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'tf-1',
    type: 'true-false',
    question: 'A class diagram is used to represent classes and the relationships among them.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'The source assigns classes and their relationships to class diagrams.',
    difficulty: 'Easy',
    bloomLevel: 'Understand',
    sourceSection: 'A class diagram models classes and their relationships.',
    points: 1,
    ...overrides,
  };
}

test('accepts a rewritten conceptual statement', () => {
  assert.equal(validateTrueFalseQuestion(makeQuestion(), source).valid, true);
});

test('rejects headings, document-meta questions, and incomplete labels', () => {
  assert.equal(validateTrueFalseQuestion(makeQuestion({ question: 'True or False: Suggested Activities for Chapter 1.' }), source).valid, false);
  assert.equal(validateTrueFalseQuestion(makeQuestion({ question: 'According to the document, a class diagram exists in Chapter 1.' }), source).valid, false);
  assert.equal(validateTrueFalseQuestion(makeQuestion({ question: 'A class diagram.' }), source).valid, false);
});

test('rejects direct copies of source sentences', () => {
  assert.equal(validateTrueFalseQuestion(makeQuestion({ question: 'A class diagram models classes and their relationships.' }), source).valid, false);
});

test('normalizes the UI prefix and answer casing', () => {
  const normalized = normalizeTrueFalseQuestion(makeQuestion({
    question: 'True or False: A class diagram is used to represent classes and the relationships among them',
    correctAnswer: 'true',
  }));
  assert.equal(normalized.question, 'A class diagram is used to represent classes and the relationships among them.');
  assert.equal(normalized.correctAnswer, 'True');
  assert.deepEqual(normalized.options, ['True', 'False']);
});

test('requires an explanation for a believable false statement', () => {
  const falseItem = makeQuestion({
    question: 'A class diagram is primarily used to represent object interactions over time.',
    correctAnswer: 'False',
    explanation: '',
  });
  assert.equal(validateTrueFalseQuestion(falseItem, source).valid, false);
  assert.equal(validateTrueFalseQuestion({ ...falseItem, explanation: 'Sequence diagrams, not class diagrams, represent interactions over time.' }, source).valid, true);
});
