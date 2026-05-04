'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Settings, Database, Sun, Moon, ChevronDown, Cpu, Sparkles } from 'lucide-react';
import type { Chat } from '@/app/page';

interface ChatHeaderProps {
  chat: Chat | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenDataset: () => void;
  onOpenMindfulness: () => void;
  activeProvider: string;
  activeDataset: string | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const PROVIDERS: Record<string, { name: string; models: string[] }> = {
  gemini: { name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro'] },
  groq: { name: 'Groq', models: ['llama-3.3-70b', 'mixtral-8x7b', 'gemma2-9b'] },
  openrouter: { name: 'OpenRouter', models: ['claude-3.5-sonnet', 'gpt-4o', 'llama-3.1-70b'] },
  nvidia: { name: 'NVIDIA NIM', models: ['llama-3.1-nemotron-70b', 'mixtral-8x22b'] },
  ollama: { name: 'Ollama (Local)', models: ['llama3.2', 'llama3.1', 'mistral', 'gemma2', 'qwen2.5', 'phi3'] },
};

export default function ChatHeader({
  chat, sidebarOpen, onToggleSidebar, onOpenSettings, onOpenDataset, onOpenMindfulness,
  activeProvider, activeDataset, theme, onToggleTheme,
}: ChatHeaderProps) {
  const [modelDropdown, setModelDropdown] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setModelDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const currentProvider = PROVIDERS[activeProvider];
  const selectedModel = selectedModels[activeProvider] || currentProvider?.models[0] || '';

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button
          className={`sidebar-toggle ${sidebarOpen ? 'open' : 'closed'}`}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        >
          <Menu size={20} />
        </button>
        <span className="chat-header-title">
          {chat ? chat.title : 'TheroPy AI'}
        </span>

        {chat?.emotion && chat.emotion !== 'neutral' && (
          <span className={`emotion-badge emotion-${chat.emotion}`}>
            <EmotionIcon emotion={chat.emotion} />
            {chat.emotion.charAt(0).toUpperCase() + chat.emotion.slice(1)}
          </span>
        )}

        {activeDataset && (
          <span className="active-dataset-chip">
            <Database size={11} />
            {activeDataset}
          </span>
        )}
      </div>

      <div className="chat-header-right">
        <div className="model-selector" ref={dropdownRef}>
          <button
            className="model-selector-btn"
            onClick={() => setModelDropdown(!modelDropdown)}
          >
            <Cpu size={14} />
            {selectedModel || 'Select Model'}
            <ChevronDown size={12} />
          </button>

          {modelDropdown && (
            <div className="model-dropdown">
              {currentProvider && currentProvider.models.map(model => (
                <button
                  key={model}
                  className={`model-dropdown-item ${model === selectedModel ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedModels(prev => ({ ...prev, [activeProvider]: model }));
                    setModelDropdown(false);
                  }}
                >
                  {model}
                  <span className="model-provider">{currentProvider.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="header-btn" onClick={onOpenMindfulness}>
          <Sparkles size={15} />
          <span>Mindfulness</span>
        </button>

        <button className="header-btn" onClick={onOpenDataset}>
          <Database size={15} />
          <span>Dataset</span>
        </button>

        <button className="header-btn" onClick={onOpenSettings}>
          <Settings size={15} />
        </button>

        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}

function EmotionIcon({ emotion }: { emotion: string }) {
  const icons: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    stressed: '😓',
    angry: '😠',
    neutral: '😐',
  };
  return <span style={{ fontSize: '0.85rem' }}>{icons[emotion] || '😐'}</span>;
}
