import {
  DocumentMetadata,
  GeneratedExam,
  ExamTemplate,
  QuestionBankItem,
  UserSettings,
  ActivityLog,
  StudentSubmission,
} from '../types';
import { normalizeEnumerationQuestion } from './enumeration';

const STORAGE_KEYS = {
  DOCUMENTS: 'ai_exam_documents',
  EXAMS: 'ai_exam_generated_exams',
  QUESTION_BANK: 'ai_exam_question_bank',
  TEMPLATES: 'ai_exam_templates',
  SETTINGS: 'ai_exam_user_settings',
  ACTIVITY: 'ai_exam_activity_logs',
  SUBMISSIONS: 'ai_exam_student_submissions',
};

function normalizeStoredExam(exam: GeneratedExam): GeneratedExam {
  return {
    ...exam,
    questions: Array.isArray(exam.questions)
      ? exam.questions.map((question) => normalizeEnumerationQuestion(question))
      : [],
  };
}

function normalizeStoredBankItem(item: QuestionBankItem): QuestionBankItem {
  return { ...item, question: normalizeEnumerationQuestion(item.question) };
}

// Default Settings
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  defaultLanguage: 'English',
  defaultPaperSize: 'A4',
  defaultMargins: 'Normal',
  institutionName: 'State University & Colleges',
  institutionLogoUrl: '',
  teacherName: 'Prof. Alexander Wright',
  autosave: true,
};

// Preset Templates
export const DEFAULT_TEMPLATES: ExamTemplate[] = [
  {
    id: 'preset-standard-midterm',
    name: 'Standard Midterm Examination',
    description: 'Balanced 30-question assessment (20 MC, 5 True/False, 3 Identification, 2 Essay)',
    isPreset: true,
    config: {
      title: 'Midterm Examination',
      difficulty: 'Medium',
      totalQuestions: 30,
      timeLimitMinutes: 60,
      passingScore: 70,
      paperSize: 'A4',
      questionDistribution: {
        'multiple-choice': 20,
        'true-false': 5,
        'identification': 3,
        'enumeration': 0,
        'matching': 0,
        'fill-blank': 0,
        'essay': 2,
        'short-answer': 0,
        'case-analysis': 0,
        'problem-solving': 0,
      },
    },
  },
  {
    id: 'preset-quick-quiz',
    name: 'Quick Diagnostic Quiz',
    description: 'Fast 10-item quiz (8 Multiple Choice, 2 Fill-in-the-Blank)',
    isPreset: true,
    config: {
      title: 'Diagnostic Quiz',
      difficulty: 'Easy',
      totalQuestions: 10,
      timeLimitMinutes: 15,
      passingScore: 75,
      paperSize: 'A4',
      questionDistribution: {
        'multiple-choice': 8,
        'true-false': 0,
        'identification': 0,
        'enumeration': 0,
        'matching': 0,
        'fill-blank': 2,
        'essay': 0,
        'short-answer': 0,
        'case-analysis': 0,
        'problem-solving': 0,
      },
    },
  },
  {
    id: 'preset-comprehensive-final',
    name: 'Comprehensive Final Exam',
    description: 'High-rigor 50-item exam combining all question modalities',
    isPreset: true,
    config: {
      title: 'Final Examination',
      difficulty: 'Hard',
      totalQuestions: 50,
      timeLimitMinutes: 120,
      passingScore: 75,
      paperSize: 'A4',
      questionDistribution: {
        'multiple-choice': 25,
        'true-false': 10,
        'identification': 5,
        'enumeration': 3,
        'matching': 5,
        'fill-blank': 0,
        'essay': 2,
        'short-answer': 0,
        'case-analysis': 0,
        'problem-solving': 0,
      },
    },
  },
];

