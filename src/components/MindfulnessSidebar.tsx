'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wind, Timer, Headphones, Play, Pause, RotateCcw,
  TreePine, Waves, Flame, Cloud, Radio,
  Coffee, Eye, Footprints, Droplets, Bell, BellOff,
  ChevronRight, Sparkles, Heart, Activity
} from 'lucide-react';

interface MindfulnessSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'exercises' | 'reminders' | 'soundscapes';

// ===== Guided Exercises =====
interface Exercise {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  duration: number; // seconds
  steps: string[];
}

const EXERCISES: Exercise[] = [
  // --- BREATHING (5) ---
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    desc: '4-4-4-4 pattern to reset the nervous system',
    icon: <Wind size={22} />,
    color: '#6366f1',
    duration: 60,
    steps: ['Inhale for 4s', 'Hold for 4s', 'Exhale for 4s', 'Hold empty for 4s'],
  },
  {
    id: '478-breathing',
    title: '4-7-8 Relax',
    desc: 'The "natural tranquilizer" for deep calm',
    icon: <Sparkles size={22} />,
    color: '#8b5cf6',
    duration: 76,
    steps: ['Inhale for 4s', 'Hold for 7s', 'Exhale for 8s', 'Repeat cycle'],
  },
  {
    id: 'equal-breathing',
    title: 'Equal Breath',
    desc: 'Balance energy with even inhales/exhales',
    icon: <Wind size={22} />,
    color: '#3b82f6',
    duration: 80,
    steps: ['Inhale for 5s', 'Exhale for 5s', 'Inhale for 5s', 'Exhale for 5s'],
  },
  {
    id: 'lions-breath',
    title: "Lion's Release",
    desc: 'Release emotional heat and facial tension',
    icon: <Flame size={22} />,
    color: '#f59e0b',
    duration: 40,
    steps: ['Inhale deep', 'Open mouth wide', 'Stick tongue out', 'Exhale with Ha!'],
  },
  {
    id: 'deep-hum',
    title: 'Vagal Hum',
    desc: 'Vibrate your way to instant nervous system calm',
    icon: <Radio size={22} />,
    color: '#2dd4bf',
    duration: 70,
    steps: ['Inhale deep', 'Hum low on exhale', 'Feel the vibration', 'Repeat gently'],
  },

  // --- HEAD & FACE (4) ---
  {
    id: 'eye-palming',
    title: 'Eye Palming',
    desc: 'Rest your eyes from screen fatigue',
    icon: <Eye size={22} />,
    color: '#6366f1',
    duration: 60,
    steps: ['Rub palms to warm', 'Cup over closed eyes', 'Feel the darkness', 'Breathe deeply'],
  },
  {
    id: 'jaw-release',
    title: 'Jaw Softener',
    desc: 'Unclench the most common stress point',
    icon: <Activity size={22} />,
    color: '#ef4444',
    duration: 45,
    steps: ['Open mouth slightly', 'Wiggle jaw side-to-side', 'Massage hinges', 'Let jaw hang heavy'],
  },
  {
    id: 'scalp-massage',
    title: 'Scalp Reset',
    desc: 'Release tension at the crown',
    icon: <Activity size={22} />,
    color: '#f59e0b',
    duration: 60,
    steps: ['Fingertips on scalp', 'Small circles', 'Move front to back', 'Deep breath'],
  },
  {
    id: 'temple-press',
    title: 'Temple Calm',
    desc: 'Soothe mental pressure points',
    icon: <Activity size={22} />,
    color: '#8b5cf6',
    duration: 50,
    steps: ['Index fingers on temples', 'Very light circles', 'Close your eyes', 'Exhale tension'],
  },

  // --- NECK & SHOULDERS (4) ---
  {
    id: 'neck-tilt',
    title: 'Neck Soften',
    desc: 'Release "tech-neck" tension',
    icon: <Activity size={22} />,
    color: '#84cc16',
    duration: 60,
    steps: ['Tilt left for 15s', 'Back to center', 'Tilt right for 15s', 'Chin to chest'],
  },
  {
    id: 'shoulder-rolls',
    title: 'Shoulder Rolls',
    desc: 'Roll away the weight of the day',
    icon: <RotateCcw size={22} />,
    color: '#64748b',
    duration: 50,
    steps: ['Roll back 5 times', 'Roll forward 5 times', 'Shrug high', 'Release fast'],
  },
  {
    id: 'neck-circles',
    title: 'Neck Circles',
    desc: 'Gentle mobility for stiff necks',
    icon: <RotateCcw size={22} />,
    color: '#0ea5e9',
    duration: 60,
    steps: ['Drop chin', 'Slow circle left', 'Slow circle right', 'Pause and breathe'],
  },
  {
    id: 'shoulder-squeeze',
    title: 'Trapeze Release',
    desc: 'Target the upper back stress knots',
    icon: <Activity size={22} />,
    color: '#ec4899',
    duration: 40,
    steps: ['Squeeze shoulders to ears', 'Hold tight 5s', 'Drop them instantly', 'Repeat'],
  },

  // --- FULL BODY (4) ---
  {
    id: 'body-scan',
    title: 'Full Body Scan',
    desc: 'Progressive awareness for total relaxation',
    icon: <Activity size={22} />,
    color: '#06b6d4',
    duration: 120,
    steps: ['Focus on head', 'Relax shoulders', 'Feel your chest', 'Relax your legs'],
  },
  {
    id: 'muscle-pmr',
    title: 'Tense & Release',
    desc: 'Systematic physical tension release',
    icon: <Activity size={22} />,
    color: '#ef4444',
    duration: 150,
    steps: ['Tense feet & release', 'Tense legs & release', 'Tense arms & release', 'Whole body!'],
  },
  {
    id: 'standing-stretch',
    title: 'Sky Reach',
    desc: 'Full body lengthening and expansion',
    icon: <Activity size={22} />,
    color: '#10b981',
    duration: 60,
    steps: ['Stand up straight', 'Reach arms to sky', 'Go on tiptoes', 'Swoop down to toes'],
  },
  {
    id: 'spine-twist',
    title: 'Chair Twist',
    desc: 'Release spinal compression while sitting',
    icon: <Activity size={22} />,
    color: '#a855f7',
    duration: 60,
    steps: ['Sit tall', 'Twist left & hold', 'Center', 'Twist right & hold'],
  },

  // --- LEGS & FEET (4) ---
  {
    id: 'ankle-circles',
    title: 'Ankle Circles',
    desc: 'Improve circulation in the lower body',
    icon: <RotateCcw size={22} />,
    color: '#f43f5e',
    duration: 60,
    steps: ['Lift left foot', 'Circle 10 times', 'Switch to right', 'Circle 10 times'],
  },
  {
    id: 'toe-curls',
    title: 'Toe Scrunches',
    desc: 'Ground yourself through your feet',
    icon: <Activity size={22} />,
    color: '#10b981',
    duration: 40,
    steps: ['Curl toes tight', 'Splay them wide', 'Press into floor', 'Relax'],
  },
  {
    id: 'leg-extensions',
    title: 'Leg Stretch',
    desc: 'Ease tension from long periods of sitting',
    icon: <Activity size={22} />,
    color: '#3b82f6',
    duration: 80,
    steps: ['Extend left leg', 'Flex foot', 'Extend right leg', 'Flex foot'],
  },
  {
    id: 'calf-pump',
    title: 'Calf Pumps',
    desc: 'Boost blood flow and energy',
    icon: <Activity size={22} />,
    color: '#2dd4bf',
    duration: 60,
    steps: ['Stand on toes', 'Drop to heels', 'Rapidly repeat', 'Shake it out'],
  },

  // --- MENTAL & GROUNDING (4) ---
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Fix',
    desc: 'Connect with your senses to stop spirals',
    icon: <Eye size={22} />,
    color: '#10b981',
    duration: 100,
    steps: ['Name 5 visual things', '4 touch sensations', '3 sounds', '2 smells'],
  },
  {
    id: 'safe-space',
    title: 'Beach Escape',
    desc: 'Vivid mental sanctuary visualization',
    icon: <Waves size={22} />,
    color: '#0ea5e9',
    duration: 150,
    steps: ['Imagine the sand', 'Hear the waves', 'Feel the sun', 'Breath sea air'],
  },
  {
    id: 'affirmations',
    title: 'Self-Worth',
    desc: 'Internalize positive mental anchors',
    icon: <Sparkles size={22} />,
    color: '#eab308',
    duration: 60,
    steps: ['"I am capable"', '"I am at peace"', '"I am enough"', 'Deep breath'],
  },
  {
    id: 'counting-back',
    title: 'Focus Count',
    desc: 'Quiet the "monkey mind" with numbers',
    icon: <Activity size={22} />,
    color: '#6366f1',
    duration: 60,
    steps: ['Count 100 to 1', 'Focus on numbers', 'If mind wanders...', 'Start again from 100'],
  },
];

