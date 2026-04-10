'use client';

import { motion } from 'framer-motion';
import { getStaminaColor } from '@/lib/fatigue-calculator';

interface StaminaRingProps {
  stamina: number; // 0-100
  size: number;
  strokeWidth?: number;
}

export default function StaminaRing({ stamina, size, strokeWidth = 3.5 }: StaminaRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stamina / 100) * circumference;
  const color = getStaminaColor(stamina);

  return (
    <svg
      width={size}
      height={size}
      style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
    >
      <defs>
        <filter id={`glow-${Math.round(stamina)}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />

      {/* Stamina arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset, stroke: color }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        filter={`url(#glow-${Math.round(stamina)})`}
      />
    </svg>
  );
}
