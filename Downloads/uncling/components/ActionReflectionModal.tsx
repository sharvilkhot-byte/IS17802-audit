
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

interface ActionReflectionModalProps {
  actionTitle: string;
  onClose: () => void;
  onSave: (status: 'completed' | 'skipped', note: string) => void;
}

const ActionReflectionModal: React.FC<ActionReflectionModalProps> = ({ actionTitle, onClose, onSave }) => {
  const [step, setStep] = useState<'initial' | 'reflecting'>('initial');
  const [status, setStatus] = useState<'completed' | 'skipped'>('completed');
  const [note, setNote] = useState('');

  const handleInitialChoice = (chosenStatus: 'completed' | 'skipped') => {
    setStatus(chosenStatus);
    setStep('reflecting');
  };

  const handleSave = () => {
    onSave(status, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <Card className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h3 className="text-lg font-bold text-textPrimary mb-2 pr-6">{actionTitle}</h3>

        {step === 'initial' ? (
          <div className="py-4">
            <p className="text-textSecondary mb-6">Did you get a chance to practice this today?</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleInitialChoice('completed')}
                className="flex flex-col items-center justify-center p-4 border-2 border-moss/30 rounded-xl hover:bg-moss/10 hover:border-moss transition-all"
              >
                <span className="text-2xl mb-2">🌿</span>
                <span className="font-semibold text-forest">Yes, I did</span>
              </button>
              <button 
                onClick={() => handleInitialChoice('skipped')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <span className="text-2xl mb-2">🤔</span>
                <span className="font-semibold text-textSecondary">Not yet / No</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-textPrimary font-medium mb-3">
              {status === 'completed' 
                ? "That's great. How did it make you feel?" 
                : "That's completely okay. What felt difficult about it?"}
            </p>
            <textarea
              className="w-full h-24 p-3 bg-background/50 rounded-xl border border-moss/30 focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-shadow mb-4 text-sm"
              placeholder={status === 'completed' ? "I felt calm..." : "I felt too anxious to try..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
                <button onClick={() => setStep('initial')} className="text-textSecondary text-sm font-medium hover:underline">Back</button>
                <Button onClick={handleSave} disabled={!note.trim()} className="!py-2 !px-6">
                    Save Reflection
                </Button>
            </div>
          </div>
        )}
      </Card>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ActionReflectionModal;
