
import React from 'react';
import { LayoutDashboard, MessageSquareText, Cloud, Settings, LogOut, Scale, FolderSearch, BookOpen } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Case Docket', icon: LayoutDashboard },
    { id: 'scanner', label: 'Local Index', icon: FolderSearch },
    { id: 'search', label: 'Legal Research', icon: BookOpen },
    { id: 'assistant', label: 'Smart Counsel', icon: MessageSquareText },
    { id: 'cloud', label: 'Cloud Sync', icon: Cloud },
  ];

  return (
    <div className="hidden md:flex w-20 lg:w-64 bg-[#1a2333] dark:bg-slate-900 flex-col justify-between border-r border-[#2d3a52] dark:border-slate-800 transition-all duration-300 h-full flex-shrink-0 z-50">
      {/* Brand */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[#2d3a52] dark:border-slate-800">
        <div className="w-10 h-10 bg-[#cfb586] rounded-sm flex items-center justify-center shadow-lg shadow-[#cfb586]/20">
          <Scale className="w-6 h-6 text-[#1a2333]" />
        </div>
        <div className="hidden lg:block ml-3">
          <h1 className="text-lg font-serif font-bold text-[#e2e8f0] tracking-wide leading-none">
            AutoDoc
          </h1>
          <p className="text-[9px] text-[#cfb586] uppercase tracking-[0.2em] font-medium mt-1">Legal Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-2 px-2 lg:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`
                group flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition-all duration-200 w-full
                ${isActive 
                  ? 'bg-[#cfb586] text-[#1a2333] shadow-md font-bold' 
                  : 'text-slate-400 hover:bg-[#2d3a52] dark:hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="hidden lg:block">
                {item.label}
              </span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-[#1a2333]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-[#2d3a52] dark:border-slate-800 space-y-2">
        <button 
           onClick={() => onTabChange('settings')}
           className={`
             w-full flex items-center justify-center lg:justify-start gap-3 p-2 rounded-lg transition-colors group
             ${activeTab === 'settings' ? 'text-[#cfb586] bg-[#2d3a52] dark:bg-slate-800' : 'text-slate-500 hover:text-slate-300'}
           `}
           title="Settings"
        >
          <div className="relative">
            <Settings className="w-5 h-5" />
          </div>
          <span className="hidden lg:block text-sm">Preferences</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block text-sm">Reset Key</span>
        </button>
      </div>
    </div>
  );
};
