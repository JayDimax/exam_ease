import React from 'react';
import { Settings, Building2, Sun, Moon, Save, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showToast } = useAppStore();

  const handleSave = () => {
    showToast('Settings and institution branding updated!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Institution Branding
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize school headers, instructor defaults, paper sizes, and application themes.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-6">
        {/* Branding Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Institution Header Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Institution / School Name
              </label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={(e) => updateSettings({ institutionName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Default Instructor Name
              </label>
              <input
                type="text"
                value={settings.teacherName}
                onChange={(e) => updateSettings({ teacherName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Paper Size & Layout Defaults */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Print & Document Defaults</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Paper Size</label>
              <select
                value={settings.defaultPaperSize}
                onChange={(e) => updateSettings({ defaultPaperSize: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Letter">Letter (8.5 x 11 in)</option>
                <option value="Legal">Legal (8.5 x 14 in)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Default Language</label>
              <input
                type="text"
                value={settings.defaultLanguage}
                onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
