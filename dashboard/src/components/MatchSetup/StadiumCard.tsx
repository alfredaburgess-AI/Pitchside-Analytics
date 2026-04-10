'use client';

import { useMatch } from '@/context/MatchContext';
import { getFullTeamName, getStadiumName, getTeamMeta } from '@/lib/team-utils';
import styles from './MatchSetup.module.css';
import { Mountain, Droplets, Gauge } from 'lucide-react';

export default function StadiumCard() {
  const { state } = useMatch();

  const teamName = state.venue === 'away' && state.selectedOpponent
    ? state.selectedOpponent
    : 'Portland Hearts of Pine';

  const fullName = getFullTeamName(teamName);
  const stadiumName = getStadiumName(teamName);
  const meta = getTeamMeta(teamName);

  return (
    <div className={styles.stadiumCard}>
      <div className={styles.stadiumHeader}>
        <h3 className={styles.stadiumName}>{stadiumName}</h3>
        <span className={styles.stadiumTeam}>{fullName}</span>
      </div>

      {meta && (
        <div className={styles.envGrid}>
          <div className={styles.envItem}>
            <Mountain size={16} className={styles.envIcon} />
            <div className={styles.envDetail}>
              <span className={styles.envLabel}>Elevation</span>
              <span className={styles.envValue}>{meta.elevation_ft.toLocaleString()} ft</span>
            </div>
          </div>

          <div className={styles.envDivider} />

          <div className={styles.envTaxHeader}>
            <Gauge size={14} />
            <span>Environmental Tax</span>
          </div>

          <div className={styles.taxRow}>
            <Mountain size={13} />
            <span>Altitude</span>
            <span className={meta.altitude_penalty > 0 ? styles.taxAmber : styles.taxGreen}>
              ×{(1 - meta.altitude_penalty).toFixed(2)}
            </span>
          </div>

          <div className={styles.taxRow}>
            <Droplets size={13} />
            <span>Humidity</span>
            <span className={meta.humidity_penalty > 0 ? styles.taxAmber : styles.taxGreen}>
              ×{(1 - meta.humidity_penalty).toFixed(2)}
            </span>
          </div>

          <div className={styles.taxDivider} />

          <div className={styles.taxTotal}>
            <span>Stamina Multiplier</span>
            <span className={styles.taxGold}>×{meta.stamina_multiplier.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
