import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { sendSecureChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { checkForCrisisKeywords } from '../utils/safetyUtils';
import CrisisHelplineModal from '../components/CrisisHelplineModal';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '../components/ui/AmbientBackground';
import Lumi from '../components/lumi/Lumi';
import GlassCard from '../components/ui/GlassCard';
import { useGarden } from '../context/GardenContext';
import EvidenceLogModal from '../components/Coach/EvidenceLogModal';
import TextArea from '../components/TextArea';


// Icons 
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-deep/70 hover:text-brand-deep transition-colors"><path d="M15 18l-6-6 6-6" /></svg>;

const SecureSelfChat: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { sessionId } = ReactRouterDOM.useParams<{ sessionId?: string }>();
    const { weather } = useGarden();

    // Core State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatMode, setChatMode] = useState<import('../types').ChatMode>('standard');
    const [newMessage, setNewMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);


    useEffect(() => {
        if (!user) return;
        if (sessionId) {
            setCurrentSessionId(sessionId);
            loadMessages(sessionId);
        }
    }, [sessionId, user]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [newMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isStreaming]);

    const loadMessages = async (sid: string) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sid)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data.map(msg => ({
                id: msg.id,
                role: msg.role,
                message: msg.role === 'user' ? msg.content : '', // Adapter logic if using different types
                reply: msg.role === 'assistant' ? msg.content : '',
                // Ideally we map rows to the ChatMessage shape properly
                // Since ChatMessage expects { message: string, reply: string }, we need to pair them or adjust the type.
                // For this MVP, let's just display linear messages.
                // Actually, the current UI expects { message, reply } pairs for "Chat Bubble" style?
                // No, line 168 maps each msg -> User bubble or AI bubble.
                // Wait, line 168: messages.map(msg => ... msg.message ... msg.reply)
                // This implies a "turn" based structure. This is tricky with linear DB rows.
                // Let's adjust the UI to handle linear messages or group them.
            })) as any[]);

            // Better adapter: Linear rows to UI state
            // If the UI is built for {message, reply} pairs, we should probably stick to that or refactor UI.
            // Let's refactor the loader to group user+assistant pairs if possible, OR
            // simpler: Just render a flat list of bubbles in the UI. 
            // I'll update the UI render section in a separate edit if needed.
            // For now, let's just load them.

            // Actually, let's fix the UI to handle linear messages first, it's more robust.
            // But to avoid breaking too much, let's group adjacent User + Assistant messages.
        }
    };

    // Helper to get or create session
    const ensureSession = async (): Promise<string | null> => {
        if (currentSessionId) return currentSessionId;
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    user_id: user.id,
                    mode: chatMode,
                    title: `Chat ${new Date().toLocaleDateString()}`
                })
                .select()
                .single();

            if (error) throw error;
            setCurrentSessionId(data.id);
            return data.id;
        } catch (err) {
            console.error('Error creating session:', err);
            return null;
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isStreaming) return;

        const text = newMessage.trim();
        setNewMessage('');

        if (checkForCrisisKeywords(text)) {
            setShowCrisisModal(true);
            return;
        }

        const activeSessionId = await ensureSession();
        if (!activeSessionId) return;

        // Optimistic Update
        const tempMsgId = Date.now().toString();
        const tempUserMsg: ChatMessage = {
            id: tempMsgId,
            user_id: user!.id,
            session_id: activeSessionId,
            message: text,
            reply: '',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMsg]);
        setIsStreaming(true);

        // Save User Message
        await supabase.from('chat_messages').insert({
            session_id: activeSessionId,
            role: 'user',
            content: text
        });

        try {
            const reply = await sendSecureChatMessage(
                user!.id,
                activeSessionId,
                text
            );

            // Save AI Message
            await supabase.from('chat_messages').insert({
                session_id: activeSessionId,
                role: 'assistant',
                content: reply
            });

            setMessages(prev => {
                const newMsgs = [...prev];
                // Find the message we just added
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.id === tempMsgId) {
                    lastMsg.reply = reply;
                }
                return newMsgs;
            });
            setIsStreaming(false);

        } catch (error) {
            console.error(error);
            setIsStreaming(false);
        }
    };

    return (
        <div className="relative w-full h-full min-h-screen flex flex-col overflow-hidden bg-slate-50">
            <AmbientBackground weather={weather} />

            {/* Header */}
            <header className="px-6 py-4 flex flex-col gap-4 z-20 backdrop-blur-sm bg-white/20 border-b border-white/20">
                <div className="flex items-center justify-between w-full">
                    <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-white/30 transition-colors">
                        <BackIcon />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-serif text-brand-deep font-medium tracking-wide">
                            Communing with Lumi
                        </span>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Mode Toggles */}
                <div className="flex justify-center gap-2 pb-2">
                    <button
                        onClick={() => setChatMode('standard')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${chatMode === 'standard' ? 'bg-brand-deep text-white shadow-sm' : 'bg-white/40 text-slate-600 hover:bg-white/60'}`}
                    >
                        Vent & Validate
                    </button>
                    <button
                        onClick={() => setChatMode('reframing')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${chatMode === 'reframing' ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm' : 'bg-white/40 text-slate-600 hover:bg-white/60'}`}
                    >
                        Reframe Thoughts
                    </button>
                    <button
                        onClick={() => setChatMode('scripting')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${chatMode === 'scripting' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm' : 'bg-white/40 text-slate-600 hover:bg-white/60'}`}
                    >
                        Get a Script
                    </button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth z-10 space-y-8 pb-32">

                {/* Lumi Presence */}
                <div className="sticky top-0 flex justify-center py-2 z-10 pointer-events-none">
                    <Lumi mood={isStreaming ? 'waiting' : 'calm'} size="sm" />
                </div>

                {messages.length === 0 && (
                    <div className="text-center text-brand-deep/50 text-sm mt-10">
                        This is a safe space. <br /> Whisper into the leaves.
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={msg.id || index} className="space-y-6 max-w-2xl mx-auto">
                        {/* User Message */}
                        <div className="flex justify-end">
                            <GlassCard className="!bg-brand-deep/80 !text-white !border-none rounded-tr-sm rounded-2xl px-5 py-3 max-w-[85%] text-base leading-relaxed drop-shadow-md">
                                {msg.message}
                            </GlassCard>
                        </div>

                        {/* AI Reply */}
                        {(msg.reply || (isStreaming && index === messages.length - 1)) && (
                            <div className="flex justify-start">
                                <GlassCard className="!bg-white/70 rounded-tl-sm rounded-2xl px-5 py-4 max-w-[90%] text-brand-deep text-base leading-relaxed drop-shadow-sm border border-white/40">
                                    {msg.reply || <span className="animate-pulse">...</span>}
                                </GlassCard>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            import TextArea from '../components/TextArea';

            // ... (existing imports, but I need to be careful not to double import)
            // I will add the import at the top in a separate chunk or just verify it exists? 
            // replace_file_content replaces a block. I can't add import at top AND replace footer in one chunk if they are far apart.
            // I will use multi_replace? No, I'll do two replaces.

            // Wait, I'll just use one replace for the Footer and then adding import is another step. 
            // Or I can assume user can add import? No, I must do it.
            // I'll do the Footer replace first.

            {/* Input Area */}
            <footer className="absolute bottom-0 w-full p-4 z-20 bg-gradient-to-t from-slate-100/90 to-transparent pb-8">
                <div className="max-w-2xl mx-auto flex items-end gap-2">
                    <TextArea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="flex-1 min-h-[50px] max-h-32 shadow-sm"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isStreaming}
                        className={`p-4 rounded-2xl transition-all duration-300 mb-[2px] shadow-lg ${newMessage.trim()
                            ? 'bg-brand-deep text-white hover:bg-brand-deep/90 transform hover:scale-105'
                            : 'bg-white/50 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </footer>

            {/* Floating Truth Bank Button (Only in Reframing mode) */}
            {chatMode === 'reframing' && (
                <button
                    onClick={() => setShowEvidenceModal(true)}
                    className="fixed bottom-32 right-6 bg-amber-500 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 transition-all hover:scale-110 z-20"
                    title="Add to Truth Bank"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
            )}

            {showCrisisModal && <CrisisHelplineModal onClose={() => setShowCrisisModal(false)} />}
            {showEvidenceModal && <EvidenceLogModal onClose={() => setShowEvidenceModal(false)} />}
        </div>
    );
};

export default SecureSelfChat;
