'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, ExternalLink, FileJson, Table2, Database } from 'lucide-react';

interface DatasetPanelProps {
  onClose: () => void;
  onAttach: (name: string) => void;
}

type TabType = 'upload' | 'huggingface' | 'google';

const SAMPLE_DATA = [
  { text: "I've been feeling really anxious about work...", label: "anxiety", sentiment: "negative" },
  { text: "Today was a great day! Feeling blessed.", label: "joy", sentiment: "positive" },
  { text: "I can't seem to shake this sadness...", label: "sadness", sentiment: "negative" },
  { text: "Just finished a productive therapy session.", label: "relief", sentiment: "positive" },
  { text: "Overwhelmed with everything happening lately.", label: "stress", sentiment: "negative" },
];

export default function DatasetPanel({ onClose, onAttach }: DatasetPanelProps) {
  const [tab, setTab] = useState<TabType>('upload');
  const [hfUrl, setHfUrl] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setShowPreview(true);
    }
  };

  const handleAttach = () => {
    const name = uploadedFile || (hfUrl ? 'HuggingFace Dataset' : 'Google Dataset');
    onAttach(name);
  };

  return (
    <>
      <motion.div
        className="dataset-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="dataset-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="dataset-header">
          <h2>📂 Dataset Integration</h2>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dataset-body">
          <div className="dataset-tabs">
            <button
              className={`dataset-tab ${tab === 'upload' ? 'active' : ''}`}
              onClick={() => setTab('upload')}
            >
              <Upload size={13} style={{ display: 'inline', marginRight: 4 }} />
              Upload
            </button>
            <button
              className={`dataset-tab ${tab === 'huggingface' ? 'active' : ''}`}
              onClick={() => setTab('huggingface')}
            >
              🤗 Hugging Face
            </button>
            <button
              className={`dataset-tab ${tab === 'google' ? 'active' : ''}`}
              onClick={() => setTab('google')}
            >
              <Database size={13} style={{ display: 'inline', marginRight: 4 }} />
              Google
            </button>
          </div>

          {tab === 'upload' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.jsonl"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div
                className="dataset-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="upload-icon" />
                <h4>{uploadedFile || 'Click to upload a dataset'}</h4>
                <p>Supports CSV, JSON, JSONL files</p>
              </div>
            </>
          )}

          {tab === 'huggingface' && (
            <div className="settings-field">
              <label>
                <ExternalLink size={14} />
                Hugging Face Dataset URL
              </label>
              <input
                type="url"
                placeholder="https://huggingface.co/datasets/..."
                value={hfUrl}
                onChange={e => { setHfUrl(e.target.value); setShowPreview(!!e.target.value); }}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {tab === 'google' && (
            <div className="settings-field">
              <label>
                <ExternalLink size={14} />
                Google Dataset URL
              </label>
              <input
                type="url"
                placeholder="https://datasetsearch.research.google.com/..."
                value={googleUrl}
                onChange={e => { setGoogleUrl(e.target.value); setShowPreview(!!e.target.value); }}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {showPreview && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Table2 size={15} />
                <strong>Preview</strong>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                  (showing first 5 rows)
                </span>
              </div>
              <div className="dataset-preview">
                <table>
                  <thead>
                    <tr>
                      <th>Text</th>
                      <th>Label</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_DATA.map((row, i) => (
                      <tr key={i}>
                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.text}
                        </td>
                        <td>{row.label}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: row.sentiment === 'positive'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(248, 113, 113, 0.15)',
                            color: row.sentiment === 'positive'
                              ? 'var(--accent-success)'
                              : '#f87171',
                          }}>
                            {row.sentiment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="dataset-actions">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            {showPreview && (
              <button className="btn-primary" onClick={handleAttach}>
                <FileJson size={14} style={{ display: 'inline', marginRight: 6 }} />
                Attach to Chat
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
