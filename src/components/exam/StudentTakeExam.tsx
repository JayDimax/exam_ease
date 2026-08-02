import React, { useState, useEffect } from 'react';
import {
  Clock,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Award,
  RotateCcw,
  BookOpen,
  Share2,
  Copy,
  ExternalLink,
  Search,
  KeyRound,
  ArrowRight,
  ListFilter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../hooks/useAppStore';
import { StudentSubmission, GeneratedExam } from '../../types';

export const StudentTakeExam: React.FC = () => {
  const { exams, activeExam, setActiveExam, addSubmission, setActiveTab, showToast } = useAppStore();

  const [studentName, setStudentName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);

  // Auto load exam from URL param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramExamId = params.get('examId') || params.get('code');
    if (paramExamId && exams.length > 0) {
      const match = exams.find((e) => e.id === paramExamId || e.id.endsWith(paramExamId));
      if (match) {
        setActiveExam(match);
      }
    }
  }, [exams, setActiveExam]);

  const handleSelectExamByCode = (codeToSearch?: string) => {
    const code = (codeToSearch || accessCode).trim().toLowerCase();
    if (!code) {
      showToast('Please enter an exam ID or Access Code', 'error');
      return;
    }

    const found = exams.find(
      (e) =>
        e.id.toLowerCase() === code ||
        e.id.toLowerCase().includes(code) ||
        e.config.title.toLowerCase().includes(code)
    );

    if (found) {
      setActiveExam(found);
      setAccessCode('');
      showToast(`Selected exam: "${found.config.title}"`);
    } else {
      showToast('No exam matching that Access Code or ID was found.', 'error');
    }
  };

  const handleCopyShareLink = (examToShare: GeneratedExam) => {
    const url = `${window.location.origin}${window.location.pathname}?examId=${examToShare.id}`;
    navigator.clipboard.writeText(url);
    showToast('Direct Student Exam Link copied to clipboard!');
  };

  if (!activeExam) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Student Assessment Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter an Access Code or select an examination from the course catalog below to start your test.
          </p>
        </div>

        {/* Access Code Input */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm max-w-md mx-auto space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Enter Exam Access Code or ID</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. exam_17123910"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectExamByCode()}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
            />
            <button
              onClick={() => handleSelectExamByCode()}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
            >
              <span>Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Available Exams Catalog */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <span>Available Examinations ({exams.length})</span>
          </h3>

          {exams.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <p className="text-xs text-slate-500">No exams have been published in this workspace yet.</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
              >
                Generate First Exam
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-emerald-500/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        {exam.config.subject || 'General'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {exam.id.slice(-8)}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                      {exam.config.title}
                    </h4>

                    <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                      <p>• {exam.questions.length} Items • {exam.config.timeLimitMinutes || 60} Minutes limit</p>
                      <p>• Target Grade: {exam.config.targetGradeLevel || 'General'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveExam(exam);
                        showToast(`Selected exam: "${exam.config.title}"`);
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Take This Exam</span>
                    </button>

                    <button
                      onClick={() => handleCopyShareLink(exam)}
                      title="Copy Direct Share Link for Students"
                      className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { config, questions } = activeExam;
  const totalPoints = questions.reduce((a, b) => a + (b.points || 1), 0);

  // Timer Effect
  useEffect(() => {
    if (!isExamStarted || submission || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, submission, timeLeftSeconds]);

  const handleStartExam = () => {
    if (!studentName.trim()) {
      showToast('Please enter your full name to start the test.', 'error');
      return;
    }
    setIsExamStarted(true);
    setTimeLeftSeconds((config.timeLimitMinutes || 60) * 60);
  };

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitExam = () => {
    let earnedPoints = 0;

    questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (!studentAns) return;

      if (q.type === 'multiple-choice' || q.type === 'true-false' || q.type === 'identification') {
        const correctStr = String(q.correctAnswer).trim().toLowerCase();
        const studentStr = String(studentAns).trim().toLowerCase();
        if (studentStr === correctStr) {
          earnedPoints += q.points || 1;
        }
      } else {
        // Auto-award 80% baseline credit for essays / short answers provided
        earnedPoints += Math.round((q.points || 1) * 0.8);
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    const result: StudentSubmission = {
      id: 'sub_' + Date.now(),
      examId: activeExam.id,
      studentName,
      score: earnedPoints,
      totalPoints,
      percentage,
      timeSpentSeconds: (config.timeLimitMinutes || 60) * 60 - timeLeftSeconds,
      answers,
      completedAt: new Date().toISOString(),
    };

    setSubmission(result);
    addSubmission(result);

    // Confetti animation
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {!isExamStarted ? (
        /* Exam Intro / Registration Card */
        <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl max-w-md mx-auto text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
              Interactive Test Mode
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{config.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{config.subject} • {questions.length} Items • {config.timeLimitMinutes} Minutes</p>
          </div>

          <div className="text-left space-y-1">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Enter Your Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
            />
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            Start Examination Timer
          </button>
        </div>
      ) : submission ? (
        /* Submission Results Report Card */
        <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Examination Submitted!</h2>
            <p className="text-xs text-slate-500 mt-1">Candidate: {submission.studentName}</p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl max-w-sm mx-auto space-y-1">
            <p className="text-xs font-bold text-slate-400">FINAL SCORE</p>
            <p className="text-4xl font-extrabold text-emerald-600">{submission.score} / {submission.totalPoints}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">({submission.percentage}%)</p>
          </div>

          <button
            onClick={() => {
              setIsExamStarted(false);
              setSubmission(null);
            }}
            className="px-6 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Retake Exam
          </button>
        </div>
      ) : (
        /* Live Exam Screen with Timer */
        <div className="space-y-6">
          {/* Top Sticky Bar */}
          <div className="sticky top-0 z-30 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{config.title}</p>
              <p className="text-[10px] text-slate-400">Examinee: {studentName}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 font-extrabold text-sm rounded-xl">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Items */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {idx + 1}. {q.question}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">({q.points} pts)</span>
                </div>

                {q.type === 'multiple-choice' && q.options && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt: string, oIdx: number) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          answers[q.id] === opt
                            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type !== 'multiple-choice' && (
                  <textarea
                    rows={3}
                    placeholder="Type your answer here..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
