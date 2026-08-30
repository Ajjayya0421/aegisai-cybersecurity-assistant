import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Copy, Check, Volume2, VolumeX, ShieldAlert, CornerDownRight, AlertTriangle } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { sendChatMessage } from '../services/api';
import { getUserChats, saveUserChatMessage, clearUserChats, subscribeToUserChats } from '../services/storage';

interface ChatAssistantProps {
  user: UserProfile;
}

const SAMPLE_QUESTIONS = [
  'How do I protect my team against Spear-Phishing and BEC attacks?',
  'Explain Zero Trust Architecture in simple terms',
  'What is the blue-team defense against SQL Injection and XSS?',
  'How should I respond to an active Ransomware outbreak?',
  'What are best practices for securing API keys and Secrets in Cloud Run?',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getUserChats(user.uid));
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Realtime subscription to user's private Firestore chats
    const unsubscribe = subscribeToUserChats(user.uid, (loaded) => {
      setMessages(loaded);
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: query.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveUserChatMessage(user.uid, userMsg);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query.trim(), newMessages);
      
      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        content: response.reply,
        timestamp: response.timestamp || Date.now(),
        tags: ['Gemini 3.6 Flash', 'Defensive AI', 'Firestore Synced'],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      saveUserChatMessage(user.uid, assistantMsg);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to communicate with the Gemini AI service.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation history with Gemini in Cloud Firestore?')) {
      await clearUserChats(user.uid);
      setMessages(getUserChats(user.uid));
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_]/g, ''));
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(id);
    }
  };

  return (
    <div id="cyber-chat-assistant" className="max-w-5xl mx-auto px-4 py-6">
      {/* Editorial Card Layout */}
      <div className="bg-[#0a0c10] border border-[#1f2937] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] bg-[#0d0e12] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#111827] border border-[#1f2937] rounded-lg flex items-center justify-center text-[#00f2fe]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Security Assistant</h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Defensive Advisory // Gemini 3.6 Flash & Firestore Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111827] px-3 py-1 rounded-full border border-[#1f2937]">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Active
              </span>
            </div>
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-[#1f2937] hover:border-rose-700/40 transition-all"
              title="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Defensive Guideline Banner */}
        <div className="px-6 py-2.5 bg-[#050608] border-b border-[#1f2937] flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00f2fe] shrink-0" />
            <span>Blue-Team Heuristics: Defensive advisory, hardening playbooks, and questions securely isolated to your account.</span>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="min-h-[400px] max-h-[550px] overflow-y-auto p-6 space-y-6 bg-[#050608]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.sender === 'user' ? 'justify-start' : 'justify-end'
              }`}
            >
              {/* User Message */}
              {msg.sender === 'user' && (
                <>
                  <div className="w-8 h-8 rounded bg-[#1f2937] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-300">
                    US
                  </div>
                  <div className="bg-[#111827] p-4 rounded-2xl rounded-tl-none border border-[#1f2937] max-w-[85%]">
                    <p className="text-xs leading-relaxed text-[#e0e0e0] whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Assistant Message */}
              {msg.sender === 'assistant' && (
                <>
                  <div className="bg-[#00f2fe]/10 p-4 rounded-2xl rounded-tr-none border border-[#00f2fe]/20 max-w-[85%]">
                    <div className="text-xs leading-relaxed text-[#e0e0e0] whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>

                    <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#00f2fe]/15 text-[10px] font-mono text-gray-400">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className="hover:text-[#00f2fe] transition-colors"
                          title={isSpeaking === msg.id ? 'Stop Speech' : 'Read Aloud'}
                        >
                          {isSpeaking === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#00f2fe]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-[#00f2fe] transition-colors flex items-center gap-1"
                          title="Copy Response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400">Copied</span>
                            </>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Suggested Inquiries */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#00f2fe]/10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-[#00f2fe]" />
                          <span>Suggested Next Steps:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowups.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(suggestion)}
                              className="text-[11px] px-2.5 py-1 rounded bg-[#0a0c10] hover:bg-[#111827] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] transition-all text-left font-mono"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded bg-[#00f2fe] flex-shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                    <span className="text-[10px] font-bold text-black font-mono">AI</span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex gap-4 justify-end">
              <div className="bg-[#00f2fe]/10 p-4 rounded-2xl rounded-tr-none border border-[#00f2fe]/20 text-xs font-mono text-[#00f2fe] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping"></span>
                <span>Formulating defensive mitigation and reasoning heuristics...</span>
              </div>
              <div className="w-8 h-8 rounded bg-[#00f2fe] flex-shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                <span className="text-[10px] font-bold text-black font-mono">AI</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="px-6 py-3 bg-rose-950/50 border-t border-rose-800/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Sample Questions */}
        <div className="px-6 py-3 bg-[#0d0e12] border-t border-[#1f2937]">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
            Recommended Inquiries
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs px-3 py-1 rounded bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] transition-all font-mono disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0d0e12] border-t border-[#1f2937]">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vulnerabilities, compliance, or defense..."
              rows={2}
              disabled={isLoading}
              className="w-full bg-[#111827] border border-[#1f2937] rounded-lg py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-[#00f2fe] transition-colors placeholder-gray-600 text-[#e0e0e0] font-sans resize-none"
            />
            <button
              id="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-3 top-3 p-2 bg-[#00f2fe] text-black rounded-lg shadow-[0_0_10px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