export class StorageService {
  // --- DOCUMENTS ---
  static getDocuments(): DocumentMetadata[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDocument(doc: DocumentMetadata): DocumentMetadata[] {
    const docs = this.getDocuments();
    const existingIdx = docs.findIndex((d) => d.id === doc.id);
    if (existingIdx >= 0) {
      docs[existingIdx] = doc;
    } else {
      docs.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    this.addActivityLog('upload', `Uploaded document "${doc.name}"`, doc.name);
    return docs;
  }

  static deleteDocument(id: string): DocumentMetadata[] {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    return docs;
  }

  // --- EXAMS ---
  static getExams(): GeneratedExam[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return data ? (JSON.parse(data) as GeneratedExam[]).map(normalizeStoredExam) : [];
    } catch {
      return [];
    }
  }

  static saveExam(exam: GeneratedExam): GeneratedExam[] {
    exam = normalizeStoredExam(exam);
    const exams = this.getExams();
    const existingIdx = exams.findIndex((e) => e.id === exam.id);
    if (existingIdx >= 0) {
      exams[existingIdx] = exam;
    } else {
      exams.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    this.addActivityLog('generate', `Saved exam "${exam.config.title}"`, exam.config.title);
    return exams;
  }

  static deleteExam(id: string): GeneratedExam[] {
    const exams = this.getExams().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return exams;
  }

  static toggleFavoriteExam(id: string): GeneratedExam[] {
    const exams = this.getExams();
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      exam.isFavorite = !exam.isFavorite;
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    }
    return exams;
  }

  // --- QUESTION BANK ---
  static getQuestionBank(): QuestionBankItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTION_BANK);
      return data ? (JSON.parse(data) as QuestionBankItem[]).map(normalizeStoredBankItem) : [];
    } catch {
      return [];
    }
  }

  static saveToQuestionBank(item: QuestionBankItem): QuestionBankItem[] {
    item = normalizeStoredBankItem(item);
    const bank = this.getQuestionBank();
    if (!bank.some((b) => b.id === item.id)) {
      bank.unshift(item);
      localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(bank));
      this.addActivityLog('bank', `Saved question to bank`, item.question.question.slice(0, 30));
    }
    return bank;
  }

  static bulkSaveToBank(items: QuestionBankItem[]): QuestionBankItem[] {
    items = items.map(normalizeStoredBankItem);
    const bank = this.getQuestionBank();
    const existingIds = new Set(bank.map((b) => b.id));
    const newItems = items.filter((i) => !existingIds.has(i.id));
    const updated = [...newItems, ...bank];
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(updated));
    return updated;
  }

  static deleteQuestionBankItem(id: string): QuestionBankItem[] {
    const bank = this.getQuestionBank().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(bank));
    return bank;
  }

  // --- TEMPLATES ---
  static getTemplates(): ExamTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      const userTemplates = data ? JSON.parse(data) : [];
      return [...DEFAULT_TEMPLATES, ...userTemplates];
    } catch {
      return DEFAULT_TEMPLATES;
    }
  }

  static saveTemplate(template: ExamTemplate): ExamTemplate[] {
    const templates = this.getTemplates().filter((t) => !t.isPreset);
    const existingIdx = templates.findIndex((t) => t.id === template.id);
    if (existingIdx >= 0) {
      templates[existingIdx] = template;
    } else {
      templates.unshift(template);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return this.getTemplates();
  }

  static deleteTemplate(id: string): ExamTemplate[] {
    const userTemplates = this.getTemplates()
      .filter((t) => !t.isPreset && t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(userTemplates));
    return this.getTemplates();
  }

  // --- SETTINGS ---
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): UserSettings {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  // --- SUBMISSIONS ---
  static getSubmissions(): StudentSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSubmission(submission: StudentSubmission): StudentSubmission[] {
    const list = this.getSubmissions();
    list.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return list;
  }

  // --- ACTIVITIES ---
  static getActivityLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addActivityLog(type: ActivityLog['type'], action: string, details: string) {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      action,
      details,
      type,
    };
    logs.unshift(newLog);
    // Keep last 100 activities
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(logs.slice(0, 100)));
  }

  // --- EXPORT ALL BACKUP / IMPORT ---
  static exportAllDataAsJson(): string {
    const data = {
      documents: this.getDocuments(),
      exams: this.getExams(),
      questionBank: this.getQuestionBank(),
      templates: this.getTemplates().filter((t) => !t.isPreset),
      settings: this.getSettings(),
      activities: this.getActivityLogs(),
      submissions: this.getSubmissions(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importDataFromJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.documents) localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.documents));
      if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      if (data.questionBank) localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(data.questionBank));
      if (data.templates) localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.submissions) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  }
}
