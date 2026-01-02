

import React from 'react';
import Card from './Card';
import Button from './Button';

interface SettingsModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <Card className="w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-textPrimary hover:text-forest" aria-label="Close">
            {/* Fix: Corrected SVG attribute casing from strokeLinecap/strokeLinejoin to strokeLineCap/strokeLineJoin. */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-2xl font-bold text-textPrimary mb-4">{title}</h2>
        <div>{children}</div>
      </Card>
    </div>
  );
};

export default SettingsModal;
