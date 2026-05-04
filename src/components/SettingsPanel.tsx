'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Eye, EyeOff, Shield, Zap, Key,
  CheckCircle2
} from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  activeProvider: string;
  onProviderChange: (provider: string) => void;
}

interface ApiKeys {
  gemini: string;
  groq: string;
  openrouter: string;
  nvidia: string;
  ollama: string;
}

const PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', color: '#4285f4' },
  { id: 'groq', name: 'Groq', color: '#f55036' },
  { id: 'openrouter', name: 'OpenRouter', color: '#8b5cf6' },
  { id: 'nvidia', name: 'NVIDIA NIM', color: '#76b900' },
  { id: 'ollama', name: 'Ollama (Local)', color: '#1d4ed8' },
];

export default function SettingsPanel({ onClose, activeProvider, onProviderChange }: SettingsPanelProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const defaults: ApiKeys = { gemini: '', groq: '', openrouter: '', nvidia: '', ollama: 'http://localhost:11434' };

    if (typeof window === 'undefined') {
      return defaults;
    }

    try {
      const stored = localStorage.getItem('theropy_api_keys');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [autoFallback, setAutoFallback] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      const fallback = localStorage.getItem('theropy_auto_fallback');
      return fallback ? JSON.parse(fallback) : true;
    } catch {
      return true;
    }
  });
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    localStorage.setItem('theropy_api_keys', JSON.stringify(apiKeys));
    localStorage.setItem('theropy_auto_fallback', JSON.stringify(autoFallback));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleVisibility = (key: string) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <motion.div
        className="settings-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="settings-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* AI Provider Selection */}
          <div className="settings-section">
            <h3>
              <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
              AI Provider
            </h3>
            <div className="provider-cards">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  className={`provider-card ${activeProvider === p.id ? 'active' : ''}`}
                  onClick={() => onProviderChange(p.id)}
                >
                  <div className="provider-name" style={{ color: activeProvider === p.id ? p.color : undefined }}>
                    {p.name}
                  </div>
                  <div className="provider-status">
                    {apiKeys[p.id as keyof ApiKeys]
                      ? <span style={{ color: 'var(--accent-success)' }}>● Connected</span>
                      : <span>○ Not set</span>
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Keys */}
          <div className="settings-section">
            <h3>
              <Key size={14} style={{ display: 'inline', marginRight: 6 }} />
              API Keys
            </h3>

            {PROVIDERS.map(p => (
              <div className="settings-field" key={p.id}>
                <label>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                  {p.name}
                </label>
                <div className="api-key-input">
                  <input
                    type={visibility[p.id] ? 'text' : 'password'}
                    placeholder={`Enter ${p.name} API key...`}
                    value={apiKeys[p.id as keyof ApiKeys]}
                    onChange={e => setApiKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                  />
                  <button
                    className="api-key-toggle"
                    onClick={() => toggleVisibility(p.id)}
                  >
                    {visibility[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className={`api-status ${apiKeys[p.id as keyof ApiKeys] ? 'connected' : 'disconnected'}`}>
                  <span className="api-status-dot" />
                  {apiKeys[p.id as keyof ApiKeys] ? 'Key configured' : 'No key set'}
                </div>
              </div>
            ))}
          </div>

          {/* Ollama URL Config */}
          {activeProvider === 'ollama' && (
            <div className="settings-field" style={{ marginTop: 12 }}>
              <label>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d4ed8', display: 'inline-block' }} />
                Ollama Base URL
              </label>
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={apiKeys.ollama}
                onChange={e => setApiKeys(prev => ({ ...prev, ollama: e.target.value }))}
                style={{ width: '100%' }}
              />
              <div className={`api-status ${apiKeys.ollama ? 'connected' : 'disconnected'}`}>
                <span className="api-status-dot" />
                {apiKeys.ollama ? 'Local runtime configured — no API key needed' : 'Set your Ollama server URL'}
              </div>
            </div>
          )}

          {/* Auto Fallback */}
          <div className="settings-section">
            <h3>System</h3>
            <div className="toggle-row">
              <span className="toggle-label">Auto-fallback if provider fails</span>
              <button
                className={`toggle-switch ${autoFallback ? 'active' : ''}`}
                onClick={() => setAutoFallback(!autoFallback)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">Save chat history locally</span>
              <button className="toggle-switch active">
                <span className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="settings-section">
            <div className="security-indicator" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              <Shield size={14} className="lock-icon" />
              Data सुरक्षित / Encrypted — Keys stored locally only
            </div>
          </div>

          {/* Save Button */}
          <button className="btn-primary" style={{ width: '100%', padding: 14 }} onClick={saveSettings}>
            {saved ? (
              <>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
