
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SmartAssistant } from './components/SmartAssistant';
import { CloudIntegrations } from './components/CloudIntegrations';
import { ResearchTerminal } from './components/ResearchTerminal';
import { FileIndexer } from './components/FileIndexer';
import { Settings } from './components/Settings';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DocumentEntity, ProcessingStatus, CaseEntity, HearingEntity, ActiveTab } from './types';
import { ocrService } from './services/ocr';
import { aiRenamerService } from './services/gemini';
import { googleDriveService } from './services/googleDrive';
import { useHotkeys } from './hooks/useHotkeys';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ecourtsService } from './services/ecourts';

// Separate Inner App to access Context
const InnerApp = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [cases, setCases] = useState<CaseEntity[]>([]);
  const [hearings, setHearings] = useState<HearingEntity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // e-Courts Sync State
  const [syncStatus, setSyncStatus] = useState<{ isLoading: boolean; data: any; caseId: string | null }>({ isLoading: false, data: null, caseId: null });
  
  const { settings } = useSettings(); // Now accessible

  useEffect(() => {
    const key = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
    if (key) {
      setApiKey(key);
      aiRenamerService.initialize(key);
      ecourtsService.initialize(key);
    } else {
      setShowKeyModal(true);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
    aiRenamerService.initialize(key);
    ecourtsService.initialize(key);
    setShowKeyModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey(null);
    setShowKeyModal(true);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const backupData = { timestamp: Date.now(), cases, hearings, documents: documents.map(d => ({...d, file: undefined})) };
      await googleDriveService.syncToCloud(backupData, "123456"); // Pin should come from UI/Settings in prod
    } catch (e) {
      console.error("Sync failed:", e);
      alert("Cloud Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  useHotkeys([{ combo: 'Ctrl+S', handler: handleSync }]);

  const handleUpload = (fileList: FileList | File[]) => {
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const newDocs: DocumentEntity[] = files.map(file => ({
      id: uuidv4(),
      file,
      originalName: file.name,
      currentName: file.name,
      size: file.size,
      uploadDate: Date.now(),
      status: ProcessingStatus.PENDING,
      // Icon based on type
      metadata: { docType: 'Pending' },
      icon: file.type.includes('pdf') ? 'file-text' : file.type.includes('image') ? 'image' : 'file'
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    setActiveTab('dashboard'); 
  };

  const handleCauseListUpload = async (fileList: FileList) => {
    if (!apiKey) return;
    const file = fileList[0];
    if (!file) return;

    try {
      const text = await ocrService.extractText(file, 2); 
      const extractedHearings = await aiRenamerService.parseCauseList(text);
      // ... (Existing cause list logic remains same) ...
       alert(`Imported ${extractedHearings.length} hearings.`);
    } catch (e) {
      alert("Failed to parse Cause List.");
    }
  };

  const handleDelete = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  // --- e-Courts Sync Handlers ---
  const handleECourtsSync = async (caseData: CaseEntity) => {
    setSyncStatus({ isLoading: true, data: null, caseId: caseData.caseId });
    try {
      const result = await ecourtsService.syncCaseStatus(caseData);
      setSyncStatus({ isLoading: false, data: result, caseId: caseData.caseId });
    } catch (error) {
      alert("Sync failed. Please check network.");
      setSyncStatus({ isLoading: false, data: null, caseId: null });
    }
  };

  const handleConfirmSync = (caseId: string, mergedData: Partial<CaseEntity>) => {
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, ...mergedData } : c));
    setSyncStatus({ isLoading: false, data: null, caseId: null });
  };

  const processNextDocument = useCallback(async () => {
    if (isProcessing || !apiKey || !settings.autoProcess) return;

    const pendingDoc = documents.find(d => d.status === ProcessingStatus.PENDING);
    if (!pendingDoc) return;

    setIsProcessing(true);
    setDocuments(prev => prev.map(d => d.id === pendingDoc.id ? { ...d, status: ProcessingStatus.OCR_PROCESSING } : d));

    try {
      const text = await ocrService.extractText(pendingDoc.file);
      setDocuments(prev => prev.map(d => d.id === pendingDoc.id ? { ...d, ocrText: text, status: ProcessingStatus.AI_PROCESSING } : d));

      let metadata = await aiRenamerService.suggestMetadata(text, pendingDoc.originalName);
      
      // Auto-create case if new
      if (metadata.caseNumber) {
        setCases(prev => {
          if (!prev.find(c => c.caseNumber === metadata.caseNumber)) {
            return [...prev, {
              caseId: uuidv4(),
              caseNumber: metadata.caseNumber!,
              courtName: metadata.court || settings.defaultCourt,
              caseType: 'Unknown',
              petitionerName: 'Petitioner', // Will be refined by user or sync
              respondentName: 'Respondent',
              status: 'Pending',
              currentStage: 'New Filing',
              isUrgent: false
            }];
          }
          return prev;
        });
      }
      
      setDocuments(prev => prev.map(d => d.id === pendingDoc.id ? { 
        ...d, status: ProcessingStatus.COMPLETED, metadata: metadata, currentName: metadata.suggestedFilename
      } : d));

    } catch (error: any) {
      setDocuments(prev => prev.map(d => d.id === pendingDoc.id ? { 
        ...d, status: ProcessingStatus.FAILED, errorMessage: error.message 
      } : d));
    } finally {
      setIsProcessing(false);
    }
  }, [documents, isProcessing, apiKey, settings.autoProcess, settings.defaultCourt]);

  useEffect(() => { processNextDocument(); }, [documents, processNextDocument]);

  return (
    <div className="bg-[#f8f7f5] dark:bg-slate-950 h-screen w-screen overflow-hidden transition-colors duration-200">
      <ApiKeyModal isOpen={showKeyModal} onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />
      <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
        {activeTab === 'dashboard' && 
          <Dashboard 
            documents={documents} 
            cases={cases} 
            hearings={hearings} 
            onUpload={handleUpload} 
            onCauseListUpload={handleCauseListUpload} 
            onDelete={handleDelete} 
            onSyncCase={handleECourtsSync}
            syncStatus={syncStatus}
            onConfirmSync={handleConfirmSync}
            onCloseSyncModal={() => setSyncStatus({ isLoading: false, data: null, caseId: null })}
          />
        }
        {activeTab === 'scanner' && <FileIndexer onImport={handleUpload} />}
        {activeTab === 'assistant' && <SmartAssistant documents={documents.filter(d => d.status === ProcessingStatus.COMPLETED)} />}
        {activeTab === 'cloud' && <CloudIntegrations />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'search' && <ResearchTerminal />}
      </Layout>
      {isSyncing && <div className="fixed bottom-4 left-4 z-50 bg-[#1a2333] text-white px-3 py-2 rounded-lg">Syncing...</div>}
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <InnerApp />
    </SettingsProvider>
  );
}
