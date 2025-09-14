export interface User {
  id: string;
  username: string;
  role: 'admin' | 'finance' | 'hr' | 'legal' | 'technical';
  email: string;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  category: DocumentCategory;
  uploadDate: string;
  uploader: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  summary: string;
  metadata: DocumentMetadata;
  content: string;
  embedding?: number[];
}

export type DocumentCategory = 
  | 'Finance' 
  | 'HR' 
  | 'Legal' 
  | 'Contracts' 
  | 'Technical Reports' 
  | 'Invoices'
  | 'Other';

export interface DocumentMetadata {
  title: string;
  author: string;
  date?: string;
  entities: {
    people: string[];
    organizations: string[];
    amounts: string[];
    dates: string[];
  };
  keywords: string[];
}

export interface SearchResult {
  document: Document;
  score: number;
  snippet: string;
}

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}