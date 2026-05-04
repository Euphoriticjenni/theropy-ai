'use client';

import { motion } from 'framer-motion';
import { Brain, Heart, Sparkles, MessageCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: <Heart size={18} style={{ color: '#f87171' }} />,
    title: 'Emotional Support',
    desc: 'Talk about how you\'re feeling today',
    prompt: 'I\'ve been feeling overwhelmed lately and could use someone to talk to.',
  },
  {
    icon: <Sparkles size={18} style={{ color: '#fbbf24' }} />,
    title: 'Stress Relief',
    desc: 'Learn calming techniques',
    prompt: 'I\'m feeling really stressed about work. Can you help me with some relaxation techniques?',
  },
  {
    icon: <MessageCircle size={18} style={{ color: '#60a5fa' }} />,
    title: 'Self Reflection',
    desc: 'Explore your thoughts deeper',
    prompt: 'I want to understand myself better. Can you help me reflect on my recent emotions?',
  },
  {
    icon: <Brain size={18} style={{ color: '#a78bfa' }} />,
    title: 'Mindfulness',
    desc: 'Practice being present',
    prompt: 'Guide me through a mindfulness exercise to help me focus on the present moment.',
  },
];

export default function WelcomeScreen({ onPrompt }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="welcome-icon"
      >
        <Brain size={36} />
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Welcome to TheroPy AI
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        Your safe space for emotional support and self-discovery.
        I&apos;m here to listen, understand, and help you navigate your feelings.
      </motion.p>

      <motion.div
        className="welcome-cards"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {SUGGESTIONS.map((s, i) => (
          <motion.div
            key={i}
            className="welcome-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPrompt(s.prompt)}
          >
            <div style={{ marginBottom: 8 }}>{s.icon}</div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
