import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, Mic, MicOff, Volume2, VolumeX, Trash2, Copy, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

// ─── Markdown-lite formatter ──────────────────────────────────────────────
const FormatMessage = ({ content, isUser }) => {
  const lines = content.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} style={{ color: isUser ? '#000' : '#D4FF33', fontWeight: 700 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        });

        const isList = line.trim().match(/^[-•*]|\d+\./);
        return (
          <div key={i} className={`mb-1 ${isList ? 'pl-3 border-l-2 border-[#D4FF33]/30 my-1.5' : ''}`}>
            {formatted}
          </div>
        );
      })}
    </div>
  );
};

// ─── Welcome message factory ──────────────────────────────────────────────
// ✅ FIX #7: isWelcome flag ensures welcome is never sent as AI history,
// even after clearChat() creates a new welcome with a different id.
const makeWelcomeMessage = (user, id = 'welcome') => ({
  id,
  role:      'ai',
  isWelcome: true,
  content: `Hello ${user?.name?.split(' ')[0] || 'Champion'}! 👋\n\nI am your **AI Coach** powered by Gemini. I see your goal is **${user?.fitnessGoal || 'General Fitness'}**.\n\nAsk me anything — workout plans, nutrition advice, recovery tips, or anything fitness related. I'll give you personalised advice!`,
});

