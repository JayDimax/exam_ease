import React from 'react';
import { History, Download, Upload, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { StorageService } from '../../services/storage';

export const HistoryView: React.FC = () => {
  const { activityLogs, refreshActivityLogs, showToast } = useAppStore();

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamGenAI_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported complete LocalStorage backup JSON.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const ok = StorageService.importDataFromJson(evt.target?.result as string);
      if (ok) {
        showToast('Successfully imported LocalStorage data backup! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Invalid backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Activity Log & Data Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export or restore full application backups stored safely in browser LocalStorage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition">
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup</span>
          </button>
        </div>
      </div>

      {/* Activity Log Timeline */}
      <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Activity Timeline ({activityLogs.length} events logged)</span>
        </h3>

        <div className="space-y-3">
          {activityLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No activity logged yet.</p>
          ) : (
            activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                  <p className="text-[11px] text-slate-500">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
