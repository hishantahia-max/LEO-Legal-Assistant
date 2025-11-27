
import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { CaseEntity } from '../types';

interface Props {
  caseData: CaseEntity;
  onClick: () => void;
}

export const CaseSummaryCard: React.FC<Props> = ({ caseData, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm active:scale-[0.98] transition-all mb-4"
    >
      {/* Top Row: Title & Status */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[#1a2333] text-sm line-clamp-2 leading-tight flex-1 mr-3">
          {caseData.petitionerName} <span className="text-stone-400 font-normal">vs</span> {caseData.respondentName}
        </h3>
        <span className={`
          flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
          ${caseData.isUrgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
        `}>
          {caseData.status}
        </span>
      </div>

      {/* Middle Row: CNR */}
      <div className="mb-3">
        <p className="text-xs font-mono text-stone-500 bg-stone-50 inline-block px-1.5 py-0.5 rounded border border-stone-100">
          {caseData.caseNumber}
        </p>
      </div>

      {/* Bottom Row: Date & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#cfb586]" />
          <span className={caseData.isUrgent ? 'text-red-600' : 'text-stone-600'}>
            {caseData.nextHearingDate || 'Date Not Set'}
          </span>
        </div>
        
        <div className="flex items-center text-[#cfb586] text-xs font-bold">
          View
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