// ===== Break Activities =====
interface BreakActivity {
  id: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const BREAK_ACTIVITIES: BreakActivity[] = [
  { id: 'stretch', label: 'Stretch', icon: <Activity size={18} />, desc: 'Stand up and stretch your body' },
  { id: 'walk', label: 'Walk', icon: <Footprints size={18} />, desc: 'Take a short walk' },
  { id: 'hydrate', label: 'Hydrate', icon: <Droplets size={18} />, desc: 'Drink a glass of water' },
  { id: 'eye-rest', label: 'Eye Rest', icon: <Eye size={18} />, desc: 'Look at something 20ft away for 20s' },
  { id: 'coffee', label: 'Coffee Break', icon: <Coffee size={18} />, desc: 'Make yourself a warm drink' },
];

const INTERVALS = [15, 30, 45, 60, 90];

// ===== Soundscapes =====
interface Soundscape {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  category: 'nature' | 'noise' | 'binaural';
}

const SOUNDSCAPES: Soundscape[] = [
  // --- Nature ---
  { id: 'rain', label: 'Rain', icon: <Droplets size={18} />, color: '#60a5fa', category: 'nature' },
  { id: 'thunder', label: 'Thunderstorm', icon: <Cloud size={18} />, color: '#3b82f6', category: 'nature' },
  { id: 'ocean', label: 'Ocean Waves', icon: <Waves size={18} />, color: '#06b6d4', category: 'nature' },
  { id: 'forest', label: 'Forest', icon: <TreePine size={18} />, color: '#10b981', category: 'nature' },
  { id: 'river', label: 'River', icon: <Droplets size={18} />, color: '#34d399', category: 'nature' },
  { id: 'wind', label: 'Wind', icon: <Wind size={18} />, color: '#94a3b8', category: 'nature' },
  { id: 'birds', label: 'Morning Birds', icon: <Sparkles size={18} />, color: '#fbbf24', category: 'nature' },
  { id: 'night', label: 'Night Crickets', icon: <Cloud size={18} />, color: '#6366f1', category: 'nature' },
  { id: 'fireplace', label: 'Fireplace', icon: <Flame size={18} />, color: '#f59e0b', category: 'nature' },
  { id: 'snow', label: 'Snowfall', icon: <Cloud size={18} />, color: '#e2e8f0', category: 'nature' },
  
  // --- Urban/Ambient ---
  { id: 'coffee', label: 'Coffee Shop', icon: <Coffee size={18} />, color: '#92400e', category: 'noise' },
  { id: 'library', label: 'Library', icon: <Activity size={18} />, color: '#4b5563', category: 'noise' },
  { id: 'office', label: 'Office', icon: <Activity size={18} />, color: '#64748b', category: 'noise' },
  { id: 'fan', label: 'Fan', icon: <RotateCcw size={18} />, color: '#cbd5e1', category: 'noise' },
  { id: 'plane', label: 'Airplane', icon: <Wind size={18} />, color: '#334155', category: 'noise' },
  { id: 'train', label: 'Train Ride', icon: <Activity size={18} />, color: '#475569', category: 'noise' },
  { id: 'white-noise', label: 'White Noise', icon: <Cloud size={18} />, color: '#9ca3af', category: 'noise' },
  { id: 'pink-noise', label: 'Pink Noise', icon: <Cloud size={18} />, color: '#f472b6', category: 'noise' },
  { id: 'brown-noise', label: 'Brown Noise', icon: <Cloud size={18} />, color: '#a78bfa', category: 'noise' },
  { id: 'city', label: 'City Hum', icon: <Activity size={18} />, color: '#1e293b', category: 'noise' },

  // --- Binaural/Focus ---
  { id: 'delta', label: 'Sleep (Delta)', icon: <Activity size={18} />, color: '#1e3a8a', category: 'binaural' },
  { id: 'theta', label: 'Meditate (Theta)', icon: <Activity size={18} />, color: '#4338ca', category: 'binaural' },
  { id: 'alpha', label: 'Relax (Alpha)', icon: <Activity size={18} />, color: '#6366f1', category: 'binaural' },
  { id: 'beta', label: 'Focus (Beta)', icon: <Activity size={18} />, color: '#8b5cf6', category: 'binaural' },
  { id: 'gamma', label: 'Peak (Gamma)', icon: <Activity size={18} />, color: '#d946ef', category: 'binaural' },
];

// ===== Audio Engine (Web Audio API) =====
class SoundEngine {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }> = new Map();

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  playNoise(id: string, type: 'white' | 'pink' | 'brown', volume: number) {
    this.stop(id);
    const ctx = this.getCtx();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        data[i] = white;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        data[i] = (b0 = (b0 + (0.02 * white)) / 1.02) * 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
    this.nodes.set(id, { source, gain });
  }

