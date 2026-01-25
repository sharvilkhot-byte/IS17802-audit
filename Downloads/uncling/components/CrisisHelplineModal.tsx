import React from 'react';

interface CrisisHelplineModalProps {
  onClose: () => void;
}

// Fix: Corrected typo in component name from CrisisHelpolineModal to CrisisHelplineModal.
const CrisisHelplineModal: React.FC<CrisisHelplineModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-warning-bg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg border-2 border-warning-border">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-warning-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {/* Fix: Corrected SVG attribute casing from strokeLinecap/strokeLinejoin to strokeLinecap/strokeLinejoin. */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-2xl font-semibold text-warning-text">It looks like you're in distress.</h2>
          <p className="mt-2 text-warning-text/90">
            If you are in immediate danger, please reach out for help. You are not alone, and there is support available.
          </p>
        </div>

        <div className="mt-6 space-y-4 text-left">
          <h3 className="font-semibold text-warning-text text-center">Crisis Support Hotlines:</h3>
          <p className="text-sm text-warning-text/90">These services are free, confidential, and available 24/7.</p>
          <ul className="list-disc list-inside space-y-2 text-warning-text">
            <li><span className="font-bold">USA & Canada:</span> Call or text <a href="tel:988" className="underline font-bold">988</a></li>
            <li><span className="font-bold">United Kingdom:</span> Call <a href="tel:111" className="underline font-bold">111</a></li>
            <li><span className="font-bold">International:</span> Check <a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">findahelpline.com</a> for resources in your country.</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-warning-border text-white font-semibold rounded-full hover:bg-opacity-80 transition-colors"
          >
            I understand, close this.
          </button>
        </div>
      </div>
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

export default CrisisHelplineModal;
