import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  BrainCircuit,
  FileText,
  Database,
  BookmarkCheck,
  History,
  Settings,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useAppStore, ActiveTab } from '../../hooks/useAppStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeDocument, documents, exams } = useAppStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'upload', label: 'Upload Materials', icon: <FilePlus className="w-5 h-5" />, badge: documents.length },
    { id: 'analysis', label: 'AI Knowledge Map', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'generate', label: 'Generate Exam', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'exams', label: 'My Examinations', icon: <FileText className="w-5 h-5" />, badge: exams.length },
    { id: 'bank', label: 'Question Bank', icon: <Database className="w-5 h-5" /> },
    { id: 'templates', label: 'Exam Templates', icon: <BookmarkCheck className="w-5 h-5" /> },
    { id: 'history', label: 'Activity & History', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Branding', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            Exam<span className="text-blue-400 font-extrabold">Ease</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Smart Client Assessment</p>
        </div>
      </div>

      {/* Active Document Quick Status */}
      {activeDocument ? (
        <div className="mx-3 my-3 p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{activeDocument.name}</p>
            <p className="text-[11px] text-slate-400">{activeDocument.type} • {(activeDocument.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
      ) : (
        <div className="mx-3 my-3 p-3 bg-slate-800/40 border border-dashed border-slate-700/60 rounded-xl text-center">
          <p className="text-xs text-slate-400">No active document uploaded</p>
          <button
            onClick={() => setActiveTab('upload')}
            className="mt-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            + Upload Material
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Quick Take Exam CTA */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <button
          onClick={() => setActiveTab('take-exam')}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Interactive Exam Simulator</span>
        </button>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Local Storage Only</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
};
