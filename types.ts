export interface QualityObservation {
  relevanceScore: number;
  relevanceObservation: string;
  coherenceScore: number;
  coherenceObservation: string;
}

export interface KeyVocabulary {
  term: string;
  definition: string;
}

export interface ReviewQuestion {
  question: string;
  answer: string;
}

export interface SummaryResult {
  success: boolean;
  originalText: string;
  originalWords: number;
  originalChars: number;
  summary: string;
  summaryWords: number;
  summaryChars: number;
  reductionPercent: number;
  wordsSaved: number;
  readingTimeSavedSeconds: number;
  mainTopic: string;
  keyPoints: string[];
  quality: QualityObservation;
  keyVocabulary: KeyVocabulary[];
  reviewQuestions: ReviewQuestion[];
  modelUsed?: string;
  timestamp?: string;
}

export interface TestCase {
  id: string;
  subject: string;
  title: string;
  text: string;
  result?: SummaryResult;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export type SummaryLength = 'concise' | 'balanced' | 'detailed';
export type StudyFocus = 'study' | 'general' | 'technical' | 'exam';
export type ActiveTab = 'generator' | 'test-records' | 'python-code' | 'project-report';
