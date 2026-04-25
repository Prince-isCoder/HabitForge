import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { mockChatHistory } from '../services/dummyData';
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
        ? <strong key={j} style={{ color: "#e2e8f0", fontWeight: 600 }}>{part}</strong>
        : part
    );

    // Section headers — lines ending with : and short
    const isHeader = line.trim().endsWith(":") && line.trim().length < 50;

    // Bullet lines
    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");

    if (isHeader) return (
      <div key={i} style={{
        fontWeight: 700,
        color: "#38bdf8",
        fontSize: 13,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginTop: 12,
        marginBottom: 4
      }}>
        {formatted}
      </div>
    );

    if (isBullet) return (
      <div key={i} style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginBottom: 5,
        paddingLeft: 2
      }}>
        <span style={{ color: "#38bdf8", flexShrink: 0, marginTop: 2 }}>•</span>
        <span>{formatted}</span>
      </div>
    );

    return (
      <div key={i} style={{ marginBottom: 5 }}>
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
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #0f1117 0%, #141824 50%, #0f1117 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .coach-card {
          width: 100%;
          max-width: 720px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(12px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,179,237,0.04);
        }

        .coach-header {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(90deg, rgba(56,189,248,0.06) 0%, transparent 100%);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-icon-wrap {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(56,189,248,0.35);
          flex-shrink: 0;
        }

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #f0f6ff;
          letter-spacing: -0.01em;
        }

        .header-sub {
          font-size: 12px;
          color: #4a90b8;
          margin-top: 2px;
          font-weight: 400;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 8px #34d399;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #34d399; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #34d399; }
        }

        .chat-area {
          height: 420px;
          overflow-y: auto;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scrollbar-width: thin;
          scrollbar-color: rgba(56,189,248,0.2) transparent;
        }

        .chat-area::-webkit-scrollbar { width: 4px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 4px; }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: rgba(255,255,255,0.18);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          background: rgba(56,189,248,0.06);
          border: 1px solid rgba(56,189,248,0.12);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          box-shadow: 0 0 12px rgba(56,189,248,0.25);
        }

        .msg-avatar.user-av {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
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
          background: rgba(56,189,248,0.07);
          border: 1px solid rgba(56,189,248,0.14);
          color: #cce9f8;
          border-top-left-radius: 4px;
        }

        .msg-bubble.user-bubble {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8f0f8;
          border-top-right-radius: 4px;
          text-align: right;
        }

        .msg-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
          opacity: 0.5;
          color: #94b8cc;
        }

        .msg-label.right { text-align: right; }

        .typing-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          animation: msgIn 0.25s ease-out;
        }

        .typing-bubble {
          background: rgba(56,189,248,0.07);
          border: 1px solid rgba(56,189,248,0.14);
          border-radius: 16px;
          border-top-left-radius: 4px;
          padding: 14px 18px;
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: #38bdf8;
          border-radius: 50%;
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
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.15);
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .input-wrapper {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.07);
        }

        .chat-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #e2f0f8;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          padding: 13px 16px;
          resize: none;
          line-height: 1.5;
        }

        .chat-input::placeholder { color: rgba(255,255,255,0.25); }

        .send-btn {
          width: 46px;
          height: 46px;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          border: none;
          border-radius: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 16px rgba(56,189,248,0.3);
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(56,189,248,0.45);
        }

        .send-btn:active:not(:disabled) { transform: scale(0.95); }

        .send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        .footer-hint {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.18);
          margin-top: 10px;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="coach-card">

        {/* Header */}
        <div className="coach-header">
          <div className="header-icon-wrap">
            <Sparkles size={20} color="#fff" />
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
                <Bot size={22} color="rgba(56,189,248,0.5)" />
              </div>
              <span>Ask your AI coach anything about your habits</span>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} className={cn("msg-row", c.role === "user" ? "user" : "")}>
              <div className={cn("msg-avatar", c.role === "user" ? "user-av" : "ai")}>
                {c.role === "user"
                  ? <User size={15} color="rgba(255,255,255,0.6)" />
                  : <Bot size={15} color="#fff" />
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
                <Bot size={15} color="#fff" />
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
            <Send size={18} color="#fff" />
          </button>
        </div>

        <div className="footer-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
};

export default AICoach;