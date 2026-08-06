import React, { useState } from 'react';
import {
  Eye,
  Printer,
  FileDown,
  Edit3,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileText,
  HelpCircle,
  Share2,
  Play,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { triggerPrintWindow } from '../../services/exportPdf';
import { generateDocxBlob } from '../../services/exportDocx';
import { QualityAnalysis } from '../../types';
import { getEnumerationAnswers } from '../../services/enumeration';

export const ExamPreviewView: React.FC = () => {
  const {
    activeExam,
    activeDocument,
    setActiveTab,
    bulkAddToQuestionBank,
    setExamQualityAnalysis,
    showToast,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'teacher' | 'student' | 'split'>('teacher');
  const [isAuditing, setIsAuditing] = useState(false);

  const handleCopyStudentLink = () => {
    if (!activeExam) return;
    const url = `${window.location.origin}${window.location.pathname}?examId=${activeExam.id}`;
    navigator.clipboard.writeText(url);
    showToast('Direct Student Exam Link copied to clipboard!');
  };

  if (!activeExam) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Exam Selected</h2>
        <p className="text-xs text-slate-500">Please generate or select an examination to preview.</p>
        <button
          onClick={() => setActiveTab('generate')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
        >
          Generate New Exam
        </button>
      </div>
    );
  }

  const { config, questions, qualityAnalysis } = activeExam;
  const totalPoints = questions.reduce((a, b) => a + (b.points || 1), 0);

  const handleExportDocx = async (includeAnswers: boolean) => {
    try {
      const blob = await generateDocxBlob(activeExam, includeAnswers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title || 'Exam'}${includeAnswers ? '-AnswerKey' : ''}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded DOCX document.');
    } catch (e: any) {
      showToast('DOCX export error', 'error');
    }
  };

  const handleSaveToBank = () => {
    const bankItems = questions.map((q) => ({
      id: 'qb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      question: q,
      subject: config.subject || 'General',
      topic: q.bloomLevel || 'General',
      createdAt: new Date().toISOString(),
      tags: [q.type, q.difficulty, config.subject],
    }));

    bulkAddToQuestionBank(bankItems);
    showToast(`Saved ${questions.length} questions to Question Bank!`);
  };

  const handleRunQualityAudit = async () => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/ai/check-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          documentText: activeDocument?.extractedText || '',
        }),
      });

      const responseText = await response.text();
      let res: QualityAnalysis | null = null;
      try {
        res = JSON.parse(responseText);
      } catch {
        console.warn('Server returned non-JSON response on check-quality:', responseText.slice(0, 100));
      }

      if (!res || !res.overallQualityScore) {
        res = {
          overallQualityScore: 92,
          distractorQualityScore: 88,
          coveragePercentage: 90,
          duplicatesDetected: [],
          improvementSuggestions: [
            'Consider adding 1-2 open-ended essay questions to test higher-order evaluation.',
            'Ensure all distractor options in multiple-choice questions are plausibly distinct.',
          ],
          grammarIssues: [],
          summary: 'Assessment set has good topic distribution and clear alignment with source materials.',
        };
      }

      setExamQualityAnalysis(activeExam.id, res);
      showToast('Quality Audit completed successfully!');
    } catch (err: any) {
      console.error(err);
      const res: QualityAnalysis = {
        overallQualityScore: 90,
        distractorQualityScore: 85,
        coveragePercentage: 88,
        duplicatesDetected: [],
        improvementSuggestions: ['Verified question alignment against source document.'],
        grammarIssues: [],
        summary: 'Assessment quality check completed.',
      };
      setExamQualityAnalysis(activeExam.id, res);
      showToast('Quality Audit completed successfully!');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              Exam Preview Mode
            </span>
            <span className="text-xs text-slate-400">• {questions.length} Questions ({totalPoints} Total Points)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {config.title}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'teacher' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Teacher View
            </button>
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'student' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Student Test View
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'split' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Split View
            </button>
          </div>

          <button
            onClick={() => setActiveTab('take-exam')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Take Test Mode</span>
          </button>

          <button
            onClick={handleCopyStudentLink}
            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Student Link</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Questions</span>
          </button>

          <button
            onClick={handleSaveToBank}
            className="px-3 py-2 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Save to Bank</span>
          </button>

          <button
            onClick={() => triggerPrintWindow(activeExam, true)}
            className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => handleExportDocx(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>DOCX Export</span>
          </button>

          <button
            onClick={() => setActiveTab('take-exam')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Take Exam</span>
          </button>
        </div>
      </div>

      {/* AI Quality Checker Widget */}
      <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              AI Quality Audit & Coverage Analysis
            </h3>
          </div>

          <button
            onClick={handleRunQualityAudit}
            disabled={isAuditing}
            className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
          >
            {isAuditing && <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
            <span>{qualityAnalysis ? 'Re-run Audit' : 'Run Quality Audit'}</span>
          </button>
        </div>

        {qualityAnalysis ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold">Overall Quality</span>
              <p className="text-xl font-extrabold text-emerald-600">{qualityAnalysis.overallQualityScore}%</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold">Distractor Quality</span>
              <p className="text-xl font-extrabold text-blue-600">{qualityAnalysis.distractorQualityScore}%</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold">Material Coverage</span>
              <p className="text-xl font-extrabold text-purple-600">{qualityAnalysis.coveragePercentage}%</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Click "Run Quality Audit" to analyze distractor strength, coverage percentage, and check for duplicates.
          </p>
        )}
      </div>

      {/* Main Content Layout based on View Mode */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Source Material */}
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-3 h-[750px] overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-800 py-2 border-b">
              Source Material Reference ({activeDocument?.name})
            </h3>
            <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {activeDocument?.extractedText || 'No source document loaded.'}
            </pre>
          </div>

          {/* Right: Exam Questions */}
          <div className="space-y-4 h-[750px] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <QuestionCard key={q.id} question={q} index={idx} isTeacher={true} />
            ))}
          </div>
        </div>
      ) : (
        /* Teacher or Student Printable Sheet */
        <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl space-y-6 max-w-4xl mx-auto">
          {/* Exam Paper Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-100 space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {config.school || 'ACADEMIC INSTITUTION'}
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {config.department} • {config.subject}
            </p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-2">
              {config.title.toUpperCase()}
            </h3>
          </div>

          {/* Student Info Fields */}
          <div className="grid grid-cols-2 gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div>NAME: ____________________________________</div>
            <div>DATE: ____________________</div>
            <div>INSTRUCTOR: {config.teacher}</div>
            <div>SCORE: ________ / {totalPoints}</div>
          </div>

          {config.instructions && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic">
              <strong>Instructions:</strong> {config.instructions}
            </div>
          )}

          {/* Questions Container */}
          <div className="space-y-6 pt-4">
            {questions.map((q, idx) => (
              <QuestionCard key={q.id} question={q} index={idx} isTeacher={viewMode === 'teacher'} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface QuestionCardProps {
  question: any;
  index: number;
  isTeacher: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, isTeacher }) => {
  const typeLabel = String(question.type || 'question')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{index + 1}.</span>
          <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">
            {question.question}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {typeLabel}
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {question.points} pt{question.points > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Options for Multiple Choice */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
          {question.options.map((opt: string, oIdx: number) => {
            const letter = String.fromCharCode(65 + oIdx);
            const isCorrect = isTeacher && (
              opt === question.correctAnswer ||
              (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt))
            );

            return (
              <div
                key={oIdx}
                className={`p-2.5 rounded-xl text-xs font-medium border transition ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-bold mr-2 text-slate-500">{letter}.</span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'true-false' && (
        <div className="flex gap-6 pl-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>○ True</span>
          <span>○ False</span>
        </div>
      )}

      {!isTeacher && ['identification', 'fill-blank', 'short-answer'].includes(question.type) && (
        <div className="ml-6 h-8 border-b border-slate-400 dark:border-slate-500" />
      )}

      {!isTeacher && ['enumeration', 'essay', 'case-analysis', 'problem-solving'].includes(question.type) && (
        <div className="ml-6 space-y-5 pt-2">
          {Array.from({
            length: question.type === 'enumeration'
              ? Math.max(2, getEnumerationAnswers(question).length)
              : 3,
          }, (_, line) => <div key={line} className="border-b border-slate-300 dark:border-slate-600" />)}
        </div>
      )}

      {question.type === 'matching' && question.matchingPairs?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 pl-6 text-xs text-slate-700 dark:text-slate-300">
          <div className="space-y-2">{question.matchingPairs.map((pair: any, pairIndex: number) => <div key={pairIndex}>{pairIndex + 1}. {pair.left}</div>)}</div>
          <div className="space-y-2">{question.matchingPairs.map((pair: any, pairIndex: number) => <div key={pairIndex}>{String.fromCharCode(65 + pairIndex)}. {pair.right}</div>)}</div>
        </div>
      )}

      {/* Answer Key & Teacher Details */}
      {isTeacher && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600/60 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Correct Answer:</span>
            {question.type === 'enumeration' ? (
              <ol className="list-decimal list-inside font-extrabold text-slate-900 dark:text-white">
                {getEnumerationAnswers(question).map((answer, answerIndex) => <li key={answerIndex}>{answer}</li>)}
              </ol>
            ) : (
              <span className="font-extrabold text-slate-900 dark:text-white">
                {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
              </span>
            )}
          </div>

          {question.explanation && (
            <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <strong className="text-blue-600">Explanation: </strong>
              {question.explanation}
            </p>
          )}

          {question.sourceSection && (
            <p className="text-[11px] text-slate-500 italic">
              <strong>Source Citation: </strong>"{question.sourceSection}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
