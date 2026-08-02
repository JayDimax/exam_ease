import { create } from 'zustand';
import {
  DocumentMetadata,
  GeneratedExam,
  ExamTemplate,
  QuestionBankItem,
  UserSettings,
  ActivityLog,
  StudentSubmission,
  ExamConfig,
  Question,
  QualityAnalysis,
} from '../types';
import { StorageService } from '../services/storage';

export type ActiveTab =
  | 'dashboard'
  | 'upload'
  | 'analysis'
  | 'generate'
  | 'exams'
  | 'preview'
  | 'editor'
  | 'bank'
  | 'templates'
  | 'history'
  | 'settings'
  | 'take-exam';

interface AppStore {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Documents
  documents: DocumentMetadata[];
  activeDocument: DocumentMetadata | null;
  setActiveDocument: (doc: DocumentMetadata | null) => void;
  addDocument: (doc: DocumentMetadata) => void;
  deleteDocument: (id: string) => void;

  // Exams
  exams: GeneratedExam[];
  activeExam: GeneratedExam | null;
  setActiveExam: (exam: GeneratedExam | null) => void;
  saveExam: (exam: GeneratedExam) => void;
  deleteExam: (id: string) => void;
  toggleFavoriteExam: (id: string) => void;
  updateExamQuestions: (examId: string, questions: Question[]) => void;
  setExamQualityAnalysis: (examId: string, analysis: QualityAnalysis) => void;

  // Question Bank
  questionBank: QuestionBankItem[];
  addToQuestionBank: (item: QuestionBankItem) => void;
  bulkAddToQuestionBank: (items: QuestionBankItem[]) => void;
  removeFromQuestionBank: (id: string) => void;

  // Templates
  templates: ExamTemplate[];
  saveTemplate: (template: ExamTemplate) => void;
  deleteTemplate: (id: string) => void;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Submissions (Student Mode)
  submissions: StudentSubmission[];
  addSubmission: (sub: StudentSubmission) => void;

  // Activity
  activityLogs: ActivityLog[];
  refreshActivityLogs: () => void;

  // AI Loading States
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  isGeneratingExam: boolean;
  setIsGeneratingExam: (v: boolean) => void;
  analysisProgressMessage: string;
  setAnalysisProgressMessage: (msg: string) => void;

  // Toast / Banner
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Documents
  documents: StorageService.getDocuments(),
  activeDocument: StorageService.getDocuments()[0] || null,
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  addDocument: (doc) => {
    const updated = StorageService.saveDocument(doc);
    set({ documents: updated, activeDocument: doc });
  },
  deleteDocument: (id) => {
    const updated = StorageService.deleteDocument(id);
    const currentActive = get().activeDocument;
    set({
      documents: updated,
      activeDocument: currentActive?.id === id ? updated[0] || null : currentActive,
    });
  },

  // Exams
  exams: StorageService.getExams(),
  activeExam: StorageService.getExams()[0] || null,
  setActiveExam: (exam) => set({ activeExam: exam }),
  saveExam: (exam) => {
    const updated = StorageService.saveExam(exam);
    set({ exams: updated, activeExam: exam });
  },
  deleteExam: (id) => {
    const updated = StorageService.deleteExam(id);
    const currentActive = get().activeExam;
    set({
      exams: updated,
      activeExam: currentActive?.id === id ? updated[0] || null : currentActive,
    });
  },
  toggleFavoriteExam: (id) => {
    const updated = StorageService.toggleFavoriteExam(id);
    const currentActive = get().activeExam;
    set({
      exams: updated,
      activeExam: currentActive?.id === id ? { ...currentActive, isFavorite: !currentActive.isFavorite } : currentActive,
    });
  },
  updateExamQuestions: (examId, questions) => {
    const exams = get().exams;
    const target = exams.find((e) => e.id === examId);
    if (target) {
      const updatedExam: GeneratedExam = {
        ...target,
        questions,
        updatedAt: new Date().toISOString(),
      };
      const updatedExams = StorageService.saveExam(updatedExam);
      set({ exams: updatedExams, activeExam: updatedExam });
    }
  },
  setExamQualityAnalysis: (examId, analysis) => {
    const exams = get().exams;
    const target = exams.find((e) => e.id === examId);
    if (target) {
      const updatedExam: GeneratedExam = {
        ...target,
        qualityAnalysis: analysis,
        updatedAt: new Date().toISOString(),
      };
      const updatedExams = StorageService.saveExam(updatedExam);
      set({ exams: updatedExams, activeExam: updatedExam });
    }
  },

  // Question Bank
  questionBank: StorageService.getQuestionBank(),
  addToQuestionBank: (item) => {
    const updated = StorageService.saveToQuestionBank(item);
    set({ questionBank: updated });
  },
  bulkAddToQuestionBank: (items) => {
    const updated = StorageService.bulkSaveToBank(items);
    set({ questionBank: updated });
  },
  removeFromQuestionBank: (id) => {
    const updated = StorageService.deleteQuestionBankItem(id);
    set({ questionBank: updated });
  },

  // Templates
  templates: StorageService.getTemplates(),
  saveTemplate: (template) => {
    const updated = StorageService.saveTemplate(template);
    set({ templates: updated });
  },
  deleteTemplate: (id) => {
    const updated = StorageService.deleteTemplate(id);
    set({ templates: updated });
  },

  // Settings
  settings: StorageService.getSettings(),
  updateSettings: (newSettings) => {
    const current = get().settings;
    const updated = StorageService.saveSettings({ ...current, ...newSettings });
    set({ settings: updated });
  },

  // Submissions
  submissions: StorageService.getSubmissions(),
  addSubmission: (sub) => {
    const updated = StorageService.saveSubmission(sub);
    set({ submissions: updated });
  },

  // Activities
  activityLogs: StorageService.getActivityLogs(),
  refreshActivityLogs: () => set({ activityLogs: StorageService.getActivityLogs() }),

  // Loading States
  isAnalyzing: false,
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  isGeneratingExam: false,
  setIsGeneratingExam: (v) => set({ isGeneratingExam: v }),
  analysisProgressMessage: '',
  setAnalysisProgressMessage: (msg) => set({ analysisProgressMessage: msg }),

  // Toast
  toastMessage: null,
  showToast: (text, type = 'success') => {
    set({ toastMessage: { text, type } });
    setTimeout(() => {
      if (get().toastMessage?.text === text) {
        set({ toastMessage: null });
      }
    }, 4000);
  },
  clearToast: () => set({ toastMessage: null }),
}));
