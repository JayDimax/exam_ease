import React, { useState } from 'react';
import {
  Upload,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  Building2,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const TopNav: React.FC = () => {
  const {
    documents,
    activeDocument,
    setActiveDocument,
    setActiveTab,
    settings,
    updateSettings,
    activityLogs,
  } = useAppStore();

  const [showDocMenu, setShowDocMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'blue' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Active Material Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowDocMenu(!showDocMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="max-w-[180px] truncate">
              {activeDocument ? activeDocument.name : 'Select Active Material'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showDocMenu && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Uploaded Documents ({documents.length})
                </span>
                <button
                  onClick={() => {
                    setShowDocMenu(false);
                    setActiveTab('upload');
                  }}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  + Upload New
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {documents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No documents uploaded yet</div>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDocument(doc);
                        setShowDocMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition ${
                        activeDocument?.id === doc.id ? 'bg-blue-50/80 dark:bg-blue-900/20 font-semibold text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.type} • {doc.characterCount.toLocaleString()} chars</p>
                      </div>
                      {activeDocument?.id === doc.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveTab('generate')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Generate</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Institution Info */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.institutionName || 'School'}</span>
        </div>

        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell className="w-4 h-4" />
            {activityLogs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recent Activity</span>
                <span className="text-[10px] text-slate-400">LocalStorage Log</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No activity logged yet</p>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{log.details}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructor Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {settings.teacherName ? settings.teacherName.charAt(0) : 'T'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{settings.teacherName}</p>
            <p className="text-[10px] text-slate-400">Instructor</p>
          </div>
        </div>
      </div>
    </header>
  );
};
