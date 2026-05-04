'use client';

import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CrisisAlertProps {
  onDismiss: () => void;
}

export default function CrisisAlert({ onDismiss }: CrisisAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="crisis-alert"
    >
      <AlertTriangle size={22} className="crisis-icon" />
      <div className="crisis-text">
        <strong>If you&apos;re in crisis:</strong> Please reach out to a professional.{' '}
        <a href="tel:988">988 Suicide &amp; Crisis Lifeline</a> (call or text 988) |{' '}
        <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer">
          Crisis Text Line
        </a>{' '}
        (text HOME to 741741). You are not alone. ❤️
      </div>
      <button className="crisis-close" onClick={onDismiss}>
        <X size={18} />
      </button>
    </motion.div>
  );
}
