import React from 'react';
import { useAppStore } from './hooks/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Toast } from './components/shared/Toast';

import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentUploadView } from './components/document/DocumentUploadView';
import { KnowledgeMapView } from './components/document/KnowledgeMapView';
import { ExamGeneratorView } from './components/exam/ExamGeneratorView';
import { ExamPreviewView } from './components/exam/ExamPreviewView';
import { ExamEditorView } from './components/exam/ExamEditorView';
import { QuestionBankView } from './components/bank/QuestionBankView';
import { TemplatesView } from './components/templates/TemplatesView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { StudentTakeExam } from './components/exam/StudentTakeExam';
import { SupportView } from './components/support/SupportView';
import { WelcomeView } from './components/welcome/WelcomeView';

export default function App() {
  const { activeTab } = useAppStore();

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'welcome':
        return <WelcomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'upload':
        return <DocumentUploadView />;
      case 'analysis':
        return <KnowledgeMapView />;
      case 'generate':
        return <ExamGeneratorView />;
      case 'preview':
      case 'exams':
        return <ExamPreviewView />;
      case 'editor':
        return <ExamEditorView />;
      case 'bank':
        return <QuestionBankView />;
      case 'templates':
        return <TemplatesView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'take-exam':
        return <StudentTakeExam />;
      case 'support':
        return <SupportView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <TopNav />
        <main className="flex-1 pb-12">{renderCurrentTab()}</main>
      </div>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
