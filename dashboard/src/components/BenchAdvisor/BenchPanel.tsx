'use client';

import { useMatch } from '@/context/MatchContext';
import { calculatePlayerFatigue } from '@/lib/fatigue-calculator';
import { getHeadshotUrl, getPlayerInitials } from '@/lib/team-utils';
import { Player } from '@/lib/types';
import Image from 'next/image';
import styles from './BenchAdvisor.module.css';
import { useState } from 'react';
import { Star } from 'lucide-react';

interface BenchPlayerCardProps {
  player: Player;
}

function BenchPlayerCard({ player }: BenchPlayerCardProps) {
  const [imgError, setImgError] = useState(false);
  const headshotUrl = getHeadshotUrl(player);
  const initials = getPlayerInitials(player.player_name);

  // Format name: "John Smith" -> "J. Smith"
  const nameParts = player.player_name.split(' ');
  const displayName = nameParts.length > 1 
    ? `${nameParts[0].charAt(0)}. ${nameParts.slice(1).join(' ')}` 
    : player.player_name;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', player.player_id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={styles.benchCard}
      draggable
      onDragStart={handleDragStart}
      id={`bench-${player.player_id}`}
      tabIndex={0}
      aria-label={`Substitute ${player.player_name}`}
    >
      <div className={styles.benchHeadshot}>
        {headshotUrl && !imgError ? (
          <Image
            src={headshotUrl}
            alt={player.player_name}
            width={32}
            height={32}
            unoptimized
            className={styles.benchImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.benchInitials}>{initials}</div>
        )}
      </div>

      {player.logistics_2026.jersey_number && (
        <div className={styles.jerseyCircle}>
          <span className={styles.jerseyNumber}>{player.logistics_2026.jersey_number}</span>
        </div>
      )}

      <div className={styles.benchInfo}>
        <span className={styles.benchName}>
          {displayName}
          {player.stats_2025.threat_score && player.stats_2025.threat_score > 85 && (
            <Star 
              size={8} 
              fill="#D4AF37" 
              color="#000080" 
              style={{ marginLeft: 2, verticalAlign: 'middle' }} 
            />
          )}
        </span>
        <span className={styles.benchPosition}>{player.logistics_2026.position}</span>
      </div>
    </div>
  );
}

export default function BenchPanel() {
  const { state } = useMatch();

  // Calculate fatigue for bench players and sort by fitness
  const benchWithFatigue = state.bench
    .map((player) => {
      const fatigue = calculatePlayerFatigue(
        player,
        state.currentMinute,
        state.venue === 'away' ? state.environmentalModifiers : undefined
      );
      return { player, stamina: fatigue.current_stamina };
    })
    .sort((a, b) => b.stamina - a.stamina);

  return (
    <div className={styles.benchPanel}>
      <h3 className={styles.sectionTitle}>The Bench</h3>
      <p className={styles.benchHint}>Drag a player onto the pitch to substitute</p>
      <div className={styles.benchList}>
        {benchWithFatigue.map(({ player }) => (
          <BenchPlayerCard key={player.player_id} player={player} />
        ))}
      </div>
      {state.bench.length === 0 && (
        <p className={styles.emptyBench}>No substitutes available</p>
      )}
    </div>
  );
}
