import React from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useAppStore();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-red-600 text-white shadow-red-500/20',
    info: 'bg-blue-600 text-white shadow-blue-500/20',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl font-medium text-xs max-w-md ${
          bgStyles[toastMessage.type]
        }`}
      >
        {icons[toastMessage.type]}
        <span className="flex-1">{toastMessage.text}</span>
        <button
          onClick={clearToast}
          className="p-1 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
