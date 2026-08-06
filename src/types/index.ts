export type QuestionType =
  | 'multiple-choice'
  | 'identification'
  | 'enumeration'
  | 'matching'
  | 'fill-blank'
  | 'true-false'
  | 'essay'
  | 'short-answer'
  | 'case-analysis'
  | 'problem-solving';

export type BloomLevel =
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Analyze'
  | 'Evaluate'
  | 'Create';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  /** Canonical answer list for enumeration questions. */
  enumerationAnswers?: string[];
  /** Alternative spellings/labels aligned by index with enumerationAnswers. */
  enumerationAnswerVariations?: string[][];
  enumerationOrderMatters?: boolean;
  distractors?: string[];
  explanation: string;
  difficulty: DifficultyLevel;
  bloomLevel: BloomLevel;
  sourceSection?: string;
  estimatedAnswerTimeMinutes?: number;
  confidenceScore?: number;
  points: number;
  rubric?: string;
  acceptableVariations?: string[];
  matchingPairs?: MatchingPair[];
}

export interface ExamConfig {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  school: string;
  department: string;
  course: string;
  academicYear: string;
  semester: string;
  instructions: string;
  difficulty: DifficultyLevel;
  bloomTaxonomy: BloomLevel[];
  totalQuestions: number;
  questionDistribution: Record<QuestionType, number>;
  timeLimitMinutes: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeChoices: boolean;
  language: string;
  targetGradeLevel?: string;
  paperSize: 'A4' | 'Letter' | 'Legal';
  margins: 'Normal' | 'Compact' | 'Wide';
  headerText: string;
  footerText: string;
  watermarkText: string;
}

export interface TopicItem {
  name: string;
  subtopics: string[];
  importance?: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface KnowledgeMap {
  summary: string;
  language: string;
  readingTimeMinutes: number;
  complexityScore: number;
  difficultyEstimate: string;
  confidenceScore: number;
  topics: TopicItem[];
  learningObjectives: string[];
  definitions: DefinitionItem[];
  keywords: string[];
  importantConcepts: string[];
  formulas?: string[];
  importantDates?: string[];
  processes?: string[];
  relationships?: string[];
  examples?: string[];
  terminologies?: string[];
}

export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  extractedText: string;
  knowledgeMap?: KnowledgeMap;
  characterCount: number;
  wordCount: number;
  sourceUrl?: string;
}

export interface QualityAnalysis {
  overallQualityScore: number;
  distractorQualityScore: number;
  coveragePercentage: number;
  duplicatesDetected: string[];
  improvementSuggestions: string[];
  grammarIssues?: string[];
  summary: string;
}

export interface GeneratedExam {
  id: string;
  documentId: string;
  documentName: string;
  config: ExamConfig;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  version?: number;
  qualityAnalysis?: QualityAnalysis;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<ExamConfig>;
  isPreset?: boolean;
}

export interface QuestionBankItem {
  id: string;
  question: Question;
  subject: string;
  topic: string;
  createdAt: string;
  tags: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'blue' | 'system';
  defaultLanguage: string;
  defaultPaperSize: 'A4' | 'Letter' | 'Legal';
  defaultMargins: 'Normal' | 'Compact' | 'Wide';
  institutionName: string;
  institutionLogoUrl: string;
  teacherName: string;
  autosave: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'upload' | 'generate' | 'edit' | 'export' | 'bank';
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Record<string, any>;
  completedAt: string;
}
