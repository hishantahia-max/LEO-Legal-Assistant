
import React, { useState } from 'react';
import { FolderSearch, FileText, CheckSquare, Square, Download, Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import { fileSystemService } from '../services/fileSystem';
import { ScannedFile } from '../types';

interface Props {
  onImport: (files: File[]) => void;
}

export const FileIndexer: React.FC<Props> = ({ onImport }) => {
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanStats, setScanStats] = useState({ pdfs: 0, images: 0, others: 0 });

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const files = await fileSystemService.scanDirectory();
      setScannedFiles(files);
      
      // Calculate stats
      const stats = { pdfs: 0, images: 0, others: 0 };
      files.forEach(f => {
        if (f.name.toLowerCase().endsWith('.pdf')) stats.pdfs++;
        else if (f.type.startsWith('image/')) stats.images++;
        else stats.others++;
      });
      setScanStats(stats);
      
    } catch (error: any) {
      console.error("Scan failed:", error);
      if (error.name === 'SecurityError' || error.message?.includes('Cross origin sub frames')) {
        alert("Folder scanning is not allowed in this embedded preview environment. Please open the application in a full browser tab to use the Local Index feature.");
      } else if (error.name !== 'AbortError') {
         alert("Could not scan directory. Ensure you grant permission.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === scannedFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scannedFiles.map(f => f.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    
    const filesToImport = scannedFiles.filter(f => selectedIds.has(f.id));
    const realFiles: File[] = [];

    // Convert handles to Files
    for (const item of filesToImport) {
      try {
        const file = await fileSystemService.getFileFromHandle(item.handle);
        realFiles.push(file);
      } catch (e) {
        console.error(`Failed to read file ${item.name}`, e);
      }
    }

    onImport(realFiles);
    
    // Mark as imported visually
    setScannedFiles(prev => prev.map(f => selectedIds.has(f.id) ? { ...f, isImported: true } : f));
    setSelectedIds(new Set());
    alert(`Imported ${realFiles.length} documents into the workspace.`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f7f5] dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between shrink-0 shadow-sm transition-colors">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1a2333] dark:text-slate-100 flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-[#cfb586]" />
            Local Repository Index
          </h2>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Scan local folders to discover and index legal documents without uploading.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2333] dark:bg-slate-800 hover:bg-[#2d3a52] dark:hover:bg-slate-700 text-white rounded-lg transition-all shadow-md disabled:opacity-70"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
            {isScanning ? 'Scanning...' : 'Select Folder to Scan'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        
        {scannedFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 dark:text-slate-500 border-2 border-dashed border-stone-200 dark:border-slate-800 rounded-xl bg-stone-50/50 dark:bg-slate-900/50 transition-colors">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FolderSearch className="w-8 h-8 text-stone-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-600 dark:text-slate-400">No Index Active</h3>
            <p className="max-w-md text-center mt-2 text-sm text-stone-500 dark:text-slate-500">
              Connect a local folder (e.g., "Downloads" or "Case Files") to automatically discover legal documents.
              <br/>We process files locally. Nothing leaves your device without permission.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
            
            {/* Toolbar */}
            <div className="bg-stone-50 dark:bg-slate-800 p-3 border-b border-stone-200 dark:border-slate-700 flex items-center justify-between text-sm">
               <div className="flex items-center gap-4">
                 <button onClick={toggleAll} className="flex items-center gap-2 text-stone-600 dark:text-slate-300 font-medium hover:text-[#1a2333] dark:hover:text-slate-100">
                   {selectedIds.size === scannedFiles.length && scannedFiles.length > 0 
                     ? <CheckSquare className="w-4 h-4 text-[#cfb586]" /> 
                     : <Square className="w-4 h-4 text-stone-300 dark:text-slate-600" />}
                   Select All
                 </button>
                 <span className="h-4 w-px bg-stone-300 dark:bg-slate-600"></span>
                 <div className="flex gap-3 text-stone-500 dark:text-slate-400 text-xs font-mono">
                    <span>PDFs: {scanStats.pdfs}</span>
                    <span>Images: {scanStats.images}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="text-stone-500 dark:text-slate-400">{selectedIds.size} selected</span>
                 <button 
                   onClick={handleImport}
                   disabled={selectedIds.size === 0}
                   className="flex items-center gap-2 px-3 py-1.5 bg-[#cfb586] hover:bg-[#b89f70] text-[#1a2333] font-bold rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Download className="w-3 h-3" /> Process Selected
                 </button>
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm text-xs uppercase text-stone-400 dark:text-slate-500 font-bold transition-colors">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                  {scannedFiles.map((file) => (
                    <tr key={file.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${selectedIds.has(file.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelection(file.id)}>
                          {selectedIds.has(file.id) 
                            ? <CheckSquare className="w-4 h-4 text-[#cfb586]" /> 
                            : <Square className="w-4 h-4 text-stone-300 dark:text-slate-600" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-stone-400 dark:text-slate-500" />
                        {file.name}
                      </td>
                      <td className="px-4 py-3 text-stone-500 dark:text-slate-400 truncate max-w-[200px]" title={file.path}>
                        {file.path}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-400 dark:text-slate-500 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-4 py-3">
                        {file.isImported ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            IMPORTED
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 dark:text-slate-500 font-medium">NEW</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
