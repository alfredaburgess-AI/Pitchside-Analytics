'use client';

import { useMatch } from '@/context/MatchContext';
import styles from './MatchSetup.module.css';
import { Clock, Play } from 'lucide-react';

export default function MatchMinuteSlider() {
  const { state, dispatch } = useMatch();

  const progressPercent = (state.currentMinute / 90) * 100;

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderHeader}>
        <Clock size={16} className={styles.sliderIcon} />
        <span className={styles.sliderLabel}>Match Minute</span>
      </div>

      <div className={styles.minuteDisplay}>
        <span className={styles.minuteValue}>{state.currentMinute}</span>
        <span className={styles.minuteUnit}>&apos;</span>
      </div>

      <div className={styles.sliderTrack}>
        <input
          type="range"
          min={0}
          max={90}
          value={state.currentMinute}
          onChange={(e) => dispatch({ type: 'SET_MINUTE', minute: parseInt(e.target.value) })}
          className={styles.slider}
          id="match-minute-slider"
          aria-label="Match minute slider"
          style={{
            background: `linear-gradient(to right, #00E676 0%, #FF1744 100%)`,
          }}
        />
        <div
          className={styles.sliderFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={styles.sliderMarkers}>
        <span>KO</span>
        <span className={styles.halfMarker}>
          <Play size={10} /> HT
        </span>
        <span>FT</span>
      </div>
    </div>
  );
}
