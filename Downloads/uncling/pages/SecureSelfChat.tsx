import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { sendSecureChatMessage } from '../services/geminiService';
import { ChatMessage, AttachmentStyle, ChatMode } from '../types';
import { checkForCrisisKeywords } from '../utils/safetyUtils';
import CrisisHelplineModal from '../components/CrisisHelplineModal';
import IdleOverlay from '../components/Chat/IdleOverlay';
import GroundingCard from '../components/Chat/GroundingCard';
import PatternCard from '../components/Chat/PatternCard';
import SessionClose from '../components/Chat/SessionClose';
import { useNavigate } from 'react-router-dom';
import { edgeStateService } from '../services/edgeStateService';
import { getChatStateContent, ChatInternalState, checkSilenceThreshold, isFirstMessageOfDay } from '../services/chatStateService';

// Icons 
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textSecondary hover:text-forest transition-colors"><path d="M15 18l-6-6 6-6" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textSecondary hover:text-red-500 transition-colors"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// Typing Animation
const TypingIndicator = () => (
    <div className="flex space-x-1 items-center p-2 mb-2 animate-fade-in opacity-50">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const SecureSelfChat: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { sessionId } = ReactRouterDOM.useParams<{ sessionId?: string }>();
    const location = ReactRouterDOM.useLocation();

    // Determine Mode from state or URL
    const mode: ChatMode = (location.state?.mode as ChatMode) || 'standard';

    // Core State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatState, setChatState] = useState<ChatInternalState>('idle');
    const [isStreaming, setIsStreaming] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Silence Detection Refs
    const lastActivityRef = useRef<number>(Date.now());
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Special UI Triggers
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [showPatternCard, setShowPatternCard] = useState<{ pattern: string, insight: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- 1. Initialization ---

    useEffect(() => {
        if (!user) return;

        // If sessionId exists, we are continuing/reviewing
        if (sessionId) {
            setChatState('active');
            loadMessages(sessionId);
        } else {
            // New session logic
            if (mode === 'rescue') {
                setChatState('active');
            } else {
                // Check if first message of day
                const isFirst = isFirstMessageOfDay(user.last_check_in_date);
                setChatState(isFirst ? 'first_message' : 'idle');
            }
        }
    }, [sessionId, user, mode]);

    // Silence Detection
    useEffect(() => {
        if (chatState !== 'active' || isStreaming) {
            if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
            return;
        }

        const checkSilence = () => {
            if (checkSilenceThreshold(lastActivityRef.current)) {
                setChatState('silence_holding');
            }
        };

        silenceTimerRef.current = setInterval(checkSilence, 5000); // Check every 5s

        return () => {
            if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
        };
    }, [chatState, isStreaming]);

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

    useEffect(() => { scrollToBottom(); }, [messages, isStreaming, chatState]);

    const loadMessages = async (sid: string) => {
        setMessagesLoading(true);
        const { data } = await supabase.from('chat_history').select('*').eq('session_id', sid).order('created_at', { ascending: true });
        if (data) {
            setMessages(data.map(msg => ({ ...msg, id: String(msg.id) })) as ChatMessage[]);
        }
        setMessagesLoading(false);
        lastActivityRef.current = Date.now();
    };

    // --- 2. Action Handlers ---

    const handleStartChat = async () => {
        if (!user) return;
        setChatState('active');
        lastActivityRef.current = Date.now(); // Reset silence timer

        // Title varies by mode
        let title = 'New Reflection';
        if (mode === 'deep') title = 'Deep Dive';
        else if (mode === 'rescue') title = 'Safety Session';

        const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title }).select().single();
        if (data) {
            // Preserve mode in state when updating URL
            navigate(`/chat/${data.id}`, { state: { mode }, replace: true });
        }
    };

    const handleInputActivity = () => {
        lastActivityRef.current = Date.now();
        if (chatState === 'silence_holding') {
            setChatState('active');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isStreaming) return;

        const text = newMessage.trim();
        setNewMessage('');
        lastActivityRef.current = Date.now();
        if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height

        // 1. Safety Check
        if (checkForCrisisKeywords(text)) {
            setShowCrisisModal(true);
            return;
        }

        // 2. Grounding Check (if not already in rescue mode)
        if (mode !== 'rescue' && text.length > 200 && (text.includes("panicking") || text.includes("overwhelmed"))) {
            setChatState('grounding');
        }

        const tempUserMsg: ChatMessage = {
            id: Date.now().toString(),
            user_id: user!.id,
            session_id: sessionId || 'temp',
            message: text,
            reply: '',
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempUserMsg]);

        // Send to Brain
        setIsStreaming(true);

        try {
            const reply = await sendSecureChatMessage(
                user!.id,
                sessionId || 'temp', // Note: Ideally should be a real session ID
                text
            );

            // Update with reply
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].reply = reply;
                return newMsgs;
            });

            setIsStreaming(false);
            lastActivityRef.current = Date.now();

            // Simple Pattern Check (only in deep/standard mode)
            if (mode !== 'rescue' && Math.random() > 0.85 && messages.length > 4) {
                setChatState('pattern_reflection');
                setShowPatternCard({
                    pattern: "Gentle Noticing",
                    insight: "It seems you pause to check for safety before speaking."
                });
            }

        } catch (error) {
            console.error(error);
            setIsStreaming(false);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].reply = "I'm having trouble connecting to my thoughts right now.";
                return newMsgs;
            });
        }
    };

    // --- 3. Dynamic Styles (Chat States) ---
    const themeStyles = useMemo(() => {
        switch (mode) {
            case 'deep':
                return {
                    bg: "bg-slate-900",
                    header: "bg-slate-900/90 text-slate-200 border-slate-800",
                    userBubble: "bg-indigo-600 text-white shadow-none",
                    aiBubble: "bg-slate-800 text-slate-200 border-slate-700 shadow-none",
                    input: "text-slate-200 placeholder:text-slate-600",
                    footerBg: "from-slate-900 via-slate-900",
                    inputContainer: "bg-slate-800 border-slate-700"
                };
            case 'rescue':
                return {
                    bg: "bg-emerald-50",
                    header: "bg-white/60 text-emerald-800 border-emerald-100",
                    userBubble: "bg-emerald-600 text-white",
                    aiBubble: "bg-white text-slate-700 border-emerald-100",
                    input: "text-slate-800 placeholder:text-slate-400",
                    footerBg: "from-emerald-50 via-emerald-50",
                    inputContainer: "bg-white border-emerald-200"
                };
            case 'review':
                return {
                    bg: "bg-stone-50",
                    header: "bg-stone-100 text-stone-600 border-stone-200",
                    userBubble: "bg-stone-200 text-stone-700",
                    aiBubble: "bg-white text-stone-600 border-stone-200",
                    input: "hidden", // No input in review
                    footerBg: "hidden",
                    inputContainer: "hidden"
                };
            default: // Standard
                return {
                    bg: "bg-slate-50",
                    header: "bg-white/50 backdrop-blur-sm text-textPrimary",
                    userBubble: "bg-forest text-white shadow-sm",
                    aiBubble: "bg-white border-slate-100 text-textPrimary shadow-sm",
                    input: "text-textPrimary placeholder:text-slate-300",
                    footerBg: "from-slate-50 via-slate-50",
                    inputContainer: "bg-white border-slate-200"
                };
        }
    }, [mode]);

    // Derived content for overlays
    const stateContent = getChatStateContent(chatState, mode);

    return (
        <div className={`flex flex-col h-screen relative overflow-hidden transition-colors duration-700 ${themeStyles.bg}`}>

            {/* Header */}
            <header className={`px-6 py-4 flex items-center justify-between z-10 border-b-2 border-transparent ${themeStyles.header}`}>
                <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
                    <BackIcon />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium opacity-90">
                        {mode === 'deep' ? 'Deep Space' : mode === 'rescue' ? 'Safe Ground' : mode === 'review' ? 'Past Session' : 'Reflecting'}
                    </span>
                    {mode === 'standard' && (
                        <span className="text-xs text-moss flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-moss rounded-full animate-pulse"></span>
                            Secure
                        </span>
                    )}
                </div>
                {mode !== 'review' ? (
                    <button onClick={() => setChatState('closing')} className="p-2 -mr-2 rounded-full hover:bg-black/5 transition-colors">
                        <CloseIcon />
                    </button>
                ) : <div className="w-10"></div>}
            </header>

            {/* Overlays / Modals */}
            {(chatState === 'idle' || chatState === 'first_message') && (
                <IdleOverlay
                    title={stateContent.headline}
                    subtitle={stateContent.body}
                    primaryLabel={stateContent.primaryAction}
                    onStart={handleStartChat}
                />
            )}

            {chatState === 'closing' && (
                <SessionClose
                    copy={stateContent} // Pass state content for closing
                    onClose={() => navigate('/dashboard', { state: { fromDeepChat: mode === 'deep' } })}
                    onResume={() => setChatState('active')}
                />
            )}

            {chatState === 'grounding' && (
                <div className="absolute inset-x-0 bottom-0 z-20 pb-20 px-6 bg-gradient-to-t from-white via-white/90 to-transparent animate-slide-up">
                    <GroundingCard
                        onAccept={() => navigate('/rescue')}
                        onDecline={() => setChatState('active')}
                    />
                </div>
            )}

            {/* Silence Holding Toast */}
            {chatState === 'silence_holding' && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-fade-in bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></span>
                    <span className="text-xs font-medium text-slate-500">{stateContent.headline}</span>
                </div>
            )}

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth" onClick={handleInputActivity}>
                {messagesLoading ? (
                    <div className="flex justify-center mt-10"><div className="w-6 h-6 border-2 border-current opacity-30 rounded-full animate-spin" /></div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-8 pb-20">
                        {messages.length === 0 && chatState === 'active' && (
                            <div className="text-center opacity-60 text-sm mt-10 animate-fade-in">
                                {mode === 'deep' ? "Take your time. We can go deep here." : "I'm here. Start wherever you like."}
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className="space-y-6">
                                {/* User Message */}
                                <div className="flex justify-end animate-fade-in-up">
                                    <div className={`px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-base leading-relaxed ${themeStyles.userBubble}`}>
                                        {msg.message}
                                    </div>
                                </div>

                                {/* AI Reply */}
                                {(msg.reply || (isStreaming && index === messages.length - 1)) && (
                                    <div className="flex justify-start animate-fade-in-up delay-100">
                                        <div className={`px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] text-base leading-relaxed ${themeStyles.aiBubble}`}>
                                            {msg.reply}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Pattern Insight Card Injection - In Flow */}
                        {showPatternCard && (
                            <PatternCard
                                pattern={showPatternCard.pattern}
                                insight={showPatternCard.insight}
                                onDismiss={() => {
                                    setShowPatternCard(null);
                                    setChatState('active');
                                }}
                                onExplore={() => {
                                    // Trigger explore flow (could insert a system prompt or navigate to a deep mode)
                                    setNewMessage(`I'd like to explore the pattern: ${showPatternCard.pattern}`);
                                    handleSendMessage();
                                    setShowPatternCard(null);
                                    setChatState('active');
                                }}
                            />
                        )}

                        {isStreaming && !messages[messages.length - 1]?.reply && (
                            <div className="flex justify-start">
                                <TypingIndicator />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input Area */}
            {mode !== 'review' && (
                <footer className={`px-4 pb-6 pt-2 bg-gradient-to-t to-transparent z-10 max-w-2xl mx-auto w-full ${themeStyles.footerBg}`}>
                    <div className={`relative flex items-end gap-2 rounded-3xl shadow-sm p-2 focus-within:ring-2 focus-within:ring-forest/10 transition-all ${themeStyles.inputContainer}`}>
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleInputActivity();
                            }}
                            placeholder={mode === 'deep' ? "Go as slow as you need..." : "What's on your mind?"}
                            className={`flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 leading-relaxed ${themeStyles.input}`}
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
                            className={`p-3 rounded-full transition-all duration-300 ${newMessage.trim()
                                ? 'bg-forest text-white shadow-md hover:bg-blue-600'
                                : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </footer>
            )}

            {showCrisisModal && <CrisisHelplineModal onClose={() => setShowCrisisModal(false)} />}
        </div>
    );
};

export default SecureSelfChat;
