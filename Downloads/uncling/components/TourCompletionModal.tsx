

import React from 'react';
import Card from './Card';
import Button from './Button';

interface TourCompletionModalProps {
  onClose: () => void;
}

const TourCompletionModal: React.FC<TourCompletionModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <Card className="w-full max-w-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-forest mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {/* Fix: Corrected SVG attribute casing from strokeLinecap/strokeLinejoin to strokeLineCap/strokeLineJoin. */}
            <path strokeLineCap="round" strokeLineJoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">You're All Set!</h2>
        <p className="text-textSecondary mb-6">
          You now have all the tools you need for your journey. Remember to be patient and compassionate with yourself. We're here to support you every step of the way.
        </p>
        <Button onClick={onClose} className="w-full">
          Start Exploring
        </Button>
      </Card>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TourCompletionModal;
