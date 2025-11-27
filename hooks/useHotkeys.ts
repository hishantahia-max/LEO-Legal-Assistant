
import { useEffect } from 'react';

type KeyCombo = {
  key?: string;
  combo?: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
};

export const useHotkeys = (shortcuts: { combo: string; handler: (e: KeyboardEvent) => void }[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ combo, handler }) => {
        const keys = combo.toLowerCase().split('+');
        const mainKey = keys[keys.length - 1];
        
        const ctrlRequired = keys.includes('ctrl') || keys.includes('cmd');
        const altRequired = keys.includes('alt');
        const shiftRequired = keys.includes('shift');

        const ctrlPressed = event.ctrlKey || event.metaKey;
        const altPressed = event.altKey;
        const shiftPressed = event.shiftKey;

        if (
          event.key.toLowerCase() === mainKey &&
          ctrlPressed === ctrlRequired &&
          altPressed === altRequired &&
          shiftPressed === shiftRequired
        ) {
          event.preventDefault();
          handler(event);
        }
      });
      
      // Special case for ESC
      if (event.key === 'Escape') {
         const escHandler = shortcuts.find(s => s.combo.toLowerCase() === 'esc');
         if (escHandler) escHandler.handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
