


import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTriggerSupport } from '../services/geminiService';
import { InsightTrigger, AttachmentStyle } from '../types';
import { copingToolsLibrary, CopingTool } from '../data/copingTools';
import Button from './Button';
import Card from './Card';
import InteractiveToolModal from './InteractiveToolModal';

interface TriggerSupportModalProps {
  trigger: InsightTrigger;
  onClose: () => void;
}

const TriggerSupportModal: React.FC<TriggerSupportModalProps> = ({ trigger, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [support, setSupport] = useState<{ compassionateMessage: string; suggestedToolKey: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [suggestedTool, setSuggestedTool] = useState<CopingTool | null>(null);
    const [showInteractiveTool, setShowInteractiveTool] = useState(false);

    useEffect(() => {
        const fetchSupport = async () => {
            if (!user || !user.attachment_style) return;
            setLoading(true);
            setError(null);
            
            const supportData = await getTriggerSupport(trigger, user.attachment_style);

            if (supportData) {
                setSupport(supportData);
                const tool = copingToolsLibrary[user.attachment_style]?.find(t => t.key === supportData.suggestedToolKey);
                if (tool) {
                    setSuggestedTool(tool);
                }
            } else {
                setError("Sorry, Lumora couldn't generate a suggestion right now. Please try again later.");
            }
            setLoading(false);
        };
        fetchSupport();
    }, [trigger, user]);

    const handleStartTool = () => {
        setShowInteractiveTool(true);
    };

    if (showInteractiveTool && suggestedTool) {
        return <InteractiveToolModal tool={suggestedTool} onClose={() => {
            setShowInteractiveTool(false);
            onClose(); // Also close the support modal
        }} />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
            <Card className="w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-textPrimary hover:text-forest" aria-label="Close support modal">
                    {/* Fix: Corrected SVG attribute casing from strokeLinecap/strokeLinejoin to strokeLineCap/strokeLineJoin. */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-2xl font-semibold text-textPrimary mb-4 text-center">Working With a Trigger</h2>
                <div className="min-h-[15rem] flex flex-col items-center justify-center p-4 bg-accent-purple/20 rounded-lg">
                    {loading ? (
                        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-forest"></div>
                    ) : error ? (
                        <p className="text-textPrimary/90 text-center">{error}</p>
                    ) : (
                        <>
                            <p className="text-textPrimary/90 whitespace-pre-wrap text-center mb-6">{support?.compassionateMessage}</p>
                            {suggestedTool && (
                                <>
                                    <p className="text-textSecondary text-center text-sm">To help with this feeling, Lumora suggests this exercise:</p>
                                    <h3 className="font-semibold text-forest text-lg text-center mt-2">{suggestedTool.title}</h3>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className="mt-6 text-center">
                    {suggestedTool && !loading && !error && (
                        <Button onClick={handleStartTool}>
                            Start Exercise &rarr;
                        </Button>
                    )}
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

export default TriggerSupportModal;
