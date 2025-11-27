
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, Search, Loader2, CheckCircle, AlertCircle, FileText,
  Trash2, Filter, ChevronRight, ChevronDown, Calendar, Briefcase, Plus,
  MoreVertical, Eye, XCircle, Folder, Calculator, Cloud, RefreshCw
} from 'lucide-react';
import { DocumentEntity, ProcessingStatus, CaseEntity, HearingEntity } from '../types';
import { downloadIcsFile } from '../utils/calendar';
import { CaseDetailModal } from './CaseDetailModal';
import { LegalToolsModal } from './LegalToolsModal';
import { InstallPrompt } from './InstallPrompt';
import { EmptyState } from './EmptyState';
import { useScreenSize } from '../hooks/useScreenSize';
import { useHotkeys } from '../hooks/useHotkeys';
import { CaseSummaryCard } from './CaseSummaryCard';
import { ECourtsSyncModal } from './ECourtsSyncModal';

interface DashboardProps {
  documents: DocumentEntity[];
  cases: CaseEntity[];
  hearings: HearingEntity[];
  onUpload: (files: FileList) => void;
  onCauseListUpload: (files: FileList) => void;
  onDelete: (id: string) => void;
  onSyncCase?: (caseData: CaseEntity) => void;
  syncStatus?: { isLoading: boolean; data: any; caseId: string | null };
  onConfirmSync?: (caseId: string, mergedData: Partial<CaseEntity>) => void;
  onCloseSyncModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  documents, cases, hearings, onUpload, onCauseListUpload, onDelete,
  onSyncCase, syncStatus, onConfirmSync, onCloseSyncModal
}) => {
  const { isMobile } = useScreenSize();
  const [activeTab, setActiveTab] = useState<'cases' | 'hearings' | 'docs'>('cases');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseEntity | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showLegalTools, setShowLegalTools] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const causeListInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useHotkeys([
    { combo: 'Ctrl+N', handler: () => fileInputRef.current?.click() },
    { combo: 'Ctrl+K', handler: () => searchInputRef.current?.focus() },
    { combo: 'Esc', handler: () => { setSelectedCase(null); setShowLegalTools(false); } }
  ]);

  // Stats for Ribbon
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysHearings = hearings.filter(h => h.hearingDate === todayStr).length;
    const urgentCases = cases.filter(c => c.isUrgent).length;
    const pendingDocs = documents.filter(d => d.status === ProcessingStatus.PENDING).length;
    return { todaysHearings, urgentCases, pendingDocs };
  }, [cases, hearings, documents]);

  // Derived Data for Display
  const filteredCases = cases.filter(c => 
    c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.petitionerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group documents for Repository View
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, DocumentEntity[]> = {};
    documents.forEach(doc => {
      // Prioritize folderPath, then caseNumber, then Unsorted
      const key = doc.metadata?.folderPath || doc.metadata?.caseNumber || 'Unsorted';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(doc);
    });
    return groups;
  }, [documents]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Calculate active processing state
  const processingQueue = documents.filter(d => 
    [ProcessingStatus.PENDING, ProcessingStatus.OCR_PROCESSING, ProcessingStatus.AI_PROCESSING].includes(d.status)
  );
  
  const currentProcessingDoc = processingQueue.find(d => d.status !== ProcessingStatus.PENDING) || processingQueue[0];

  return (
    <div className="flex flex-col h-full bg-[#f8f7f5] dark:bg-slate-950 relative transition-colors duration-200">
      
      {/* --- Summary Ribbon (Desktop Only or Simplified on Mobile) --- */}
      <div className="bg-[#1a2333] dark:bg-slate-900 text-white px-4 md:px-8 py-3 flex items-center justify-between text-sm shrink-0 shadow-md z-30">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Calendar className="w-4 h-4 text-[#cfb586]" />
            <span className="font-medium hidden md:inline">Today's Hearings:</span>
            <span className="font-medium md:hidden">Today:</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">{stats.todaysHearings}</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="font-medium hidden md:inline">Urgent Matters:</span>
            <span className="font-medium md:hidden">Urgent:</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">{stats.urgentCases}</span>
          </div>
          {stats.pendingDocs > 0 && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="font-medium hidden md:inline">Processing:</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">{stats.pendingDocs}</span>
            </div>
          )}
        </div>
        
        {/* Cloud Status Indicator */}
        <div className="flex items-center gap-2 ml-4">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             <span className="hidden md:inline text-xs text-stone-400 dark:text-slate-400">Synced</span>
        </div>
      </div>

      {/* --- Header / Toolbar --- */}
      <div className="bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm shrink-0 transition-colors">
        <div className="px-4 md:px-8 h-16 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
             {/* Tabs - Horizontal Scroll on Mobile */}
             <div className="flex gap-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto no-scrollbar shrink-0 transition-colors">
                <button 
                  onClick={() => setActiveTab('cases')}
                  className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === 'cases' 
                      ? 'bg-white dark:bg-slate-700 text-[#1a2333] dark:text-slate-100 shadow-sm' 
                      : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
                  }`}
                >
                  Active Cases
                </button>
                <button 
                  onClick={() => setActiveTab('hearings')}
                  className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === 'hearings' 
                      ? 'bg-white dark:bg-slate-700 text-[#1a2333] dark:text-slate-100 shadow-sm' 
                      : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
                  }`}
                >
                  Schedule
                </button>
                <button 
                  onClick={() => setActiveTab('docs')}
                  className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === 'docs' 
                      ? 'bg-white dark:bg-slate-700 text-[#1a2333] dark:text-slate-100 shadow-sm' 
                      : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
                  }`}
                >
                  Repository
                </button>
             </div>

             {/* Search */}
             <div className="relative flex-1 max-w-sm hidden md:block">
               <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3 top-2.5" />
               <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search case no, party... (Ctrl+K)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#cfb586]/20 focus:border-[#cfb586] outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500"
               />
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
             <InstallPrompt />
             
             <button
               onClick={() => setShowLegalTools(true)}
               className="text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 p-2 md:px-3 md:py-2 rounded-lg text-sm font-medium border border-transparent hover:border-stone-200 dark:hover:border-slate-700 transition-all flex items-center gap-2"
               title="Legal Calculators"
             >
                <Calculator className="w-5 h-5 md:w-4 md:h-4" /> 
                <span className="hidden md:inline">Tools</span>
             </button>

             {/* Desktop "New Entry" Buttons */}
             <div className="hidden md:flex items-center gap-2">
                 <button 
                   onClick={() => causeListInputRef.current?.click()}
                   className="text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-stone-200 dark:hover:border-slate-700 transition-all flex items-center gap-2"
                 >
                   <FileText className="w-4 h-4" /> Import List
                 </button>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-[#1a2333] dark:bg-slate-800 hover:bg-[#2d3a52] dark:hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-[#1a2333]/20 flex items-center gap-2"
                 >
                   <Plus className="w-4 h-4" /> New Entry
                 </button>
             </div>
          </div>
          
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files)} />
          <input type="file" accept=".pdf" ref={causeListInputRef} className="hidden" onChange={(e) => e.target.files && onCauseListUpload(e.target.files)} />
        </div>
        
        {/* Mobile Search Bar (visible only on mobile) */}
        <div className="md:hidden px-4 pb-3">
           <div className="relative">
              <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3 top-2.5" />
               <input 
                  type="text" 
                  placeholder="Search cases..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#cfb586]/20 focus:border-[#cfb586] outline-none text-slate-900 dark:text-slate-100"
               />
           </div>
        </div>
      </div>

      {/* --- Main Content Content --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
        
        {/* CASES VIEW */}
        {activeTab === 'cases' && (
          <>
            {/* Desktop View: Data Grid */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
               <table className="w-full text-left text-sm">
                  <thead className="bg-[#f8fafc] dark:bg-slate-800 text-stone-500 dark:text-slate-400 font-medium border-b border-stone-200 dark:border-slate-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 w-16">#</th>
                      <th className="px-6 py-4">CNR / Case Number</th>
                      <th className="px-6 py-4">Parties</th>
                      <th className="px-6 py-4">Stage</th>
                      <th className="px-6 py-4">Next Hearing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                    {filteredCases.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState 
                             icon={Briefcase}
                             title="No Active Cases"
                             message="Your legal docket is empty. Import a cause list or upload documents."
                          />
                        </td>
                      </tr>
                    )}
                    {filteredCases.map((c, i) => (
                      <tr key={c.caseId} className="hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors group">
                        <td className="px-6 py-4 text-stone-400 dark:text-slate-600 font-mono">{String(i + 1).padStart(2, '0')}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${c.isUrgent ? 'bg-red-500' : 'bg-green-500'}`} title={c.isUrgent ? 'Urgent' : 'Normal'}></div>
                             <div>
                               <p className="font-bold text-[#1a2333] dark:text-slate-200">{c.caseNumber}</p>
                               <p className="text-xs text-stone-500 dark:text-slate-400">{c.courtName}</p>
                               {c.lastSyncedAt && <p className="text-[10px] text-green-600 dark:text-green-500">Synced: {new Date(c.lastSyncedAt).toLocaleDateString()}</p>}
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-stone-700 dark:text-slate-300">{c.petitionerName} <span className="text-stone-400 dark:text-slate-500 font-normal">vs</span></p>
                          <p className="font-medium text-stone-700 dark:text-slate-300">{c.respondentName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {c.currentStage}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-stone-600 dark:text-slate-400">
                          {c.nextHearingDate || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                            {onSyncCase && (
                                <button 
                                  onClick={() => onSyncCase(c)}
                                  className="text-stone-500 hover:text-[#1a2333] dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Sync with e-Courts"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                             )}
                             <button 
                               onClick={() => setSelectedCase(c)}
                               className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-md transition-all"
                             >
                               View Details
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden">
              {filteredCases.length === 0 && (
                <EmptyState 
                   icon={Briefcase}
                   title="No Active Cases"
                   message="Upload documents to get started."
                />
              )}
              {filteredCases.map((c) => (
                <CaseSummaryCard 
                  key={c.caseId} 
                  caseData={c} 
                  onClick={() => setSelectedCase(c)} 
                />
              ))}
            </div>
          </>
        )}

        {/* HEARINGS VIEW */}
        {activeTab === 'hearings' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {hearings.length === 0 && (
               <EmptyState 
                 icon={Calendar}
                 title="No Upcoming Hearings"
                 message="Import a Cause List PDF to auto-populate this schedule."
               />
            )}
            {hearings
              .sort((a, b) => a.hearingDate.localeCompare(b.hearingDate))
              .map(h => {
                const linkedCase = cases.find(c => c.caseId === h.caseId);
                return (
                  <div key={h.hearingId} className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl border border-stone-200 dark:border-slate-800 shadow-sm flex items-center gap-4 md:gap-6 hover:border-[#cfb586] transition-colors">
                     <div className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-stone-50 dark:bg-slate-800 rounded-lg border border-stone-100 dark:border-slate-700 flex-shrink-0 text-[#1a2333] dark:text-slate-200">
                        <span className="text-[10px] md:text-xs font-bold uppercase text-stone-400 dark:text-slate-500">{new Date(h.hearingDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg md:text-xl font-bold font-serif">{new Date(h.hearingDate).getDate()}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                          <h4 className="font-bold text-[#1a2333] dark:text-slate-200 text-base md:text-lg truncate">{linkedCase?.caseNumber || 'Unknown Case'}</h4>
                          <span className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 rounded w-fit">Item {h.itemNumber || '?'}</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-slate-400 mb-0.5 truncate">{linkedCase?.courtName}</p>
                        <p className="text-xs text-stone-400 dark:text-slate-500 truncate">Purpose: {h.purpose}</p>
                     </div>
                     <button 
                       onClick={() => downloadIcsFile(h, linkedCase)}
                       className="p-2 text-stone-400 hover:text-[#1a2333] dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg" 
                       title="Export to Calendar"
                     >
                       <Calendar className="w-5 h-5" />
                     </button>
                  </div>
                );
            })}
          </div>
        )}

        {/* DOCUMENTS VIEW */}
        {activeTab === 'docs' && (
           <div className="space-y-4">
             {Object.entries(groupedDocuments).sort().map(([groupName, groupDocs]) => {
                const docs = groupDocs as DocumentEntity[];
                const isExpanded = expandedGroups[groupName] ?? true;
                return (
                  <div key={groupName} className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                    <button 
                      onClick={() => toggleGroup(groupName)}
                      className="w-full flex items-center gap-3 p-3 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors border-b border-stone-200 dark:border-slate-700 text-left"
                    >
                       {isExpanded ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                       <Folder className="w-4 h-4 text-[#cfb586] fill-[#cfb586]/20" />
                       <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{groupName}</span>
                       <span className="ml-auto text-xs font-mono text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 px-2 py-0.5 rounded-md flex-shrink-0">
                         {docs.length}
                       </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {docs.map(doc => (
                          <div key={doc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-stone-200 dark:border-slate-700 hover:shadow-md transition-all group relative">
                             <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                  <FileText className="w-6 h-6" />
                                </div>
                                {doc.status === ProcessingStatus.COMPLETED && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {doc.status === ProcessingStatus.FAILED && (
                                   <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                {[ProcessingStatus.PENDING, ProcessingStatus.OCR_PROCESSING, ProcessingStatus.AI_PROCESSING].includes(doc.status) && (
                                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                )}
                             </div>
                             <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate mb-1" title={doc.currentName}>{doc.currentName}</h4>
                             <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{doc.metadata?.docType || 'Document'}</p>
                             
                             <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700 flex justify-end">
                               <button onClick={() => onDelete(doc.id)} className="text-stone-400 hover:text-red-500">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
             })}
             {documents.length === 0 && (
                <EmptyState 
                   icon={FileText}
                   title="Empty Repository"
                   message="Processed documents will appear here organized by case folder."
                />
             )}
           </div>
        )}
      </div>

      {/* --- Mobile FAB (Add Case) --- */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1a2333] dark:bg-slate-800 text-white p-4 rounded-full shadow-lg shadow-[#1a2333]/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* --- Processing Progress Indicator --- */}
      {processingQueue.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-stone-200 dark:border-slate-800 p-4 w-[calc(100%-2rem)] md:w-80 animate-in fade-in slide-in-from-bottom-4 z-50 transition-colors">
           <div className="flex items-center justify-between mb-3">
             <h4 className="font-bold text-[#1a2333] dark:text-slate-200 text-sm">Processing Queue</h4>
             <span className="text-xs font-mono text-stone-500 dark:text-slate-400">{processingQueue.length} remaining</span>
           </div>
           
           <div className="space-y-3">
             <div className="h-1.5 w-full bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-[#1a2333] dark:bg-slate-600 w-1/3 animate-pulse"></div>
             </div>

             {currentProcessingDoc && (
               <div className="flex items-center gap-3 bg-stone-50 dark:bg-slate-800 p-2 rounded-lg border border-stone-100 dark:border-slate-700">
                 <Loader2 className="w-4 h-4 text-[#cfb586] animate-spin flex-shrink-0" />
                 <div className="min-w-0">
                   <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{currentProcessingDoc.originalName}</p>
                   <p className="text-[10px] text-stone-500 dark:text-slate-400 uppercase tracking-wide">
                     {currentProcessingDoc.status === ProcessingStatus.OCR_PROCESSING ? 'Scanning Text...' : 
                      currentProcessingDoc.status === ProcessingStatus.AI_PROCESSING ? 'AI Analyzing...' : 'Waiting...'}
                   </p>
                 </div>
               </div>
             )}
           </div>
        </div>
      )}

      {/* Modals */}
      {selectedCase && (
        <CaseDetailModal 
          caseData={selectedCase} 
          hearings={hearings.filter(h => h.caseId === selectedCase.caseId)}
          documents={documents.filter(d => d.linkedCaseId === selectedCase.caseId)}
          onClose={() => setSelectedCase(null)}
          onDownloadIcs={(h) => downloadIcsFile(h, selectedCase)}
        />
      )}
      
      {showLegalTools && (
        <LegalToolsModal onClose={() => setShowLegalTools(false)} />
      )}

      {syncStatus && syncStatus.caseId && (
        <ECourtsSyncModal 
          localCase={cases.find(c => c.caseId === syncStatus.caseId)!}
          remoteData={syncStatus.data}
          isLoading={syncStatus.isLoading}
          onConfirm={(data) => onConfirmSync && onConfirmSync(syncStatus.caseId!, data)}
          onClose={onCloseSyncModal!}
        />
      )}
    </div>
  );
};
