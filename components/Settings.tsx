
import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Type, Cpu, Database, Trash2, FileCode } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const Settings: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: 'Appearance & UI', icon: Monitor },
    { id: 'ai', label: 'AI Configuration', icon: Cpu },
    { id: 'automation', label: 'Automation', icon: FileCode },
    { id: 'storage', label: 'Data & Storage', icon: Database },
  ];

  return (
    <div className="flex h-full bg-[#f8f7f5] dark:bg-slate-950 font-sans transition-colors duration-200">
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-6 border-b border-stone-100 dark:border-slate-800">
          <h2 className="text-xl font-serif font-bold text-[#1a2333] dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#cfb586]" /> Preferences
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeCategory === cat.id ? 'bg-[#1a2333] dark:bg-slate-800 text-white shadow-md' : 'text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800'
              }`}
            >
              <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-[#cfb586]' : 'text-stone-400'}`} />
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {activeCategory === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <section>
                <h3 className="text-lg font-bold text-[#1a2333] dark:text-slate-100 mb-4 border-b border-stone-200 dark:border-slate-800 pb-2">Visual Interface</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['light', 'dark', 'system'].map((t) => (
                    <button key={t} onClick={() => updateSetting('theme', t)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === t ? 'border-[#cfb586] bg-white dark:bg-slate-800 shadow-sm' : 'border-transparent bg-white dark:bg-slate-900 hover:bg-stone-50 dark:hover:bg-slate-800'}`}>
                      {t === 'light' ? <Sun className="w-6 h-6 mb-2" /> : t === 'dark' ? <Moon className="w-6 h-6 mb-2" /> : <Monitor className="w-6 h-6 mb-2" />}
                      <span className="capitalize text-sm font-medium">{t}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-800 space-y-4 shadow-sm">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3"><Type className="w-5 h-5 text-stone-400" /> <div><p className="font-medium text-slate-800 dark:text-slate-200">UI Density</p></div></div>
                     <select value={settings.density} onChange={(e) => updateSetting('density', e.target.value)} className="bg-stone-50 dark:bg-slate-800 border rounded-lg text-sm p-2 outline-none dark:text-slate-200">
                       <option value="comfortable">Comfortable</option>
                       <option value="compact">Compact (High Density)</option>
                     </select>
                   </div>
                </div>
              </section>
            </div>
          )}
          {/* AI Settings Block */}
          {activeCategory === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <section>
                <h3 className="text-lg font-bold text-[#1a2333] dark:text-slate-100 mb-4 border-b border-stone-200 dark:border-slate-800 pb-2">Gemini Intelligence</h3>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-800 space-y-6 shadow-sm">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Analysis Strictness</label>
                     <div className="flex gap-4">
                       {['strict', 'creative'].map(mode => (
                         <label key={mode} className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.aiStrictness === mode ? 'border-[#cfb586] bg-blue-50/50 dark:bg-slate-800' : 'border-stone-100 dark:border-slate-700 hover:bg-stone-50'}`}>
                           <input type="radio" className="hidden" checked={settings.aiStrictness === mode} onChange={() => updateSetting('aiStrictness', mode)} />
                           <div className="font-bold capitalize text-[#1a2333] dark:text-slate-100 mb-1">{mode} Mode</div>
                         </label>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">File Naming Template</label>
                      <input 
                        type="text" 
                        value={settings.namingTemplate} 
                        onChange={(e) => updateSetting('namingTemplate', e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200 font-mono"
                        placeholder="{YEAR}-{CASE}-{TYPE}"
                      />
                      <p className="text-xs text-stone-500 dark:text-slate-500 mt-1">Available vars: {'{YEAR}, {CASE_NO}, {COURT}, {TYPE}'}</p>
                   </div>
                </div>
              </section>
            </div>
          )}

          {/* Automation Settings Block */}
          {activeCategory === 'automation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <section>
                <h3 className="text-lg font-bold text-[#1a2333] dark:text-slate-100 mb-4 border-b border-stone-200 dark:border-slate-800 pb-2">Workflow Automation</h3>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-800 space-y-6 shadow-sm">
                   
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Default Court Name</label>
                     <p className="text-xs text-stone-500 dark:text-slate-500 mb-2">Used when AI cannot detect the court from the document.</p>
                     <input 
                       type="text" 
                       value={settings.defaultCourt} 
                       onChange={(e) => updateSetting('defaultCourt', e.target.value)}
                       className="w-full p-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Auto-Process Imports</label>
                     <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-800 rounded-lg">
                       <div>
                         <p className="font-medium text-slate-800 dark:text-slate-200">Automatic OCR & Analysis</p>
                         <p className="text-xs text-stone-500 dark:text-slate-500">Automatically start processing files upon upload.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" checked={settings.autoProcess} onChange={(e) => updateSetting('autoProcess', e.target.checked)} />
                         <div className="w-11 h-6 bg-stone-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#cfb586]"></div>
                       </label>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cloud Backup Frequency</label>
                     <select 
                       value={settings.backupFrequency} 
                       onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                       className="w-full p-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200"
                     >
                       <option value="daily">Daily</option>
                       <option value="weekly">Weekly</option>
                       <option value="manual">Manual Only</option>
                     </select>
                   </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
