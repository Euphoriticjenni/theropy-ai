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
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    desc: 'Calm your nervous system with a 4-4-4-4 pattern',
    icon: <Wind size={22} />,
    color: '#6366f1',
    duration: 60,
    steps: [
      'Inhale slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat the cycle',
    ],
  },
  {
    id: '478-breathing',
    title: '4-7-8 Breathing',
    desc: 'A powerful relaxation technique for anxiety',
    icon: <Sparkles size={22} />,
    color: '#8b5cf6',
    duration: 120,
    steps: [
      'Inhale quietly through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale completely through your mouth for 8 seconds',
      'This is one breath cycle',
      'Repeat 3 more times for a total of 4 cycles',
    ],
  },
  {
    id: 'quick-meditation',
    title: 'Quick Meditation',
    desc: '2-minute guided meditation for clarity',
    icon: <Heart size={22} />,
    color: '#ec4899',
    duration: 120,
    steps: [
      'Close your eyes and sit comfortably',
      'Focus on the natural rhythm of your breath',
      'Notice any thoughts — let them pass like clouds',
      'Bring attention back to your breath gently',
      'When ready, slowly open your eyes',
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    desc: 'Release tension from head to toe',
    icon: <Activity size={22} />,
    color: '#06b6d4',
    duration: 180,
    steps: [
      'Start at the top of your head — notice any tension',
      'Relax your forehead, eyes, and jaw',
      'Drop your shoulders away from your ears',
      'Unclench your hands and relax your arms',
      'Breathe into your chest and stomach',
      'Release tension in your hips and legs',
      'Feel your feet grounded on the floor',
    ],
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
  { id: 'rain', label: 'Rain', icon: <Droplets size={18} />, color: '#60a5fa', category: 'nature' },
  { id: 'ocean', label: 'Ocean Waves', icon: <Waves size={18} />, color: '#06b6d4', category: 'nature' },
  { id: 'forest', label: 'Forest', icon: <TreePine size={18} />, color: '#10b981', category: 'nature' },
  { id: 'fireplace', label: 'Fireplace', icon: <Flame size={18} />, color: '#f59e0b', category: 'nature' },
  { id: 'white-noise', label: 'White Noise', icon: <Cloud size={18} />, color: '#9ca3af', category: 'noise' },
  { id: 'pink-noise', label: 'Pink Noise', icon: <Cloud size={18} />, color: '#f472b6', category: 'noise' },
  { id: 'brown-noise', label: 'Brown Noise', icon: <Cloud size={18} />, color: '#a78bfa', category: 'noise' },
  { id: 'binaural-focus', label: 'Focus Beats', icon: <Radio size={18} />, color: '#6366f1', category: 'binaural' },
  { id: 'binaural-relax', label: 'Relax Beats', icon: <Radio size={18} />, color: '#8b5cf6', category: 'binaural' },
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
      rain: 4000, ocean: 800, forest: 2500, fireplace: 1200,
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
          const noiseType = sound.id.replace('-noise', '') as 'white' | 'pink' | 'brown';
          soundEngine.playNoise(sound.id, noiseType, vol);
        } else if (sound.category === 'binaural') {
          const isRelax = sound.id.includes('relax');
          soundEngine.playBinaural(sound.id, isRelax ? 200 : 300, isRelax ? 4 : 14, vol);
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
        className="mindfulness-sidebar"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
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

        <div className="mindfulness-intro">
          <div className="mindfulness-overview">
            <div className="mindfulness-overview-badge">Inspired by Opera Air</div>
            <h3>Build calm into your browsing routine.</h3>
            <p>
              Keep the tools you need for stress relief and focus in one dedicated sidebar.
              Start a guided exercise, schedule reminders, or play a soundscape without leaving the page.
            </p>
            <div className="mindfulness-overview-grid">
              <div className="mindfulness-overview-card">
                <Wind size={16} />
                <strong>Guided exercises</strong>
                <span>Breathing, meditation, and body scans for quick resets.</span>
              </div>
              <div className="mindfulness-overview-card">
                <Timer size={16} />
                <strong>Break reminders</strong>
                <span>Pick an interval and choose the break activity that fits your moment.</span>
              </div>
              <div className="mindfulness-overview-card">
                <Headphones size={16} />
                <strong>Soundscapes</strong>
                <span>Nature sounds, white noise, and binaural beats for focus or relaxation.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mindfulness-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`mindfulness-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
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
              >
                {!activeExercise ? (
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
                ) : (
                  <div className="exercise-active">
                    {(() => {
                      const exercise = EXERCISES.find(e => e.id === activeExercise)!;
                      const progress = (exerciseTimer / exercise.duration) * 100;
                      return (
                        <>
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
                            {exercise.steps.map((step, i) => (
                              <div
                                key={i}
                                className={`exercise-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                              >
                                <div className="step-indicator">
                                  {i < currentStep ? '✓' : i + 1}
                                </div>
                                <span>{step}</span>
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
                              Back
                            </button>
                          </div>
                        </>
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
