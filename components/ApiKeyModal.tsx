import React, { useState } from 'react';
import { Key, Lock, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onSave, onClose }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-6 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">API Configuration</h2>
            <p className="text-blue-100 text-sm">Enter your Gemini API Key to continue</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Google Gemini API Key</label>
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <p className="text-xs text-slate-500">
              The key is stored locally in your browser session only.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!key}
              onClick={() => onSave(key)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};