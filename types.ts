
export enum ProcessingStatus {
  PENDING = 'PENDING',
  OCR_PROCESSING = 'OCR_PROCESSING',
  AI_PROCESSING = 'AI_PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocMetadata {
  court?: string;
  caseNumber?: string; // Normalized: TYPE 123-2024
  parties?: string;
  docType?: string;
  date?: string;
  summary?: string;
  folderPath?: string; 
}

export interface DocumentEntity {
  id: string;
  linkedCaseId?: string; // Foreign Key to CaseEntity
  file: File;
  originalName: string;
  currentName: string;
  size: number;
  uploadDate: number;
  status: ProcessingStatus;
  ocrText?: string;
  metadata?: DocMetadata;
  errorMessage?: string;
  icon?: string;
}

export interface CaseEntity {
  caseId: string;
  cnrNumber?: string; // 16-digit eCourt ID
  caseNumber: string; // The normalized identifier (e.g., WPPIL 161-2024)
  courtName: string;
  caseType: string;
  petitionerName: string;
  respondentName: string;
  status: 'Pending' | 'Disposed';
  currentStage: string;
  isUrgent: boolean;
  nextHearingDate?: string; // YYYY-MM-DD
  ecourtsData?: {
    nextHearingDate?: string;
    stage?: string;
    orders?: { date: string; title: string; url?: string }[];
    rawStatus?: string;
  };
  lastSyncedAt?: number;
}

export interface HearingEntity {
  hearingId: string;
  caseId: string; // Foreign Key
  hearingDate: string; // YYYY-MM-DD
  purpose: string; // e.g., "Arguments", "Evidence"
  judgeName?: string;
  itemNumber?: string;
  outcome?: string;
}

export interface CaseWithHearings {
  caseDetails: CaseEntity;
  hearings: HearingEntity[];
  documents: DocumentEntity[];
}

export interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
}

export interface FeeEntry {
  id: string;
  caseId: string;
  date: string;
  amount: number;
  description: string;
  category: 'Appearance' | 'Drafting' | 'Clerkage' | 'Filing' | 'Misc';
}

// --- NEW TYPES FOR SETTINGS & INDEXING ---

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  fontSize: 'small' | 'medium' | 'large';
  
  // AI Configuration
  aiStrictness: 'strict' | 'creative';
  namingTemplate: string; // e.g., "{YEAR}-{CASE}-{TYPE}"
  autoProcess: boolean; // Automatically start OCR/AI on import
  
  // Automation
  defaultCourt: string;
  backupFrequency: 'daily' | 'weekly' | 'manual';
  
  // System
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface ScannedFile {
  id: string;
  handle: FileSystemFileHandle;
  path: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  isImported: boolean;
}

export type ActiveTab = 'dashboard' | 'assistant' | 'cloud' | 'scanner' | 'settings' | 'search';
