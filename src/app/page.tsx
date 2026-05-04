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

const THERAPEUTIC_RESPONSES: Record<string, string[]> = {
  anxious: [
    "I can sense you're feeling anxious right now. Let's take a moment together. Can you try taking three slow, deep breaths? Inhale for 4 counts, hold for 4, exhale for 4. I'm here with you through this.",
    "Anxiety can feel overwhelming, but remember — it's your mind's way of trying to protect you. What specific thoughts are racing through your mind right now? Sometimes naming them can take away some of their power.",
    "I understand how unsettling anxiety can be. Let's try a grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This can help bring you back to the present moment."
  ],
  stressed: [
    "It sounds like you're carrying a lot right now. Stress has a way of making everything feel impossible, but you don't have to tackle everything at once. What feels like the most pressing thing on your mind?",
    "I hear you. Being stressed can be exhausting both mentally and physically. Have you been able to take any breaks today? Even a 5-minute walk or stretching can help reset your nervous system.",
    "When we're stressed, our body goes into fight-or-flight mode. Let's work on activating your rest-and-digest response. Can you try relaxing your shoulders and jaw right now? Notice where you're holding tension."
  ],
  sad: [
    "I'm sorry you're feeling this way. Sadness is a natural emotion, and it's okay to sit with it rather than push it away. Would you like to talk about what's weighing on your heart?",
    "It takes courage to acknowledge when we're feeling down. I want you to know that your feelings are valid. What happened that brought on these feelings, if you're comfortable sharing?",
    "Sometimes sadness can feel like a heavy blanket. Remember that it's temporary, even when it doesn't feel that way. Is there something small that usually brings you comfort? A song, a memory, a warm drink?"
  ],
  angry: [
    "I can feel the frustration in your words. Anger is a valid emotion — it often signals that a boundary has been crossed. What happened that triggered these feelings?",
    "Being angry can be really draining. Before we dig deeper, would you like to try a quick release? Try clenching your fists tight for 5 seconds, then slowly releasing. Sometimes physical release helps emotional release.",
    "Your anger is telling you something important. Let's explore it together. Can you describe the situation without judgment? I'm here to listen without any expectations."
  ],
  happy: [
    "It's wonderful to hear that you're feeling good! 😊 What's been bringing you joy lately? Savoring positive moments can help build emotional resilience.",
    "I love to see this energy! Happiness is worth celebrating, no matter how small the reason. Would you like to explore ways to cultivate more of these positive moments?",
    "That's great to hear! When we're in a good place, it's actually a perfect time to reflect on what's working well. What do you think has been contributing to this positive feeling?"
  ],
  neutral: [
    "Thank you for sharing that with me. I'm here to listen and support you. How are you feeling about things overall today?",
    "I appreciate you reaching out. Is there something specific on your mind you'd like to explore together?",
    "I'm glad you're here. Sometimes just having a space to think out loud can be helpful. What would you like to focus on in our conversation today?"
  ]
};

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [mindfulnessOpen, setMindfulnessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'light';
    const storedTheme = window.localStorage.getItem('theropy_theme');
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
  });
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [activeDataset, setActiveDataset] = useState<string | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theropy_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setShowCrisis(false);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  }, [activeChatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Crisis detection
    if (detectCrisis(content)) {
      setShowCrisis(true);
    }

    // Detect emotion
    const emotion = detectEmotion(content);

    let chatId = activeChatId;

    // Auto-create chat if none active
    if (!chatId) {
      const newChat: Chat = {
        id: uuidv4(),
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChats(prev => [newChat, ...prev]);
      chatId = newChat.id;
      setActiveChatId(chatId);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      emotion,
    };

    // Update chat with user message and title
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const title = c.messages.length === 0
          ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
          : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMessage],
          updatedAt: new Date(),
          emotion,
        };
      }
      return c;
    }));

    setIsLoading(true);

    // Simulate AI streaming response
    const responses = THERAPEUTIC_RESPONSES[emotion] || THERAPEUTIC_RESPONSES.neutral;
    const responseText = responses[Math.floor(Math.random() * responses.length)];

    const aiMessage: Message = {
      id: uuidv4(),
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isMemoryAware: chats.find(c => c.id === chatId)!== undefined &&
        (chats.find(c => c.id === chatId)?.messages.length ?? 0) > 2,
    };

    // Add empty AI message
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, aiMessage], updatedAt: new Date() };
      }
      return c;
    }));

    // Stream characters
    for (let i = 0; i <= responseText.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 20));
      const partial = responseText.slice(0, i);
      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMessage.id
                ? { ...m, content: partial, isStreaming: i < responseText.length }
                : m
            ),
          };
        }
        return c;
      }));
    }

    setIsLoading(false);
  }, [activeChatId, isLoading, chats]);

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
