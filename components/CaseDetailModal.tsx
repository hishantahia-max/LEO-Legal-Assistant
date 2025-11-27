
import React, { useState } from 'react';
import { X, Calendar, FileText, Clock, Gavel, User, AlertCircle, Download } from 'lucide-react';
import { CaseEntity, HearingEntity, DocumentEntity } from '../types';

interface Props {
  caseData: CaseEntity;
  hearings: HearingEntity[];
  documents: DocumentEntity[];
  onClose: () => void;
  onDownloadIcs: (hearing: HearingEntity) => void;
}

export const CaseDetailModal: React.FC<Props> = ({ caseData, hearings, documents, onClose, onDownloadIcs }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'docs' | 'notes'>('history');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 transition-colors">
        {/* Header */}
        <div className="bg-[#1a2333] dark:bg-slate-950 p-6 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-[#cfb586] text-[#1a2333] text-xs font-bold uppercase rounded">
                {caseData.status}
              </span>
              <h2 className="text-2xl font-serif font-bold tracking-wide text-white">{caseData.caseNumber}</h2>
            </div>
            <p className="text-blue-200 text-sm font-medium">{caseData.courtName}</p>
            <div className="mt-4 flex items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#cfb586]" />
                <span>{caseData.petitionerName} <span className="text-slate-500">vs</span> {caseData.respondentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#cfb586]" />
                <span>Stage: {caseData.currentStage}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-[#cfb586] text-[#1a2333] dark:text-slate-100' : 'border-transparent text-stone-500 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300'}`}
          >
            <Clock className="w-4 h-4" /> Case History
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'docs' ? 'border-[#cfb586] text-[#1a2333] dark:text-slate-100' : 'border-transparent text-stone-500 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300'}`}
          >
            <FileText className="w-4 h-4" /> Documents ({documents.length})
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'border-[#cfb586] text-[#1a2333] dark:text-slate-100' : 'border-transparent text-stone-500 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300'}`}
          >
            <AlertCircle className="w-4 h-4" /> Notes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f7f5] dark:bg-slate-950">
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-slate-800">
              {hearings.length === 0 && (
                <p className="text-center text-stone-500 dark:text-slate-500 py-8 italic">No hearing history found.</p>
              )}
              {hearings.map((h, idx) => (
                <div key={h.hearingId} className="relative pl-10">
                  <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-[#1a2333] dark:bg-slate-700 border-2 border-white dark:border-slate-900 ring-2 ring-stone-100 dark:ring-slate-800"></div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-stone-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                       <span className="font-bold text-[#1a2333] dark:text-slate-200 flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-[#cfb586]" />
                         {h.hearingDate}
                       </span>
                       <span className="text-xs font-mono text-stone-400 dark:text-slate-500">Item: {h.itemNumber || '-'}</span>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-slate-300 font-medium mb-1">Purpose: {h.purpose}</p>
                    {h.judgeName && <p className="text-xs text-stone-500 dark:text-slate-500">Judge: {h.judgeName}</p>}
                    
                    <button 
                      onClick={() => onDownloadIcs(h)}
                      className="mt-3 text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      <Download className="w-3 h-3" /> Add to Calendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === 'docs' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {documents.map(doc => (
                 <div key={doc.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-stone-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                   <div className="p-2 bg-stone-100 dark:bg-slate-800 rounded-lg text-stone-500 dark:text-slate-400">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.currentName}</p>
                     <p className="text-xs text-stone-500 dark:text-slate-500">{doc.metadata?.docType || 'Document'}</p>
                   </div>
                 </div>
               ))}
             </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <textarea 
              className="w-full h-full min-h-[200px] p-4 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-600"
              placeholder="Add private notes regarding this case..."
            ></textarea>
          )}

        </div>
      </div>
    </div>
  );
};
