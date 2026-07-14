import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

// ✅ Markdown-style formatter for AI responses
const formatMessage = (text) => {
  if (!text) return null;

  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    // Replace **bold** with <strong>
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} className="text-text font-bold">{part}</strong>
        : part
    );

    // Section headers — lines ending with : and short
    const isHeader = line.trim().endsWith(":") && line.trim().length < 50;

    // Bullet lines
    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");

    if (isHeader) return (
      <div key={i} className="font-bold text-primary text-[13px] tracking-widest uppercase mt-3 mb-1">
        {formatted}
      </div>
    );

    if (isBullet) return (
      <div key={i} className="flex gap-2 items-start mb-1 pl-0.5">
        <span className="text-primary shrink-0 mt-0.5">•</span>
        <span>{formatted}</span>
      </div>
    );

    return (
      <div key={i} className="mb-1">
        {formatted}
      </div>
    );
  });
};

const AICoach = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => res.json()).then(data => setAnalytics(data));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = [...chat, { role: "user", content: message }];
    setChat(newChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          messages: newChat,
          analytics: analytics
        })
      });

      const data = await res.json();
      setChat([...newChat, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-surface to-background min-h-screen flex items-center justify-center p-6">
      <style>{`
        .coach-card {
          width: 100%;
          max-width: 720px;
          @apply bg-surface border border-border/50 rounded-[24px] overflow-hidden backdrop-blur-xl shadow-2xl;
        }

        .coach-header {
          padding: 20px 28px;
          @apply border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-3.5;
        }

        .header-icon-wrap {
          width: 42px;
          height: 42px;
          @apply bg-gradient-to-br from-primary to-primaryHover rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0;
        }

        .header-title {
          @apply text-base font-semibold text-text tracking-tight;
        }

        .header-sub {
          @apply text-xs text-textMuted mt-0.5 font-normal;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          @apply bg-success rounded-full shadow-lg shadow-success/50;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; @apply shadow-success/50; }
          50% { opacity: 0.6; @apply shadow-success/80; }
        }

        .chat-area {
          height: 420px;
          overflow-y: auto;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scrollbar-width: thin;
          scrollbar-color: var(--primary) transparent;
        }

        .chat-area::-webkit-scrollbar { width: 4px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          @apply text-textMuted/40 text-[13px] font-normal tracking-wide;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          @apply bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center;
        }

        .msg-row {
          display: flex;
          gap: 12px;
          animation: msgIn 0.25s ease-out;
        }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .msg-row.user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .msg-avatar.ai {
          @apply bg-gradient-to-br from-primary to-primaryHover shadow-lg shadow-primary/20;
        }

        .msg-avatar.user-av {
          @apply bg-surfaceLight/50 border border-border/50;
        }

        .msg-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 400;
        }

        .msg-bubble.ai-bubble {
          @apply bg-primary/5 border border-primary/10 text-text rounded-tl-[4px];
        }

        .msg-bubble.user-bubble {
          @apply bg-surfaceLight/50 border border-border/50 text-text rounded-tr-[4px] text-right;
        }

        .msg-label {
          @apply text-[11px] font-medium tracking-widest uppercase mb-1 opacity-50 text-textMuted;
        }

        .msg-label.right { text-align: right; }

        .typing-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          animation: msgIn 0.25s ease-out;
        }

        .typing-bubble {
          @apply bg-primary/5 border border-primary/10 rounded-2xl rounded-tl-[4px] p-[14px_18px] flex gap-1.5 items-center;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          @apply bg-primary rounded-full;
          animation: bounce 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .input-area {
          padding: 18px 28px 24px;
          @apply border-t border-border/40 bg-surface/30 flex gap-3 items-end;
        }

        .input-wrapper {
          flex: 1;
          @apply bg-surfaceLight/50 border border-border/50 rounded-2xl overflow-hidden transition-all;
        }

        .input-wrapper:focus-within {
          @apply border-primary/40 shadow-lg shadow-primary/5;
        }

        .chat-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          @apply text-text text-sm font-normal p-[13px_16px] resize-none leading-relaxed;
        }

        .chat-input::placeholder { @apply text-textMuted/40; }

        .send-btn {
          width: 46px;
          height: 46px;
          @apply bg-gradient-to-br from-primary to-primaryHover border-none rounded-[13px] cursor-pointer flex items-center justify-center transition-all shadow-lg shadow-primary/30 shrink-0;
        }

        .send-btn:hover:not(:disabled) {
          @apply -translate-y-px shadow-xl shadow-primary/45;
        }

        .send-btn:active:not(:disabled) { transform: scale(0.95); }

        .send-btn:disabled {
          @apply opacity-35 cursor-not-allowed shadow-none;
        }

        .footer-hint {
          text-align: center;
          @apply text-[11px] text-textMuted/40 mt-2.5 tracking-wide;
        }
      `}</style>

      <div className="coach-card">

        {/* Header */}
        <div className="coach-header">
          <div className="header-icon-wrap">
            <Sparkles size={20} className="text-primaryContent" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="header-title">AI Coach</div>
            <div className="header-sub">Powered by your habit analytics</div>
          </div>
          <div className="status-dot" title="Online" />
        </div>

        {/* Chat Messages */}
        <div className="chat-area">
          {chat.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <Bot size={22} className="text-primary/50" />
              </div>
              <span>Ask your AI coach anything about your habits</span>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} className={cn("msg-row", c.role === "user" ? "user" : "")}>
              <div className={cn("msg-avatar", c.role === "user" ? "user-av" : "ai")}>
                {c.role === "user"
                  ? <User size={15} className="text-textMuted/60" />
                  : <Bot size={15} className="text-primaryContent" />
                }
              </div>
              <div>
                <div className={cn("msg-label", c.role === "user" ? "right" : "")}>
                  {c.role === "user" ? "You" : "Coach"}
                </div>
                <div className={cn("msg-bubble", c.role === "user" ? "user-bubble" : "ai-bubble")}>
                  {c.role === "user" ? c.content : formatMessage(c.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-row">
              <div className="msg-avatar ai">
                <Bot size={15} className="text-primaryContent" />
              </div>
              <div>
                <div className="msg-label">Coach</div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <input
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your progress, streaks, goals..."
              disabled={loading}
            />
          </div>
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            title="Send message"
          >
            <Send size={18} className="text-primaryContent" />
          </button>
        </div>

        <div className="footer-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
};

export default AICoach;