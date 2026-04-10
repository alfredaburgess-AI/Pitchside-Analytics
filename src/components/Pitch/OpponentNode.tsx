'use client';

import { Player } from '@/lib/types';
import { getPlayerInitials } from '@/lib/team-utils';
import styles from './Pitch.module.css';

interface OpponentNodeProps {
  player: Player;
  x: number;
  y: number;
}

export default function OpponentNode({ player, x, y }: OpponentNodeProps) {
  const initials = getPlayerInitials(player.player_name);
  const lastName = player.player_name.split(' ').pop();
  const number = player.logistics_2026.jersey_number;

  return (
    <div
      className={styles.opponentNode}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={styles.opponentCircle}>
        <span className={styles.opponentInitials}>{initials}</span>
      </div>
      <span className={styles.opponentLabel}>
        {number ? `${number}. ` : ''}{lastName}
      </span>
    </div>
  );
}
