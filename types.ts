export interface Professor {
  id: string;
  name: string;
  university: string;
  department?: string;
  matchScore: number;
  matchReason: string;
  websiteUrl: string;
  researchInterests: string[];
  summary: string;
  relevantPapers?: string[];
}

export interface SearchFilters {
  rankingRange: string;
  department: string;
}

export interface SearchState {
  loading: boolean;
  error: string | null;
  results: Professor[];
  hasSearched: boolean;
}