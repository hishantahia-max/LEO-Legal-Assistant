
import React, { useState } from 'react';
import { Cloud, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, FileText } from 'lucide-react';

export const CloudIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'gdrive', name: 'Google Drive', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg', connected: true, lastSync: '2 mins ago', folder: '/AutoDoc Legal/Case Files' },
    { id: 'dropbox', name: 'Dropbox', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg', connected: false, lastSync: '-', folder: '-' },
    { id: 'onedrive', name: 'OneDrive', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg', connected: false, lastSync: '-', folder: '-' }
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(item => 
      item.id === id ? { ...item, connected: !item.connected, lastSync: !item.connected ? 'Just now' : '-' } : item
    ));
  };

  return (
    <div className="h-full bg-[#f8f7f5] overflow-y-auto">
      {/* Header */}
      <div className="h-20 bg-white border-b border-stone-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div>
           <h2 className="text-2xl font-serif font-bold text-[#1a2333] flex items-center gap-2">
             <Cloud className="w-6 h-6 text-[#cfb586]" />
             Cloud Sync Hub
           </h2>
           <p className="text-xs text-stone-500">Manage external storage providers and backup settings</p>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Status Card */}
        <div className="bg-gradient-to-r from-[#1a2333] to-[#2d3a52] rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
           <div>
             <h3 className="text-lg font-bold mb-1">Auto-Sync Active</h3>
             <p className="text-blue-200 text-sm">Your legal docket is automatically backed up to connected providers every 15 minutes.</p>
           </div>
           <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
             <RefreshCw className="w-6 h-6 text-[#cfb586]" />
           </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
               {app.connected && (
                 <div className="absolute top-0 right-0 p-2 bg-green-50 rounded-bl-xl border-b border-l border-green-100">
                   <CheckCircle2 className="w-4 h-4 text-green-600" />
                 </div>
               )}
               
               <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center p-3 mb-2 group-hover:scale-110 transition-transform duration-300">
                   <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                 </div>
                 
                 <div>
                   <h3 className="font-bold text-[#1a2333] text-lg">{app.name}</h3>
                   <p className="text-xs text-stone-500 mt-1">
                     {app.connected ? `Synced: ${app.lastSync}` : 'Not Connected'}
                   </p>
                 </div>

                 {app.connected && (
                   <div className="w-full bg-stone-50 rounded p-2 text-xs text-stone-600 font-mono border border-stone-100 truncate">
                     {app.folder}
                   </div>
                 )}

                 <button
                   onClick={() => toggleConnection(app.id)}
                   className={`
                     w-full py-2.5 rounded-lg font-medium text-sm transition-all
                     ${app.connected 
                       ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600' 
                       : 'bg-[#1a2333] text-white hover:bg-[#2d3a52] shadow-md shadow-[#1a2333]/20'}
                   `}
                 >
                   {app.connected ? 'Disconnect' : 'Connect Account'}
                 </button>
               </div>
            </div>
          ))}
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
           <h3 className="font-serif font-bold text-lg text-[#1a2333] mb-4">Sync Preferences</h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded">
                   <FileText className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-800">Sync OCR Text Files</p>
                   <p className="text-xs text-slate-500">Upload .txt transcriptions alongside original PDFs</p>
                 </div>
               </div>
               <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#1a2333]" />
             </div>

             <div className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded">
                   <Cloud className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-800">Preserve Folder Structure</p>
                   <p className="text-xs text-slate-500">Mirror the "Court/Case Number" hierarchy in Drive</p>
                 </div>
               </div>
               <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#1a2333]" />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};
