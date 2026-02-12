import React from 'react';
import { ExternalLink, Building2, BookOpen, Star, Info } from 'lucide-react';
import { Professor } from '../types';

interface ProfessorCardProps {
  professor: Professor;
  rank: number;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor, rank }) => {
  // Determine color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  const scoreColorClass = getScoreColor(professor.matchScore);

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        {/* Left Column: Match Score & Rank */}
        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:w-28 flex-shrink-0">
          <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Match</span>
             <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 text-xl font-bold ${scoreColorClass}`}>
               {professor.matchScore}%
             </div>
          </div>
          <div className="hidden md:block w-px h-full bg-slate-100 my-2" />
          <div className="text-slate-400 text-sm font-medium">
            Rank #{rank}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex-grow space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {professor.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{professor.university}</span>
                  {professor.department && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm">{professor.department}</span>
                    </>
                  )}
                </div>
              </div>
              
              {professor.websiteUrl && (
                <a 
                  href={professor.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-indigo-900 leading-snug">
                <span className="font-semibold">AI Match Logic:</span> {professor.matchReason}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
               <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Star className="w-3 h-3" /> Research Summary
               </h4>
               <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                 {professor.summary}
               </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Key Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {professor.researchInterests.map((interest, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;