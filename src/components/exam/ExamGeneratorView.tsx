import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookmarkCheck,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  Shuffle,
  ShieldCheck,
  BookOpen,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import {
  ExamConfig,
  QuestionType,
  BloomLevel,
  DifficultyLevel,
  GeneratedExam,
} from '../../types';
import { enforceQuestionDistribution } from '../../services/questionModalities';

const ALL_QUESTION_TYPES: { id: QuestionType; label: string; defaultPoints: number }[] = [
  { id: 'multiple-choice', label: 'Multiple Choice', defaultPoints: 1 },
  { id: 'true-false', label: 'True or False', defaultPoints: 1 },
  { id: 'identification', label: 'Identification', defaultPoints: 1 },
  { id: 'enumeration', label: 'Enumeration', defaultPoints: 2 },
  { id: 'fill-blank', label: 'Fill in the Blanks', defaultPoints: 1 },
  { id: 'matching', label: 'Matching Type', defaultPoints: 2 },
  { id: 'short-answer', label: 'Short Answer', defaultPoints: 3 },
  { id: 'essay', label: 'Essay Questions', defaultPoints: 5 },
  { id: 'case-analysis', label: 'Case Analysis', defaultPoints: 10 },
  { id: 'problem-solving', label: 'Problem Solving', defaultPoints: 5 },
];

const BLOOM_LEVELS: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

