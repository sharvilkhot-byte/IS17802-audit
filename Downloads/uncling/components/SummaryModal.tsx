
import React from 'react';
import Button from './Button';
import Card from './Card';

interface SummaryModalProps {
  title: string;
  content: string;
  loading: boolean;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ title, content, loading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4 text-center">{title}</h2>
        <div className="min-h-[10rem] flex items-center justify-center p-4 bg-accent-purple/20 rounded-lg">
          {loading ? (
            <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-forest"></div>
          ) : (
            <p className="text-textSecondary whitespace-pre-wrap">{content}</p>
          )}
        </div>
        <div className="mt-6 text-center">
          <Button onClick={onClose} disabled={loading}>
            Done
          </Button>
        </div>
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

export default SummaryModal;
