
import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useScreenSize } from '../hooks/useScreenSize';
import { ActiveTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const { isMobile } = useScreenSize();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f7f5]">
      {/* Sidebar - Visible on Desktop/Tablet (md+) */}
      {!isMobile && (
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-hidden relative h-full w-full">
          {children}
        </main>

        {/* Bottom Nav - Visible on Mobile (< md) */}
        {isMobile && (
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        )}
      </div>
    </div>
  );
};
