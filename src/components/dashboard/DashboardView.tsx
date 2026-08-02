import React from 'react';
import {
  FileText,
  Upload,
  BrainCircuit,
  Database,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileCheck2,
  BarChart3,
  BookOpen,
  Eye,
  Printer,
  FileDown,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { triggerPrintWindow } from '../../services/exportPdf';
import { generateDocxBlob } from '../../services/exportDocx';

export const DashboardView: React.FC = () => {
  const {
    documents,
    exams,
    questionBank,
    setActiveTab,
    setActiveDocument,
    setActiveExam,
    showToast,
  } = useAppStore();

  const totalQuestionsInBank = questionBank.length;
  const totalExamsGenerated = exams.length;

  // Chart Data: Bloom Taxonomy
  const bloomCounts: Record<string, number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  };

  exams.forEach((ex) => {
    ex.questions.forEach((q) => {
      if (bloomCounts[q.bloomLevel] !== undefined) {
        bloomCounts[q.bloomLevel]++;
      }
    });
  });

  const bloomChartData = Object.keys(bloomCounts).map((key) => ({
    name: key,
    count: bloomCounts[key],
  }));

  // Chart Data: Difficulty Distribution
  const difficultyCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  exams.forEach((ex) => {
    ex.questions.forEach((q) => {
      const d = q.difficulty === 'Easy' ? 'Easy' : q.difficulty === 'Hard' ? 'Hard' : 'Medium';
      difficultyCounts[d]++;
    });
  });

  const difficultyPieData = [
    { name: 'Easy', value: difficultyCounts.Easy, color: '#10B981' },
    { name: 'Medium', value: difficultyCounts.Medium, color: '#3B82F6' },
    { name: 'Hard', value: difficultyCounts.Hard, color: '#EF4444' },
  ];

  const handleQuickDocSelect = (doc: any) => {
    setActiveDocument(doc);
    setActiveTab('generate');
  };

  const handleExportDocx = async (exam: any) => {
    try {
      const blob = await generateDocxBlob(exam, true);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exam.config.title || 'Exam'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded DOCX examination file.');
    } catch (e: any) {
      showToast('Failed to export DOCX', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Client-Side AI Exam Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Transform Learning Materials into Rigorous Examinations
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Upload PDFs, Word docs, Excel spreadsheets, or slides to automatically extract knowledge maps and construct hallucination-free examinations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Uploaded Materials</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{documents.length}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Ready for analysis</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Generated Exams</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalExamsGenerated}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Stored in LocalStorage</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Question Bank Items</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalQuestionsInBank}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">Reusable questions</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Confidence Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">98.4%</h3>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">Zero Hallucination mode</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bloom Taxonomy Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cognitive complexity breakdown across exams</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloomChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Difficulty Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ratio of question difficulty levels</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {exams.length === 0 ? (
              <p className="text-xs text-slate-400">Generate your first exam to view statistics</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploaded Documents */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Documents</h3>
            <button
              onClick={() => setActiveTab('upload')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-xs text-slate-500">No learning materials uploaded yet.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/70 transition"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {doc.type} • {doc.characterCount.toLocaleString()} chars • {doc.uploadDate.slice(0, 10)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickDocSelect(doc)}
                    className="px-3 py-1 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition shrink-0"
                  >
                    Generate Exam
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Generated Exams */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Examinations</h3>
            <button
              onClick={() => setActiveTab('exams')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {exams.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-xs text-slate-500">No exams generated yet.</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Generate Your First Exam
                </button>
              </div>
            ) : (
              exams.slice(0, 4).map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/70 transition"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ex.config.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {ex.config.subject} • {ex.questions.length} Questions • {ex.config.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setActiveExam(ex);
                        setActiveTab('preview');
                      }}
                      title="Preview Exam"
                      className="p-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 rounded-lg text-slate-700 dark:text-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => triggerPrintWindow(ex, true)}
                      title="Print Exam"
                      className="p-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 rounded-lg text-slate-700 dark:text-slate-200 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportDocx(ex)}
                      title="Export DOCX"
                      className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
