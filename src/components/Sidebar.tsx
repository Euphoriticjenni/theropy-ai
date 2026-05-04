'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus, Search, MessageCircle, Trash2,
  Settings, Shield, Sun, Moon, Brain
} from 'lucide-react';
import type { Chat } from '@/app/page';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  isOpen: boolean;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; chats: Chat[] }[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Previous 7 Days', chats: [] },
    { label: 'Older', chats: [] },
  ];

  chats.forEach(chat => {
    const chatDate = new Date(chat.updatedAt);
    if (chatDate >= today) groups[0].chats.push(chat);
    else if (chatDate >= yesterday) groups[1].chats.push(chat);
    else if (chatDate >= weekAgo) groups[2].chats.push(chat);
    else groups[3].chats.push(chat);
  });

  return groups.filter(g => g.chats.length > 0);
}

export default function Sidebar({
  chats, activeChatId, isOpen, onSelectChat, onNewChat,
  onDeleteChat, onOpenSettings, theme, onToggleTheme,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = searchQuery
    ? chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  const groups = groupChatsByDate(filteredChats);

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Brain size={20} />
          </div>
          <div>
            <h1>TheroPy AI</h1>
          </div>
          <span>v2.0</span>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <MessageSquarePlus size={16} />
          New Chat
        </button>

        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-chats">
        <AnimatePresence>
          {groups.map(group => (
            <div key={group.label}>
              <div className="chat-group-label">{group.label}</div>
              {group.chats.map(chat => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageCircle size={15} className="chat-item-icon" />
                  <span className="chat-item-text">{chat.title}</span>
                  <button
                    className="chat-item-delete"
                    onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>

        {chats.length === 0 && (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.85rem',
          }}>
            <Brain size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No conversations yet.<br />Start a new chat to begin.</p>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="security-indicator" style={{ margin: '0 4px 8px' }}>
          <Shield size={12} className="lock-icon" />
          Data सुरक्षित / Encrypted
        </div>
        <button className="sidebar-footer-btn" onClick={onOpenSettings}>
          <Settings size={16} />
          Settings
        </button>
        <button className="sidebar-footer-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
