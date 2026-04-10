'use client';

import { useMatch } from '@/context/MatchContext';
import styles from './MatchSetup.module.css';
import { Home, Plane } from 'lucide-react';

export default function VenueToggle() {
  const { state, dispatch } = useMatch();

  return (
    <div className={styles.venueToggle}>
      <button
        className={`${styles.venueBtn} ${state.venue === 'home' ? styles.venueBtnActive : ''}`}
        onClick={() => dispatch({ type: 'SET_VENUE', venue: 'home' })}
        id="venue-home-btn"
        aria-label="Set venue to home"
        aria-pressed={state.venue === 'home'}
      >
        <Home size={20} className={styles.venueIcon} />
        HOME
      </button>
      <button
        className={`${styles.venueBtn} ${state.venue === 'away' ? styles.venueBtnActive : ''}`}
        onClick={() => dispatch({ type: 'SET_VENUE', venue: 'away' })}
        id="venue-away-btn"
        aria-label="Set venue to away"
        aria-pressed={state.venue === 'away'}
      >
        <Plane size={20} className={styles.venueIcon} />
        AWAY
      </button>
    </div>
  );
}