  playBinaural(id: string, baseFreq: number, beatFreq: number, volume: number) {
    this.stop(id);
    const ctx = this.getCtx();

    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.frequency.value = baseFreq;
    oscR.frequency.value = baseFreq + beatFreq;

    const merger = ctx.createChannelMerger(2);
    const gain = ctx.createGain();
    gain.gain.value = volume;

    const gainL = ctx.createGain();
    gainL.gain.value = 0.5;
    const gainR = ctx.createGain();
    gainR.gain.value = 0.5;

    oscL.connect(gainL).connect(merger, 0, 0);
    oscR.connect(gainR).connect(merger, 0, 1);
    merger.connect(gain).connect(ctx.destination);

    oscL.start();
    oscR.start();
    this.nodes.set(id, { source: oscL, gain });
    this.nodes.set(id + '_r', { source: oscR, gain });
  }

  playBinauralPreset(id: string, preset: string, volume: number) {
    const freqMap: Record<string, [number, number]> = {
      delta: [200, 2.5],
      theta: [200, 6],
      alpha: [200, 10],
      beta: [200, 20],
      gamma: [200, 40],
    };
    const [base, beat] = freqMap[preset] || [200, 10];
    this.playBinaural(id, base, beat, volume);
  }

  playNature(id: string, volume: number) {
    // Nature sounds use filtered noise to approximate different environments
    this.stop(id);
    const ctx = this.getCtx();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian-ish with modulation for nature feel
        prev = (prev + (0.04 * white)) / 1.04;
        const mod = Math.sin(i / (ctx.sampleRate * (1 + ch * 0.3))) * 0.3;
        data[i] = (prev * 3.5 + mod * white * 0.2);
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    // Different filter settings per nature type
    const freqMap: Record<string, number> = {
      rain: 4000, ocean: 800, forest: 2500, fireplace: 1200, river: 3000, wind: 600, snow: 5000,
      thunder: 300, birds: 6000, night: 4500
    };
    filter.frequency.value = freqMap[id] || 2000;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    this.nodes.set(id, { source, gain });
  }

