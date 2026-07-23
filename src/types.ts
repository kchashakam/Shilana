export interface Medicine {
  id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  purpose?: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  specialty: string;
  area: string;
  notes: string;
  image: string; // Base64 or URL
  createdAt: string; // ISO date string
  patientName?: string;
  medicines?: Medicine[];
  aiAnalysis?: AIAnalysisResult;
  isFavorite?: boolean;
}

export interface AIAnalysisResult {
  doctorName: string;
  specialty: string;
  area: string;
  handwritingMatch: string;
  medicines: Medicine[];
  aiSummary: string;
  warnings: string[];
  confidenceScore?: number;
}

export type FilterCategory = 'all' | 'favorites' | 'recent';
