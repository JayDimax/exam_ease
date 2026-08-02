import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  CheckCircle2,
  Copy,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { Question, QuestionType, DifficultyLevel, BloomLevel } from '../../types';

export const ExamEditorView: React.FC = () => {
  const {
    activeExam,
    activeDocument,
    updateExamQuestions,
    setActiveTab,
    showToast,
  } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>(activeExam?.questions || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');

  if (!activeExam) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Exam Selected</h2>
        <button
          onClick={() => setActiveTab('generate')}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Generate New Exam
        </button>
      </div>
    );
  }

  const handleSaveAll = () => {
    updateExamQuestions(activeExam.id, questions);
    showToast('Saved all question edits.');
    setActiveTab('preview');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setQuestions(copy);
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast('Deleted question.');
  };

  const handleDuplicate = (q: Question) => {
    const dup: Question = {
      ...q,
      id: 'q_dup_' + Date.now(),
      question: `${q.question} (Copy)`,
    };
    setQuestions((prev) => [...prev, dup]);
    showToast('Duplicated question.');
  };

  const handleAddManualQuestion = () => {
    const newQ: Question = {
      id: 'q_manual_' + Date.now(),
      type: 'multiple-choice',
      question: 'New Question Title...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Explanation for correct answer...',
      difficulty: 'Medium',
      bloomLevel: 'Remember',
      points: 1,
    };
    setQuestions((prev) => [...prev, newQ]);
    setEditingId(newQ.id);
  };

  const handleRegenerateWithAi = async (q: Question) => {
    setRegeneratingId(q.id);
    try {
      const response = await fetch('/api/ai/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: activeDocument?.extractedText || '',
          currentQuestion: q,
          feedback: aiFeedback || 'Make this question higher quality and clear.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate question');
      }

      const regenerated: Question = await response.json();
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...regenerated, id: q.id } : item))
      );
      showToast('Question regenerated successfully with AI!');
      setAiFeedback('');
    } catch (err: any) {
      showToast('Regeneration error: ' + err.message, 'error');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleUpdateQuestionField = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interactive Question Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reorder, edit, duplicate, or regenerate individual questions with AI feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddManualQuestion}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save & Preview Exam</span>
          </button>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isEditing = editingId === q.id;
          const isRegen = regeneratingId === q.id;

          return (
            <div
              key={q.id}
              className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4 transition"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{q.type}</span>
                </div>

                {/* Reorder and Toolbar Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    title="Duplicate"
                    className="p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(isEditing ? null : q.id)}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Question Body / Inline Edit Mode */}
              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Prompt</label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionField(q.id, 'question', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium"
                    />
                  </div>

                  {q.type === 'multiple-choice' && q.options && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500">Choices</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const opts = [...q.options!];
                              opts[oIdx] = e.target.value;
                              handleUpdateQuestionField(q.id, 'options', opts);
                            }}
                            className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Correct Answer</label>
                      <input
                        type="text"
                        value={Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                        onChange={(e) => handleUpdateQuestionField(q.id, 'correctAnswer', e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Points</label>
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => handleUpdateQuestionField(q.id, 'points', parseInt(e.target.value, 10) || 1)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Explanation</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestionField(q.id, 'explanation', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">{q.question}</p>
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl text-xs border ${
                            opt === q.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 pt-1">
                    Correct Answer: <span className="font-bold text-emerald-600">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                  </p>
                </div>
              )}

              {/* Regenerate with AI Assistant Drawer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl flex items-center gap-2 border border-slate-100 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Optional prompt feedback (e.g., Make distractors harder, rewrite for clarity...)"
                  value={aiFeedback}
                  onChange={(e) => setAiFeedback(e.target.value)}
                  className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
                />
                <button
                  onClick={() => handleRegenerateWithAi(q)}
                  disabled={isRegen}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                >
                  {isRegen ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate Item</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
