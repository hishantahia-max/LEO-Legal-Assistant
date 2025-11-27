
import React from 'react';
import { LayoutDashboard, MessageSquareText, Cloud, Settings, FolderSearch } from 'lucide-react';
import { ActiveTab } from '../types';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:hidden h-[60px] bg-[#1a2333] border-t border-[#2d3a52] flex items-center justify-around px-2 z-50 flex-shrink-0">
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center w-14 gap-1 ${activeTab === 'dashboard' ? 'text-[#cfb586]' : 'text-slate-400'}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[9px] font-medium">Docket</span>
      </button>

      <button 
        onClick={() => onTabChange('scanner')}
        className={`flex flex-col items-center justify-center w-14 gap-1 ${activeTab === 'scanner' ? 'text-[#cfb586]' : 'text-slate-400'}`}
      >
        <FolderSearch className="w-5 h-5" />
        <span className="text-[9px] font-medium">Scan</span>
      </button>

      <button 
        onClick={() => onTabChange('assistant')}
        className={`flex flex-col items-center justify-center w-14 gap-1 ${activeTab === 'assistant' ? 'text-[#cfb586]' : 'text-slate-400'}`}
      >
        <MessageSquareText className="w-5 h-5" />
        <span className="text-[9px] font-medium">AI</span>
      </button>

      <button 
        onClick={() => onTabChange('cloud')}
        className={`flex flex-col items-center justify-center w-14 gap-1 ${activeTab === 'cloud' ? 'text-[#cfb586]' : 'text-slate-400'}`}
      >
        <Cloud className="w-5 h-5" />
        <span className="text-[9px] font-medium">Cloud</span>
      </button>
      
      <button 
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center justify-center w-14 gap-1 ${activeTab === 'settings' ? 'text-[#cfb586]' : 'text-slate-400'}`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[9px] font-medium">Settings</span>
      </button>
    </div>
  );
};
