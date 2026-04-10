'use client';

import { useMatch } from '@/context/MatchContext';
import styles from './BenchAdvisor.module.css';
import { BrainCircuit } from 'lucide-react';

export default function TacticalAdvisor() {
  const { state } = useMatch();

  return (
    <div className={styles.advisorPanel}>
      <h3 className={styles.sectionTitle}>
        <BrainCircuit size={16} className={styles.advisorIcon} />
        Tactical Advisor
      </h3>

      <div className={styles.advisorContent}>
        {state.advisorLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <span className={styles.loadingText}>Analyzing match situation…</span>
          </div>
        ) : state.advisorInsight ? (
          <div className={styles.insightText}>
            {state.advisorInsight}
          </div>
        ) : (
          <div className={styles.emptyAdvisor}>
            <BrainCircuit size={28} className={styles.emptyIcon} />
            <p>Click the <span className={styles.sparkleRef}>✨</span> button on any player to get AI-powered tactical insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}
