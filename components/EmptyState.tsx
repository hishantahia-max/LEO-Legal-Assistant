import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-stone-400">
      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-stone-300" />
      </div>
      <h3 className="text-lg font-bold text-stone-600 mb-1">{title}</h3>
      <p className="text-sm max-w-xs mx-auto">{message}</p>
    </div>
  );
};