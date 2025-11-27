import React from 'react';
import { X, RefreshCw, Check, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { CaseEntity } from '../types';

interface Props {
  localCase: CaseEntity;
  remoteData: any;
  onConfirm: (mergedData: Partial<CaseEntity>) => void;
  onClose: () => void;
  isLoading: boolean;
}

export const ECourtsSyncModal: React.FC<Props> = ({ localCase, remoteData, onConfirm, onClose, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-[#cfb586] animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Syncing with e-Courts...</h3>
          <p className="text-sm text-slate-500">Searching official databases...</p>
        </div>
      </div>
    );
  }

  const hasChanges = remoteData?.found && (
    remoteData.nextHearingDate !== localCase.nextHearingDate ||
    remoteData.stage !== localCase.currentStage
  );

  const handleConfirm = () => {
    if (!remoteData?.found) return;
    onConfirm({
      nextHearingDate: remoteData.nextHearingDate || localCase.nextHearingDate,
      currentStage: remoteData.stage || localCase.currentStage,
      cnrNumber: remoteData.cnrNumber || localCase.cnrNumber,
      ecourtsData: {
        nextHearingDate: remoteData.nextHearingDate,
        stage: remoteData.stage,
        orders: remoteData.orders,
        rawStatus: 'Synced via Gemini Search'
      },
      lastSyncedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#1a2333] p-4 flex justify-between items-center text-white">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#cfb586]" /> e-Courts Synchronization
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!remoteData?.found ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Case Not Found</h3>
              <p className="text-sm text-slate-500 mt-2">Could not locate case details in public records based on the current metadata.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Data */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Local Record</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Next Hearing</p>
                    <p className="font-mono font-medium text-slate-800 dark:text-slate-200">{localCase.nextHearingDate || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Stage</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{localCase.currentStage || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Remote Data */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                <h3 className="text-xs font-bold uppercase text-blue-500 mb-3">e-Courts Data</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-blue-400 text-xs">Next Hearing</p>
                    <p className={`font-mono font-medium ${remoteData.nextHearingDate !== localCase.nextHearingDate ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {remoteData.nextHearingDate || 'Not Found'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs">Stage</p>
                    <p className={`font-medium ${remoteData.stage !== localCase.currentStage ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {remoteData.stage || 'Not Found'}
                    </p>
                  </div>
                  {remoteData.orders && remoteData.orders.length > 0 && (
                     <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                       <p className="text-blue-400 text-xs mb-1">New Orders Found</p>
                       {remoteData.orders.slice(0, 2).map((o: any, i: number) => (
                         <a key={i} href={o.url} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 hover:underline truncate">
                           {o.date} - {o.title} <ExternalLink className="w-3 h-3 inline" />
                         </a>
                       ))}
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {remoteData?.found && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
             <button 
               onClick={handleConfirm}
               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm"
             >
               <Check className="w-4 h-4" /> Merge & Update
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