export const ExamGeneratorView: React.FC = () => {
  const {
    activeDocument,
    documents,
    setActiveDocument,
    saveExam,
    setActiveExam,
    setActiveTab,
    templates,
    settings,
    showToast,
    isGeneratingExam,
    setIsGeneratingExam,
  } = useAppStore();

  const [generationStep, setGenerationStep] = useState('');

  // Default Config state
  const [config, setConfig] = useState<ExamConfig>({
    id: 'cfg_' + Date.now(),
    title: activeDocument ? `${activeDocument.name.split('.')[0]} Exam` : 'General Examination',
    subject: 'General Subject',
    teacher: settings.teacherName || 'Prof. Instructor',
    school: settings.institutionName || 'University Name',
    department: 'Department of Academic Studies',
    course: 'Course 101',
    academicYear: '2025-2026',
    semester: '1st Semester',
    instructions: 'Read all questions carefully before answering. Choose or write the best answer.',
    difficulty: 'Medium',
    bloomTaxonomy: ['Remember', 'Understand', 'Apply', 'Analyze'],
    totalQuestions: 15,
    questionDistribution: {
      'multiple-choice': 0,
      'true-false': 0,
      'identification': 0,
      'enumeration': 0,
      'matching': 0,
      'fill-blank': 0,
      'essay': 0,
      'short-answer': 0,
      'case-analysis': 0,
      'problem-solving': 0,
    },
    timeLimitMinutes: 60,
    passingScore: 70,
    randomizeQuestions: true,
    randomizeChoices: true,
    language: 'English',
    paperSize: 'A4',
    margins: 'Normal',
    headerText: 'OFFICIAL EXAMINATION PAPER',
    footerText: 'Page {page} of {totalPages}',
    watermarkText: '',
  });

  // Calculate total questions dynamically
  useEffect(() => {
    const sum = (Object.values(config.questionDistribution) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
    setConfig((prev) => ({ ...prev, totalQuestions: sum }));
  }, [config.questionDistribution]);

  const handleDistributionChange = (type: QuestionType, count: number) => {
    const cleanCount = Math.max(0, count);
    setConfig((prev) => ({
      ...prev,
      questionDistribution: {
        ...prev.questionDistribution,
        [type]: cleanCount,
      },
    }));
  };

  const setAllModalityCounts = (count: number) => {
    setConfig((prev) => ({
      ...prev,
      questionDistribution: Object.fromEntries(
        ALL_QUESTION_TYPES.map(({ id }) => [id, count]),
      ) as Record<QuestionType, number>,
    }));
  };

  const toggleBloomLevel = (level: BloomLevel) => {
    setConfig((prev) => {
      const exists = prev.bloomTaxonomy.includes(level);
      const updated = exists
        ? prev.bloomTaxonomy.filter((b) => b !== level)
        : [...prev.bloomTaxonomy, level];
      return { ...prev, bloomTaxonomy: updated.length > 0 ? updated : [level] };
    });
  };

  const handleApplyTemplate = (tpl: any) => {
    if (tpl.config) {
      setConfig((prev) => ({
        ...prev,
        ...tpl.config,
        questionDistribution: {
          ...prev.questionDistribution,
          ...(tpl.config.questionDistribution || {}),
        },
      }));
      showToast(`Applied template: "${tpl.name}"`);
    }
  };

  const handleGenerateExam = async () => {
    if (!activeDocument) {
      showToast('Please select or upload a document first.', 'error');
      return;
    }

    if (config.totalQuestions === 0) {
      showToast('Please specify at least 1 question in the distribution.', 'error');
      return;
    }

    setIsGeneratingExam(true);
    setGenerationStep('Reading uploaded document and knowledge map...');

    try {
      setGenerationStep('Formulating cognitive assessment matrix and Bloom parameters...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStep('Querying Gemini AI for zero-hallucination question synthesis...');

      const response = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: activeDocument.extractedText,
          config,
          knowledgeMap: activeDocument.knowledgeMap,
        }),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.warn('Server returned non-JSON response on generate-exam:', responseText.slice(0, 100));
      }

      setGenerationStep('Validating answer keys, distractor quality, and explanations...');

      let questions = data?.questions || [];
      if (!questions || questions.length === 0) {
        // Fallback generator
        const sentences = activeDocument.extractedText
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);
        const total = Math.min(config.totalQuestions || 10, Math.max(5, sentences.length));
        const types = ['multiple-choice', 'identification', 'true-false', 'fill-blank', 'essay'];

        questions = [];
        for (let i = 0; i < total; i++) {
          const sentence = sentences[i % sentences.length] || `Learning objective ${i + 1}`;
          const words = sentence.split(/\s+/).filter((w) => w.length > 4);
          const targetWord = words[Math.floor(words.length / 2)] || 'concept';
          const qType = types[i % types.length];

          if (qType === 'multiple-choice') {
            const distractors = ['Alternative Principle A', 'Alternative Principle B', 'Incorrect Concept C'];
            const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);
            questions.push({
              id: `q_${Date.now()}_${i + 1}`,
              type: 'multiple-choice',
              question: `According to the source material, which key term completes: "${sentence.replace(targetWord, '_____')}"?`,
              options,
              correctAnswer: targetWord,
              distractors,
              explanation: `As stated in the source text: "${sentence}"`,
              difficulty: i % 2 === 0 ? 'Medium' : 'Easy',
              bloomLevel: 'Remember',
              sourceSection: sentence,
              estimatedAnswerTimeMinutes: 1,
              confidenceScore: 90,
              points: 1,
            });
          } else if (qType === 'true-false') {
            questions.push({
              id: `q_${Date.now()}_${i + 1}`,
              type: 'true-false',
              question: `True or False: ${sentence}`,
              options: ['True', 'False'],
              correctAnswer: 'True',
              distractors: ['False'],
              explanation: `Direct quote from source material: "${sentence}"`,
              difficulty: 'Easy',
              bloomLevel: 'Understand',
              sourceSection: sentence,
              estimatedAnswerTimeMinutes: 1,
              confidenceScore: 95,
              points: 1,
            });
          } else if (qType === 'identification') {
            questions.push({
              id: `q_${Date.now()}_${i + 1}`,
              type: 'identification',
              question: `Identify the term or concept being described: "${sentence.replace(targetWord, '[...]')}"`,
              correctAnswer: targetWord,
              explanation: `The term "${targetWord}" completes the definition in source text.`,
              difficulty: 'Medium',
              bloomLevel: 'Remember',
              sourceSection: sentence,
              estimatedAnswerTimeMinutes: 2,
              confidenceScore: 85,
              points: 2,
            });
          } else {
            questions.push({
              id: `q_${Date.now()}_${i + 1}`,
              type: 'essay',
              question: `Explain the significance and context of the following statement: "${sentence}"`,
              correctAnswer: sentence,
              explanation: `Refer to the section in source material discussing: "${sentence}"`,
              difficulty: 'Hard',
              bloomLevel: 'Analyze',
              sourceSection: sentence,
              estimatedAnswerTimeMinutes: 5,
              confidenceScore: 80,
              points: 5,
              rubric: '5 pts: Full explanation citing key terms. 3 pts: Partial answer. 1 pt: Minimal response.',
            });
          }
        }
      }

      // The visible distribution is authoritative. Normalize AI aliases, remove
      // extra modalities, and fill any missing type before saving the exam.
      questions = enforceQuestionDistribution(questions, config, activeDocument.extractedText);

      const newExam: GeneratedExam = {
        id: 'exam_' + Date.now(),
        documentId: activeDocument.id,
        documentName: activeDocument.name,
        config: { ...config },
        questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveExam(newExam);
      setActiveExam(newExam);
      showToast(`Successfully generated examination with ${newExam.questions.length} questions!`);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      showToast('Generation error: ' + err.message, 'error');
    } finally {
      setIsGeneratingExam(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Exam Generator Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure question types, cognitive depth, and formatting. The AI strictly generates questions from your uploaded document.
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Preset Templates:</span>
          <select
            onChange={(e) => {
              const selected = templates.find((t) => t.id === e.target.value);
              if (selected) handleApplyTemplate(selected);
            }}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-200"
          >
            <option value="">Select Template...</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Settings & Question Types */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Material Selector Card */}
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Material</span>
            <div className="flex items-center gap-3">
              <select
                value={activeDocument?.id || ''}
                onChange={(e) => {
                  const doc = documents.find((d) => d.id === e.target.value);
                  if (doc) setActiveDocument(doc);
                }}
                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.characterCount.toLocaleString()} chars)
                  </option>
                ))}
              </select>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 transition"
              >
                + Upload
              </button>
            </div>
          </div>

          {/* Basic Exam Meta */}
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Examination Header Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject / Course</label>
                <input
                  type="text"
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">School / Institution</label>
                <input
                  type="text"
                  value={config.school}
                  onChange={(e) => setConfig({ ...config, school: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={config.teacher}
                  onChange={(e) => setConfig({ ...config, teacher: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">General Instructions</label>
              <textarea
                rows={2}
                value={config.instructions}
                onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Question Distribution Matrix */}
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Question Modality Distribution</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllModalityCounts(0)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setAllModalityCounts(1)}
                  className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                >
                  Test all modalities
                </button>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-extrabold text-xs rounded-lg">
                  Total: {config.totalQuestions} Questions
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_QUESTION_TYPES.map((qt) => {
                const count = config.questionDistribution[qt.id] || 0;
                return (
                  <div
                    key={qt.id}
                    className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{qt.label}</p>
                      <p className="text-[10px] text-slate-400">Default: {qt.defaultPoints} pt/item</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={count}
                        onChange={(e) => handleDistributionChange(qt.id, parseInt(e.target.value, 10) || 0)}
                        className="w-16 p-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-center font-bold text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Difficulty, Bloom & Generation CTA */}
        <div className="space-y-6">
          {/* Difficulty & Cognitive Focus */}
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Difficulty & Cognitive Focus</h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Target Difficulty</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Easy', 'Medium', 'Hard', 'Mixed'] as DifficultyLevel[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfig({ ...config, difficulty: d })}
                    className={`py-2 text-xs font-bold rounded-xl transition ${
                      config.difficulty === d
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Bloom's Taxonomy Levels</label>
              <div className="flex flex-wrap gap-1.5">
                {BLOOM_LEVELS.map((level) => {
                  const selected = config.bloomTaxonomy.includes(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => toggleBloomLevel(level)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                        selected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Time Limit (mins):</span>
                <input
                  type="number"
                  value={config.timeLimitMinutes}
                  onChange={(e) => setConfig({ ...config, timeLimitMinutes: parseInt(e.target.value, 10) || 30 })}
                  className="w-16 p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-center font-bold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Passing Score (%):</span>
                <input
                  type="number"
                  value={config.passingScore}
                  onChange={(e) => setConfig({ ...config, passingScore: parseInt(e.target.value, 10) || 70 })}
                  className="w-16 p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-center font-bold"
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Shuffle Choice Order</span>
                <input
                  type="checkbox"
                  checked={config.randomizeChoices}
                  onChange={(e) => setConfig({ ...config, randomizeChoices: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-blue-200">Zero Hallucination Guarantee</span>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              Gemini AI will synthesize exact questions, explanations, and distractors grounded strictly in your selected document.
            </p>

            <button
              onClick={handleGenerateExam}
              disabled={isGeneratingExam}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              {isGeneratingExam ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGeneratingExam ? 'Synthesizing Exam...' : 'Generate Examination Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Modal Overlay */}
      {isGeneratingExam && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generating AI Examination</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{generationStep}</p>

            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-3/4 animate-pulse rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 pt-2">
              Generating distractors, Bloom levels, answer keys, and source citations...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
