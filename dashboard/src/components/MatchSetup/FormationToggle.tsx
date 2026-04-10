'use client';

import { useMatch } from '@/context/MatchContext';
import { FormationType } from '@/lib/types';
import styles from './MatchSetup.module.css';

const FORMATIONS: FormationType[] = ['4-4-2', '4-3-3'];

export default function FormationToggle() {
  const { state, dispatch } = useMatch();

  return (
    <div className={styles.formationToggleWrapper}>
      <span className={styles.label}>Formation</span>
      <div className={styles.formationToggle}>
        {FORMATIONS.map((f) => (
          <button
            key={f}
            className={`${styles.formationBtn} ${state.formation === f ? styles.formationBtnActive : ''}`}
            onClick={() => dispatch({ type: 'SET_FORMATION', formation: f })}
            id={`formation-${f}-btn`}
            aria-label={`Switch to ${f} formation`}
            aria-pressed={state.formation === f}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