// ─── Component ────────────────────────────────────────────────────────────
const AICoach = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);

  const [messages,       setMessages]       = useState([makeWelcomeMessage(user)]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [isListening,    setIsListening]    = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [copiedId,       setCopiedId]       = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isVoiceEnabled) synthRef.current?.cancel();
  }, [isVoiceEnabled]);

  useEffect(() => {
    const synth = synthRef.current;

    return () => {
      synth?.cancel();
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!isVoiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/[-•]\s/g, '')
      .trim();
    const utterance   = new SpeechSynthesisUtterance(clean);
    utterance.rate    = 1.05;
    utterance.pitch   = 1;
    utterance.volume  = 1;
    utterance.onstart = () => { if (!isVoiceEnabled) synthRef.current?.cancel(); };
    synthRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  const recognitionRef = useRef(null);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
    const rec          = new SR();
    rec.lang           = 'en-US';
    rec.continuous     = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
      recognitionRef.current = null;
    };
    rec.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    rec.onend   = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopListening   = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const toggleListening = () => { if (isListening) stopListening(); else startListening(); };
  const toggleVoice     = () => { synthRef.current?.cancel(); setIsVoiceEnabled(prev => !prev); };

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clearChat = () => {
    synthRef.current?.cancel();
    setMessages([makeWelcomeMessage(user, Date.now().toString())]);
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    synthRef.current?.cancel();

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    inputRef.current?.focus();

    // ✅ FIX #7: filter by isWelcome flag, not fragile id === '0'
    const history = messages
      .filter(m => !m.isWelcome)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res  = await fetch('http://localhost:5000/api/ai/chat', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${user.token}`,
        },
        body: JSON.stringify({ message: text, history }),
      });

      const data      = await res.json();
      const replyText = data.reply || data.response || '⚠️ No response received.';

      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    'ai',
        content: replyText,
        source:  data.source,
      }]);

      if (isVoiceEnabled) speakText(replyText);

    } catch (error) {
      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    'ai',
        content: '⚠️ **Connection Error.** Make sure your backend is running on port 5000.',
        source:  'error',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '💪 Give me a chest workout',
    '🥗 What should I eat post-workout?',
    '😴 How much sleep do I need?',
    '🔥 How do I lose fat faster?',
    '📈 How to build muscle?',
    '💧 Daily water intake?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]" style={{ backgroundColor: t.bg }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: t.borderHex, backgroundColor: t.navBgHex }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D4FF33] rounded-xl">
            <Bot size={20} className="text-black" />
          </div>
          <div>
            <h1 className="font-black text-base uppercase tracking-tight" style={{ color: t.textHex }}>
              AI Coach
            </h1>
            <p className="text-[10px]" style={{ color: t.subtextHex }}>
              Powered by Gemini 2.0 Flash
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(74,222,128,0.12)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={clearChat}
            className="p-2 rounded-lg transition-opacity hover:opacity-70"
            title="Clear chat"
            style={{ color: t.subtextHex, backgroundColor: t.card }}>
            <Trash2 size={16} />
          </button>
          <button onClick={toggleVoice}
            className="p-2 rounded-lg transition-all"
            title={isVoiceEnabled ? 'Mute voice' : 'Enable voice'}
            style={isVoiceEnabled
              ? { backgroundColor: '#D4FF33', color: '#000' }
              : { backgroundColor: t.card, color: t.subtextHex }}>
            {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI avatar */}
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-[#D4FF33] flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={13} className="text-black" />
              </div>
            )}

            {/* ✅ FIX: Bubble wrapper — was missing closing </div> in original */}
            <div className="group relative max-w-[80%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
                style={msg.role === 'user'
                  ? { backgroundColor: '#D4FF33', color: '#000', fontWeight: 600 }
                  : { backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex, border: `1px solid ${t.borderHex}` }
                }
              >
                <FormatMessage content={msg.content} isUser={msg.role === 'user'} />

                {/* ── Source badge ── */}
                {msg.role === 'ai' && !msg.isWelcome && msg.source && (
                  <div className="mt-2 pt-2 border-t flex items-center gap-1.5"
                    style={{ borderColor: t.borderHex }}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      msg.source === 'ai'        ? 'bg-green-400'  :
                      msg.source === 'ai-direct' ? 'bg-blue-400'   :
                      msg.source === 'rule'      ? 'bg-yellow-400' :
                      msg.source === 'fallback'  ? 'bg-orange-400' :
                                                   'bg-red-400'
                    }`} />
                    <span className="text-[10px] font-medium" style={{ color: t.subtextHex }}>
                      {msg.source === 'ai'        ? '🤖 Gemini AI'      :
                       msg.source === 'ai-direct' ? '🌐 Gemini Direct'  :
                       msg.source === 'rule'      ? '⚡ Rule-based'      :
                       msg.source === 'fallback'  ? '📚 Smart Fallback' :
                                                    '❌ Error'}
                    </span>
                  </div>
                )}
              </div>{/* ← closes the bubble inner div */}

              {/* Copy button */}
              {msg.role === 'ai' && (
                <button
                  onClick={() => copyMessage(msg.id, msg.content)}
                  className="absolute -bottom-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-xs flex items-center gap-1"
                  style={{ color: t.subtextHex }}
                >
                  {copiedId === msg.id
                    ? <><Check size={11} className="text-green-400" /><span className="text-green-400">Copied</span></>
                    : <><Copy size={11} />Copy</>
                  }
                </button>
              )}
            </div>{/* ← closes group relative wrapper */}

            {/* User avatar */}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#D4FF33] flex items-center justify-center shrink-0 mt-1 text-black font-bold text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#D4FF33] flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-black" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm border"
              style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs ml-1" style={{ color: t.subtextHex }}>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>{/* ← closes messages scroll container */}

      {/* ── Quick Prompts ────────────────────────────────────────────────── */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs mb-2 font-bold uppercase tracking-wider" style={{ color: t.subtextHex }}>
            Quick questions
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:border-[#D4FF33] hover:text-[#D4FF33] transition-all"
                style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t shrink-0"
        style={{ borderColor: t.borderHex, backgroundColor: t.navBgHex }}>
        <div className="flex items-end gap-2">

          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all shrink-0 ${isListening ? 'animate-pulse' : ''}`}
            style={isListening
              ? { backgroundColor: '#ef4444', color: '#fff' }
              : { backgroundColor: t.card, color: t.subtextHex }}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              className="w-full border rounded-xl px-4 py-3 pr-4 text-sm focus:border-[#D4FF33] outline-none transition-colors resize-none"
              style={{
                backgroundColor: t.input,
                borderColor:     t.borderHex,
                color:           t.textHex,
                maxHeight:       '120px',
                overflowY:       'auto',
              }}
              placeholder={isListening ? '🎤 Listening...' : 'Ask your coach anything...'}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl transition-all shrink-0 disabled:opacity-40"
            style={{ backgroundColor: '#D4FF33', color: '#000' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;