  setVolume(id: string, volume: number) {
    const node = this.nodes.get(id);
    if (node) node.gain.gain.value = volume;
  }

  stop(id: string) {
    const node = this.nodes.get(id);
    if (node) {
      try { node.source.stop(); } catch { /* already stopped */ }
      this.nodes.delete(id);
    }
    // Also stop paired binaural oscillator
    const nodeR = this.nodes.get(id + '_r');
    if (nodeR) {
      try { nodeR.source.stop(); } catch { /* */ }
      this.nodes.delete(id + '_r');
    }
  }

  stopAll() {
    this.nodes.forEach((_, id) => this.stop(id));
  }
}

const soundEngine = new SoundEngine();

// ===== Component =====
export default function MindfulnessSidebar({ isOpen, onClose }: MindfulnessSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [exerciseRunning, setExerciseRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Break reminders
  const [breakInterval, setBreakInterval] = useState(30);
  const [breakEnabled, setBreakEnabled] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['stretch', 'hydrate']);
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Soundscapes
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exercise timer
  useEffect(() => {
    if (exerciseRunning && activeExercise) {
      const exercise = EXERCISES.find(e => e.id === activeExercise);
      if (!exercise) return;

      timerRef.current = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev >= exercise.duration) {
            setExerciseRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return exercise.duration;
          }
          // Advance step
          const stepDuration = exercise.duration / exercise.steps.length;
          const newStep = Math.min(
            Math.floor((prev + 1) / stepDuration),
            exercise.steps.length - 1
          );
          setCurrentStep(newStep);
          return prev + 1;
        });
      }, 1000);

      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [exerciseRunning, activeExercise]);

  // Break reminder timer
  useEffect(() => {
    if (breakEnabled) {
      breakTimerRef.current = setInterval(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const activity = selectedActivities[Math.floor(Math.random() * selectedActivities.length)];
          const act = BREAK_ACTIVITIES.find(a => a.id === activity);
          new Notification('🧘 Mindfulness Break', {
            body: act ? `Time to ${act.label.toLowerCase()}! ${act.desc}` : 'Time for a break!',
            icon: '🧘',
          });
        }
      }, breakInterval * 60 * 1000);

      return () => { if (breakTimerRef.current) clearInterval(breakTimerRef.current); };
    } else {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    }
  }, [breakEnabled, breakInterval, selectedActivities]);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => { soundEngine.stopAll(); };
  }, []);

  const startExercise = (id: string) => {
    setActiveExercise(id);
    setExerciseTimer(0);
    setCurrentStep(0);
    setExerciseRunning(true);
  };

  const resetExercise = () => {
    setExerciseRunning(false);
    setExerciseTimer(0);
    setCurrentStep(0);
    setActiveExercise(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleSound = useCallback((sound: Soundscape) => {
    setActiveSounds(prev => {
      const newSounds = { ...prev };
      if (newSounds[sound.id] !== undefined) {
        soundEngine.stop(sound.id);
        delete newSounds[sound.id];
      } else {
        const vol = 0.3;
        newSounds[sound.id] = vol;
        if (sound.category === 'noise') {
          let noiseType: 'white' | 'pink' | 'brown' = 'white';
          if (sound.id.includes('pink')) noiseType = 'pink';
          else if (sound.id.includes('brown')) noiseType = 'brown';
          else if (sound.id.includes('city') || sound.id.includes('fan') || sound.id.includes('train') || sound.id.includes('office')) noiseType = 'brown';
          else if (sound.id.includes('plane')) noiseType = 'pink'; // Plane is closer to pink noise
          soundEngine.playNoise(sound.id, noiseType, vol);
        } else if (sound.category === 'binaural') {
          soundEngine.playBinauralPreset(sound.id, sound.id, vol);
        } else {
          soundEngine.playNature(sound.id, vol);
        }
      }
      return newSounds;
    });
  }, []);

  const handleVolumeChange = useCallback((id: string, vol: number) => {
    soundEngine.setVolume(id, vol);
    setActiveSounds(prev => ({ ...prev, [id]: vol }));
  }, []);

  const enableBreakReminders = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
    setBreakEnabled(!breakEnabled);
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'exercises', label: 'Exercises', icon: <Wind size={15} /> },
    { id: 'reminders', label: 'Reminders', icon: <Timer size={15} /> },
    { id: 'soundscapes', label: 'Sounds', icon: <Headphones size={15} /> },
  ];

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="mindfulness-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="mindfulness-dashboard"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mindfulness-header">
          <div className="mindfulness-header-title">
            <div className="mindfulness-header-icon">🧘</div>
            <div>
              <h2>Mindfulness Breaks</h2>
              <span className="mindfulness-subtitle">Guided exercises, break reminders, and soundscapes</span>
            </div>
          </div>
          <button className="mindfulness-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mindfulness-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`mindfulness-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); resetExercise(); }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mindfulness-body">
          <AnimatePresence mode="wait">
            {/* === Exercises Tab === */}
            {activeTab === 'exercises' && (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="exercises-tab-content"
              >
                {!activeExercise ? (
                  <div className="exercise-list-view">
                    <div className="mindfulness-hero">
                      <h1>Mindfulness Sanctuary</h1>
                      <p>25 tasks for Head, Neck, Body, and Mind. Choose one to begin.</p>
                    </div>
                    <div className="exercise-grid">
                      {EXERCISES.map(ex => (
                        <button
                          key={ex.id}
                          className="exercise-card"
                          onClick={() => startExercise(ex.id)}
                        >
                          <div className="exercise-card-icon" style={{ background: ex.color + '18', color: ex.color }}>
                            {ex.icon}
                          </div>
                          <div className="exercise-card-info">
                            <h4>{ex.title}</h4>
                            <p>{ex.desc}</p>
                            <span className="exercise-duration">{Math.floor(ex.duration / 60)} min</span>
                          </div>
                          <ChevronRight size={16} className="exercise-card-arrow" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="exercise-active-view">
                    {(() => {
                      const exercise = EXERCISES.find(e => e.id === activeExercise)!;
                      const progress = (exerciseTimer / exercise.duration) * 100;
                      return (
                        <div className="exercise-active">
                          <div className="exercise-active-header">
                            <h3>{exercise.title}</h3>
                            <p>{exercise.desc}</p>
                          </div>

                          <div className="exercise-timer-ring">
                            <svg viewBox="0 0 120 120" className="timer-svg">
                              <circle cx="60" cy="60" r="52" className="timer-track" />
                              <circle
                                cx="60" cy="60" r="52"
                                className="timer-progress"
                                style={{
                                  strokeDasharray: `${2 * Math.PI * 52}`,
                                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - progress / 100)}`,
                                  stroke: exercise.color,
                                }}
                              />
                            </svg>
                            <div className="timer-text">
                              <span className="timer-value">{formatTime(exerciseTimer)}</span>
                              <span className="timer-total">/ {formatTime(exercise.duration)}</span>
                            </div>
                          </div>

                          <div className="exercise-steps">
                            <h4 className="exercise-step-guide">How to do it:</h4>
                            {exercise.steps.map((step, i) => (
                              <div
                                key={i}
                                className={`exercise-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                              >
                                <div className="step-indicator">
                                  {i < currentStep ? '✓' : i + 1}
                                </div>
                                <span className="step-text">{step}</span>
                              </div>
                            ))}
                          </div>

                          <div className="exercise-controls">
                            <button
                              className="exercise-ctrl-btn"
                              onClick={() => setExerciseRunning(!exerciseRunning)}
                            >
                              {exerciseRunning ? <Pause size={18} /> : <Play size={18} />}
                              {exerciseRunning ? 'Pause' : 'Resume'}
                            </button>
                            <button className="exercise-ctrl-btn secondary" onClick={resetExercise}>
                              <RotateCcw size={18} />
                              Back to Tasks
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            )}

            {/* === Break Reminders Tab === */}
            {activeTab === 'reminders' && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="reminders-tab-content"
              >
                <div className="reminder-toggle-card">
                  <div className="reminder-toggle-info">
                    {breakEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    <div>
                      <h4>Break Reminders</h4>
                      <p>{breakEnabled ? 'Reminders are active' : 'Enable to get notified'}</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${breakEnabled ? 'active' : ''}`}
                    onClick={enableBreakReminders}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="reminder-section">
                  <h4 className="reminder-section-title">Reminder Interval</h4>
                  <div className="interval-pills">
                    {INTERVALS.map(min => (
                      <button
                        key={min}
                        className={`interval-pill ${breakInterval === min ? 'active' : ''}`}
                        onClick={() => setBreakInterval(min)}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reminder-section">
                  <h4 className="reminder-section-title">Break Activities</h4>
                  <div className="activity-list">
                    {BREAK_ACTIVITIES.map(act => (
                      <button
                        key={act.id}
                        className={`activity-item ${selectedActivities.includes(act.id) ? 'active' : ''}`}
                        onClick={() => toggleActivity(act.id)}
                      >
                        <div className="activity-icon">{act.icon}</div>
                        <div className="activity-info">
                          <span className="activity-label">{act.label}</span>
                          <span className="activity-desc">{act.desc}</span>
                        </div>
                        <div className="activity-check">
                          {selectedActivities.includes(act.id) && '✓'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === Soundscapes Tab === */}
            {activeTab === 'soundscapes' && (
              <motion.div
                key="soundscapes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="soundscapes-tab-content"
              >
                {(['nature', 'noise', 'binaural'] as const).map(category => (
                  <div key={category} className="sound-category">
                    <h4 className="sound-category-title">
                      {category === 'nature' ? '🌿 Nature Sounds' :
                       category === 'noise' ? '🔊 Ambient Noise' :
                       '🧠 Binaural Beats'}
                    </h4>
                    <div className="sound-list">
                      {SOUNDSCAPES.filter(s => s.category === category).map(sound => {
                        const isPlaying = activeSounds[sound.id] !== undefined;
                        return (
                          <div key={sound.id} className={`sound-item ${isPlaying ? 'active' : ''}`}>
                            <button
                              className="sound-toggle-btn"
                              onClick={() => toggleSound(sound)}
                              style={{ color: isPlaying ? sound.color : undefined }}
                            >
                              <div className="sound-icon" style={{
                                background: isPlaying ? sound.color + '20' : undefined,
                                color: isPlaying ? sound.color : undefined,
                              }}>
                                {sound.icon}
                              </div>
                              <span className="sound-label">{sound.label}</span>
                              <div className={`sound-play-indicator ${isPlaying ? 'playing' : ''}`}>
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                              </div>
                            </button>
                            {isPlaying && (
                              <motion.div
                                className="sound-volume"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={activeSounds[sound.id]}
                                  onChange={e => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                  className="volume-slider"
                                  style={{ '--slider-color': sound.color } as React.CSSProperties}
                                />
                                <span className="volume-value">
                                  {Math.round((activeSounds[sound.id] || 0) * 100)}%
                                </span>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(activeSounds).length > 0 && (
                  <button
                    className="stop-all-btn"
                    onClick={() => {
                      soundEngine.stopAll();
                      setActiveSounds({});
                    }}
                  >
                    <Pause size={16} />
                    Stop All Sounds
                  </button>
                )}
              </motion.div>
            )}

            {/* === Break Reminders Tab === */}
            {activeTab === 'reminders' && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Enable Toggle */}
                <div className="reminder-toggle-card">
                  <div className="reminder-toggle-info">
                    {breakEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    <div>
                      <h4>Break Reminders</h4>
                      <p>{breakEnabled ? 'Reminders are active' : 'Enable to get notified'}</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${breakEnabled ? 'active' : ''}`}
                    onClick={enableBreakReminders}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                {/* Interval Picker */}
                <div className="reminder-section">
                  <h4 className="reminder-section-title">Reminder Interval</h4>
                  <div className="interval-pills">
                    {INTERVALS.map(min => (
                      <button
                        key={min}
                        className={`interval-pill ${breakInterval === min ? 'active' : ''}`}
                        onClick={() => setBreakInterval(min)}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Selection */}
                <div className="reminder-section">
                  <h4 className="reminder-section-title">Break Activities</h4>
                  <div className="activity-list">
                    {BREAK_ACTIVITIES.map(act => (
                      <button
                        key={act.id}
                        className={`activity-item ${selectedActivities.includes(act.id) ? 'active' : ''}`}
                        onClick={() => toggleActivity(act.id)}
                      >
                        <div className="activity-icon">{act.icon}</div>
                        <div className="activity-info">
                          <span className="activity-label">{act.label}</span>
                          <span className="activity-desc">{act.desc}</span>
                        </div>
                        <div className="activity-check">
                          {selectedActivities.includes(act.id) && '✓'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === Soundscapes Tab === */}
            {activeTab === 'soundscapes' && (
              <motion.div
                key="soundscapes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {(['nature', 'noise', 'binaural'] as const).map(category => (
                  <div key={category} className="sound-category">
                    <h4 className="sound-category-title">
                      {category === 'nature' ? '🌿 Nature Sounds' :
                       category === 'noise' ? '🔊 Ambient Noise' :
                       '🧠 Binaural Beats'}
                    </h4>
                    <div className="sound-list">
                      {SOUNDSCAPES.filter(s => s.category === category).map(sound => {
                        const isPlaying = activeSounds[sound.id] !== undefined;
                        return (
                          <div key={sound.id} className={`sound-item ${isPlaying ? 'active' : ''}`}>
                            <button
                              className="sound-toggle-btn"
                              onClick={() => toggleSound(sound)}
                              style={{ color: isPlaying ? sound.color : undefined }}
                            >
                              <div className="sound-icon" style={{
                                background: isPlaying ? sound.color + '20' : undefined,
                                color: isPlaying ? sound.color : undefined,
                              }}>
                                {sound.icon}
                              </div>
                              <span className="sound-label">{sound.label}</span>
                              <div className={`sound-play-indicator ${isPlaying ? 'playing' : ''}`}>
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                              </div>
                            </button>
                            {isPlaying && (
                              <motion.div
                                className="sound-volume"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={activeSounds[sound.id]}
                                  onChange={e => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                  className="volume-slider"
                                  style={{ '--slider-color': sound.color } as React.CSSProperties}
                                />
                                <span className="volume-value">
                                  {Math.round((activeSounds[sound.id] || 0) * 100)}%
                                </span>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(activeSounds).length > 0 && (
                  <button
                    className="stop-all-btn"
                    onClick={() => {
                      soundEngine.stopAll();
                      setActiveSounds({});
                    }}
                  >
                    <Pause size={16} />
                    Stop All Sounds
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
