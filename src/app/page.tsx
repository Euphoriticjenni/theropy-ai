'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import ChatHeader from '@/components/ChatHeader';
import MindfulnessSidebar from '@/components/MindfulnessSidebar';
import SettingsPanel from '@/components/SettingsPanel';
import DatasetPanel from '@/components/DatasetPanel';
import WelcomeScreen from '@/components/WelcomeScreen';
import CrisisAlert from '@/components/CrisisAlert';

const API_BASE = 'http://localhost:8000/api';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: string;
  isStreaming?: boolean;
  isMemoryAware?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  emotion?: string;
  activeDataset?: string;
}

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'hurt myself', 'no reason to live', 'better off dead'
];

const EMOTION_KEYWORDS: Record<string, string[]> = {
  anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'fear', 'scared', 'overthinking'],
  stressed: ['stressed', 'stress', 'overwhelmed', 'pressure', 'burnout', 'exhausted', 'overworked'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'hopeless', 'lonely', 'grief', 'loss', 'crying'],
  angry: ['angry', 'furious', 'rage', 'frustrated', 'irritated', 'mad', 'annoyed'],
  happy: ['happy', 'joy', 'grateful', 'excited', 'wonderful', 'amazing', 'blessed', 'great'],
};

function detectEmotion(text: string): string {
  const lower = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return emotion;
  }
  return 'neutral';
}

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}



export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [mindfulnessOpen, setMindfulnessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [activeDataset, setActiveDataset] = useState<string | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;

  // Load chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const resp = await fetch(`${API_BASE}/chats`);
        if (resp.ok) {
          const data = await resp.json();
          setChats(data.map((c: { id: string; title: string; created_at: string; updated_at: string }) => ({
            ...c,
            createdAt: new Date(c.created_at),
            updatedAt: new Date(c.updated_at),
            messages: []
          })));
        }
      } catch (err) {
        console.error('Failed to fetch chats:', err);
      }
    };
    fetchChats();
  }, []);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChatId) return;
    const fetchChatDetails = async () => {
      try {
        const resp = await fetch(`${API_BASE}/chats/${activeChatId}`);
        if (resp.ok) {
          const data = await resp.json();
          setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: data.messages.map((m: { id: string; role: 'user' | 'ai'; content: string; timestamp: string }) => ({
                  ...m,
                  timestamp: new Date(m.timestamp)
                })),
                emotion: data.emotion,
                activeDataset: data.active_dataset
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error('Failed to fetch chat details:', err);
      }
    };
    fetchChatDetails();
  }, [activeChatId]);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setIsMounted(true);
      const storedTheme = window.localStorage.getItem('theropy_theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      }
    });
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theropy_theme', theme);
  }, [theme, isMounted]);


  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      if (resp.ok) {
        const data = await resp.json();
        const newChat: Chat = {
          id: data.id,
          title: data.title,
          messages: [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at),
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setShowCrisis(false);
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const resp = await fetch(`${API_BASE}/chats/${chatId}`, { method: 'DELETE' });
      if (resp.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  }, [activeChatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Crisis detection (frontend fast check)
    if (detectCrisis(content)) setShowCrisis(true);

    let chatId = activeChatId;

    // Auto-create chat if none active
    if (!chatId) {
      try {
        const resp = await fetch(`${API_BASE}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.slice(0, 40) })
        });
        if (resp.ok) {
          const data = await resp.json();
          chatId = data.id;
          const newChat: Chat = {
            id: data.id,
            title: data.title,
            messages: [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.created_at),
          };
          setChats(prev => [newChat, ...prev]);
          setActiveChatId(chatId);
        }
      } catch (err) {
        console.error('Failed to auto-create chat:', err);
        return;
      }
    }

    if (!chatId) return;

    // Optimistic update for user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      emotion: detectEmotion(content),
    };

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, userMessage],
          updatedAt: new Date(),
          emotion: userMessage.emotion
        };
      }
      return c;
    }));

    setIsLoading(true);

    try {
      // Get API keys from localStorage
      const storedKeys = localStorage.getItem('theropy_api_keys');
      const apiKeys = storedKeys ? JSON.parse(storedKeys) : {};
      const apiKey = apiKeys[activeProvider] || "";

      const resp = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          provider: activeProvider,
          model: activeProvider === 'gemini' ? 'gemini-1.5-flash' : 'llama3-8b-8192', // Default models
          api_key: apiKey
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const aiMessage: Message = {
          id: data.ai_message.id,
          role: 'ai',
          content: data.ai_message.content,
          timestamp: new Date(),
          isMemoryAware: true
        };

        setChats(prev => prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === userMessage.id ? { ...m, id: data.user_message.id } : m).concat(aiMessage),
              updatedAt: new Date(),
              emotion: data.ai_message.emotion
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, isLoading, activeProvider]);

  const regenerateLastResponse = useCallback(() => {
    if (!activeChat || activeChat.messages.length < 2) return;

    // Remove last AI message and resend the last user message
    const lastUserMsg = [...activeChat.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        const msgs = c.messages.slice(0, -1);
        return { ...c, messages: msgs };
      }
      return c;
    }));

    setTimeout(() => sendMessage(lastUserMsg.content), 100);
  }, [activeChat, activeChatId, sendMessage]);

  const handleWelcomePrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  if (!isMounted) return null;

  return (
    <div className="app-layout">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        onSelectChat={setActiveChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="main-content">
        <ChatHeader
          chat={activeChat}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenDataset={() => setDatasetOpen(true)}
          onOpenMindfulness={() => setMindfulnessOpen(true)}
          activeProvider={activeProvider}
          activeDataset={activeDataset}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {showCrisis && <CrisisAlert onDismiss={() => setShowCrisis(false)} />}

        {activeChat && activeChat.messages.length > 0 ? (
          <ChatWindow
            messages={activeChat.messages}
            isLoading={isLoading}
            emotion={activeChat.emotion || 'neutral'}
            onRegenerate={regenerateLastResponse}
          />
        ) : (
          <WelcomeScreen onPrompt={handleWelcomePrompt} />
        )}

        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          onAttachDataset={() => setDatasetOpen(true)}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          activeProvider={activeProvider}
          onProviderChange={setActiveProvider}
        />
      )}

      {datasetOpen && (
        <DatasetPanel
          onClose={() => setDatasetOpen(false)}
          onAttach={(name: string) => { setActiveDataset(name); setDatasetOpen(false); }}
        />
      )}

      <MindfulnessSidebar
        isOpen={mindfulnessOpen}
        onClose={() => setMindfulnessOpen(false)}
      />
    </div>
  );
}
