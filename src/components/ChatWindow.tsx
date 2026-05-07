'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Brain, User, Bot } from 'lucide-react';
import type { Message } from '@/app/page';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  emotion: string;
  onRegenerate: () => void;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ messages, isLoading, onRegenerate }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="chat-messages">
      <div className="chat-messages-inner">
        {messages.map((msg, index) => {
          const isAi = msg.role === 'ai';
          const showMemory = isAi && msg.isMemoryAware;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index > messages.length - 3 ? 0.1 : 0 }}
              className="message-group"
            >
              {showMemory && (
                <div className="memory-indicator" style={{ marginLeft: isAi ? 48 : 0 }}>
                  <span className="memory-dot"></span>
                  <Brain size={11} />
                  Personalized Response Active
                </div>
              )}

              <div className={`message-wrapper ${msg.role}`}>
                {isAi && (
                  <div className="message-avatar ai">
                    <Bot size={18} />
                  </div>
                )}

                <div className="message-content">
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="streaming-cursor" style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        background: 'var(--accent-primary)',
                        marginLeft: '2px',
                        animation: 'blink 1s step-end infinite',
                        verticalAlign: 'text-bottom',
                      }} />
                    )}
                  </div>

                  <div className="message-meta">
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    <div className="message-actions">
                      <button
                        className="message-action-btn"
                        onClick={() => copyToClipboard(msg.content)}
                        title="Copy"
                      >
                        <Copy size={12} /> Copy
                      </button>
                      {isAi && index === messages.length - 1 && !msg.isStreaming && (
                        <button
                          className="message-action-btn"
                          onClick={onRegenerate}
                          title="Regenerate"
                        >
                          <RefreshCw size={12} /> Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!isAi && (
                  <div className="message-avatar user">
                    <User size={16} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="message-wrapper">
            <div className="message-avatar ai">
              <Bot size={18} />
            </div>
            <div className="message-content">
              <div className="message-bubble ai">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
