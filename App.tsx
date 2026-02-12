import React, { useState } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import ProfessorCard from './components/ProfessorCard';
import { Professor, SearchState, SearchFilters } from './types';
import { searchProfessors } from './services/geminiService';
import { SearchX, AlertCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    results: [],
    hasSearched: false,
  });

  const handleSearch = async (keywords: string[], filters: SearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const results = await searchProfessors(keywords, filters);
      
      // Sort by match score descending by default
      const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);
      
      setState({
        loading: false,
        error: null,
        results: sortedResults,
        hasSearched: true,
      });
    } catch (error: any) {
      setState({
        loading: false,
        error: error.message || "An unexpected error occurred while fetching data.",
        results: [],
        hasSearched: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <Sparkles className="w-3 h-3" /> AI-Powered PhD Search
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">PhD Advisor</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Leverage AI to scan top US universities and discover professors matching your specific research interests, ranked by relevance.
          </p>
        </div>

        <SearchInput onSearch={handleSearch} isLoading={state.loading} />

        <div className="mt-12">
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-red-800 mb-1">Search Failed</h3>
              <p className="text-red-600">{state.error}</p>
            </div>
          )}

          {!state.loading && state.hasSearched && state.results.length === 0 && !state.error && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto">
              <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No professors found</h3>
              <p className="text-slate-500 mt-2">
                We couldn't find exact matches for your keywords. Try broadening your terms or using more general field names.
              </p>
            </div>
          )}

          {state.results.length > 0 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Top Matches <span className="bg-slate-200 text-slate-700 text-sm py-0.5 px-2 rounded-full">{state.results.length}</span>
                </h3>
                <span className="text-sm text-slate-500">Sorted by AI Match Score</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {state.results.map((prof, index) => (
                  <ProfessorCard key={prof.id} professor={prof} rank={index + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ScholarMatch AI. Powered by Gemini 3.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;