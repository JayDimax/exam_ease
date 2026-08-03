import React from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

const features = [
  {
    icon: FileText,
    title: 'Bring your own materials',
    description: 'Upload lessons and turn them into ready-to-use assessments.',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
  },
  {
    icon: BrainCircuit,
    title: 'Generate with confidence',
    description: 'Create balanced questions guided by learning objectives.',
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  },
  {
    icon: BookOpenCheck,
    title: 'Review, edit, and export',
    description: 'Polish every exam before sharing it with your learners.',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
];

export const WelcomeView: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-28 -top-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-600/15" />
        <div className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b0b_1px,transparent_1px),linear-gradient(to_bottom,#64748b0b_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-none tracking-tight">Exam<span className="text-blue-600 dark:text-blue-400">Ease</span></p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Assessment workspace</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur sm:flex dark:border-emerald-800/60 dark:bg-slate-900/70 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Your work stays in your browser
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-12 pt-8 lg:min-h-[calc(100vh-160px)] lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-20 lg:pt-4">
        <section className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-300">
            <Sparkles className="h-4 w-4" />
            Smarter assessment creation starts here
          </div>

          <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Build better exams,
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">in less time.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Turn your teaching materials into thoughtful, classroom-ready assessments with an AI-assisted workspace made for educators.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:translate-y-0"
            >
              Open your workspace
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 sm:justify-start dark:text-slate-400">
              <Check className="h-4 w-4 text-emerald-500" />
              Free to use · No account required
            </span>
          </div>
        </section>

        <section className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-500/15 to-violet-500/15 blur-2xl" aria-hidden="true" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:p-7 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/30">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Your workflow</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight">From lesson to assessment</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-blue-900/60 dark:hover:shadow-black/20">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">0{index + 1}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-white dark:from-blue-700 dark:to-indigo-800">
              <p className="text-xs font-bold">Designed around the way educators work.</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-300 dark:text-blue-100">Create, organize, preview, and export—without leaving your workspace.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-t border-slate-200/70 px-6 py-5 text-[11px] font-medium text-slate-400 lg:px-10 dark:border-slate-800">
        <span>© {new Date().getFullYear()} ExamEase</span>
        <span>Built for teachers, made for learning.</span>
      </footer>
    </div>
  );
};
