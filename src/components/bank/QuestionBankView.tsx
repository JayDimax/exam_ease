import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Plus,
  Download,
  Upload,
  BookOpen,
  Tag,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { QuestionBankItem } from '../../types';

export const QuestionBankView: React.FC = () => {
  const { questionBank, removeFromQuestionBank, bulkAddToQuestionBank, showToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredItems = questionBank.filter((item) => {
    const q = item.question;
    const matchesQuery =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesQuery && matchesType && matchesDifficulty;
  });

  const handleExportBank = () => {
    const dataStr = JSON.stringify(questionBank, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuestionBank_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Question Bank JSON.');
  };

  const handleImportBank = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported: QuestionBankItem[] = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          bulkAddToQuestionBank(imported);
          showToast(`Successfully imported ${imported.length} questions.`);
        }
      } catch (err) {
        showToast('Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reusable Question Bank
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, export, and manage your reusable repository of questions saved across exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportBank} className="hidden" />
          </label>

          <button
            onClick={handleExportBank}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bank</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search questions, topics, subjects, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="all">All Question Types</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True or False</option>
            <option value="identification">Identification</option>
            <option value="enumeration">Enumeration</option>
            <option value="essay">Essay</option>
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No questions found matching your search criteria.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const q = item.question;
            return (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition flex items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                      {q.type}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400">• Subject: {item.subject}</span>
                  </div>

                  <p className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">{q.question}</p>

                  <p className="text-[11px] text-emerald-600 font-bold">
                    Correct Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                  </p>
                </div>

                <button
                  onClick={() => {
                    removeFromQuestionBank(item.id);
                    showToast('Removed question from bank.');
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
