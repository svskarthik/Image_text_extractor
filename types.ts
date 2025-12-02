export enum ExtractionMode {
  TEXT = 'text',
  FORMS = 'forms',
  TABLES = 'tables'
}

export interface ExtractedData {
  rawText?: string;
  forms?: Array<{ key: string; value: string }>;
  tables?: Array<Array<string[]>>; // Array of tables, each table is array of rows, each row is array of cells
  summary?: string;
  error?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  stage: string; // 'uploading' | 'analyzing' | 'summarizing' | 'complete'
}

export interface FileData {
  file: File;
  previewUrl: string;
}
