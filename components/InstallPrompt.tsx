import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="text-stone-600 hover:bg-stone-50 p-2 md:px-3 md:py-2 rounded-lg text-sm font-medium border border-transparent hover:border-stone-200 transition-all flex items-center gap-2"
    >
      <Download className="w-5 h-5 md:w-4 md:h-4" />
      <span className="hidden md:inline">Install App</span>
    </button>
  );
};