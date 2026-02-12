import React, { useState, KeyboardEvent } from 'react';
import { Search, X, Plus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchInputProps {
  onSearch: (keywords: string[], filters: SearchFilters) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    rankingRange: 'Top 50',
    department: 'Computer Science'
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 5) {
      setKeywords([...keywords, trimmed]);
      setInputValue('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleSearchClick = () => {
    if (keywords.length > 0) {
      onSearch(keywords, filters);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Research Direction Keywords
        </label>
        <p className="text-xs text-slate-500 mb-4">
          Enter 3-4 specific topics (e.g., "Computer Vision", "Reinforcement Learning").
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((keyword) => (
            <span 
              key={keyword} 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {keyword}
              <button 
                onClick={() => removeKeyword(keyword)}
                className="ml-2 hover:text-indigo-900 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="relative flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-800 placeholder-slate-400"
              placeholder={keywords.length >= 5 ? "Max 5 keywords reached" : "Type a keyword and press Enter..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || keywords.length >= 5}
            />
            <button
              onClick={addKeyword}
              disabled={!inputValue.trim() || keywords.length >= 5}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleSearchClick}
            disabled={isLoading || keywords.length === 0}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all whitespace-nowrap
              ${isLoading || keywords.length === 0 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5'}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Mentors</span>
              </>
            )}
          </button>
        </div>

        {/* Filters Toggle */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  US News Ranking Range
                </label>
                <select
                  value={filters.rankingRange}
                  onChange={(e) => setFilters({...filters, rankingRange: e.target.value})}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="Top 10">Top 10 (Most Selective)</option>
                  <option value="Top 25">Top 25</option>
                  <option value="Top 50">Top 50</option>
                  <option value="Top 100">Top 100</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  placeholder="e.g. Computer Science, Biology"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;