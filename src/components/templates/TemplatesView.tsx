import React from 'react';
import { BookmarkCheck, Plus, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const TemplatesView: React.FC = () => {
  const { templates, deleteTemplate, setActiveTab, showToast } = useAppStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Exam Templates Library
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Preset assessment structures and saved custom configurations for fast one-click exam generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                    tpl.isPreset
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                  }`}
                >
                  {tpl.isPreset ? 'Built-in Preset' : 'Custom Template'}
                </span>

                {!tpl.isPreset && (
                  <button
                    onClick={() => {
                      deleteTemplate(tpl.id);
                      showToast('Deleted template.');
                    }}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{tpl.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tpl.description}</p>
            </div>

            <button
              onClick={() => {
                setActiveTab('generate');
                showToast(`Loaded template: "${tpl.name}"`);
              }}
              className="mt-5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <span>Use Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
