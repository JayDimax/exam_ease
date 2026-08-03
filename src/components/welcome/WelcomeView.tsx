import React from 'react';
import {
  GraduationCap,
  Code2,
  UserX,
  HardDrive,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const WelcomeView: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Single Section Welcome Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transform hover:scale-105 transition">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome to ExamEase
            </h1>

            <p className="text-sm md:text-base text-blue-100 font-medium max-w-lg mx-auto">
              Smart Client Assessment & AI Exam Generator for Educators
            </p>
          </div>
        </div>

        {/* Section Body: Notice Details */}
        <div className="p-6 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Important Application Notice</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Please review the key information below regarding application usage, privacy, and development status.
            </p>
          </div>

          {/* Grid of Key Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notice 1: Open Source */}
            <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Open Source Application
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ExamEase is completely open source and free for educators, teachers, and schools worldwide.
                </p>
              </div>
            </div>

            {/* Notice 2: No Login Required */}
            <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Login Required
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Start generating exams and analyzing documents immediately without creating an account or signing in.
                </p>
              </div>
            </div>

            {/* Notice 3: Local Storage */}
            <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local Storage Persisted
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Local storage is being used for every user. All documents, generated exams, and question banks are stored safely inside your browser.
                </p>
              </div>
            </div>

            {/* Notice 4: Beta Mode Notice */}
            <div className="flex items-start gap-3.5 p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Beta Mode & Updates
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This application is currently in beta mode and will be updated without prior notice as new features and fixes are rolled out.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Action to Proceed to Dashboard */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mx-auto transition-all duration-200"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <hr className="border-slate-200 dark:border-slate-700/80" />

          {/* Bottom of Section: Credit */}
          <div className="text-center pt-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Developed By: JBD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
