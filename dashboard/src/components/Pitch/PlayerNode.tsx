'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMatch } from '@/context/MatchContext';
import { Player } from '@/lib/types';
import { calculatePlayerFatigue } from '@/lib/fatigue-calculator';
import { getHeadshotUrl, getPlayerInitials } from '@/lib/team-utils';
import StaminaRing from './StaminaRing';
import styles from './Pitch.module.css';
import { Sparkles, Star } from 'lucide-react';
import { useState } from 'react';

interface PlayerNodeProps {
  player: Player;
  x: number;
  y: number;
}

export default function PlayerNode({ player, x, y }: PlayerNodeProps) {
  const { state, dispatch } = useMatch();
  const [imgError, setImgError] = useState(false);

  const fatigue = calculatePlayerFatigue(
    player,
    state.currentMinute,
    state.venue === 'away' ? state.environmentalModifiers : undefined
  );

  const headshotUrl = getHeadshotUrl(player);
  const initials = getPlayerInitials(player.player_name);
  const nodeSize = 52;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const benchPlayerId = e.dataTransfer.getData('text/plain');
    console.log(`[DND] Dropped player ${benchPlayerId} onto ${player.player_name}`);
    
    const benchPlayer = state.bench.find((p) => p.player_id === benchPlayerId);
    if (benchPlayer) {
      dispatch({ type: 'SWAP_PLAYER', benchPlayer, pitchPlayer: player });
    } else {
      console.warn(`[DND] Could not find bench player with ID: ${benchPlayerId}`);
    }
  };

    const handleInsightClick = () => {
    // Find best sub for this position
    const bestSub = state.bench
      .filter((p) => p.logistics_2026.position === player.logistics_2026.position)
      .sort((a, b) => (b.stats_2025.threat_score || 0) - (a.stats_2025.threat_score || 0))[0];

    dispatch({ type: 'SET_ADVISOR_LOADING', loading: true });
    fetch('/api/tactical-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minute: state.currentMinute,
        elevation_ft: state.environmentalModifiers.elevation_ft,
        stamina_multiplier: state.environmentalModifiers.stamina_multiplier,
        player_out: {
          name: player.player_name,
          position: player.logistics_2026.position,
          goals: player.stats_2025.goals,
          assists: player.stats_2025.assists,
          minutes: player.stats_2025.minutes,
          threat_score: player.stats_2025.threat_score,
          gls_per90: player.stats_2025.gls_per90,
          stamina: fatigue.current_stamina,
        },
        player_in: bestSub ? {
          name: bestSub.player_name,
          position: bestSub.logistics_2026.position,
          goals: bestSub.stats_2025.goals,
          assists: bestSub.stats_2025.assists,
          minutes: bestSub.stats_2025.minutes,
          threat_score: bestSub.stats_2025.threat_score,
          gls_per90: bestSub.stats_2025.gls_per90,
        } : {
          name: 'Best Available Sub',
          position: player.logistics_2026.position,
          goals: 0,
          assists: 0,
          minutes: 0,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => dispatch({ type: 'SET_INSIGHT', insight: data.insight }))
      .catch(() => dispatch({ type: 'SET_INSIGHT', insight: 'Unable to fetch insight.' }));
  };

  return (
    <motion.div
      className={styles.playerNode}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{ transform: 'translate(-50%, -50%)' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div 
        className={styles.nodeCircle} 
        style={{ width: nodeSize, height: nodeSize }}
        onClick={handleInsightClick}
        role="button"
        tabIndex={0}
        aria-label={`Get AI Insight for ${player.player_name}`}
      >
        <StaminaRing stamina={fatigue.current_stamina} size={nodeSize} />

        <div className={styles.nodeInner}>
          {headshotUrl && !imgError ? (
            <Image
              src={headshotUrl}
              alt={player.player_name}
              width={40}
              height={40}
              unoptimized
              className={styles.headshot}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.initialsAvatar} title={player.player_name}>
              {initials}
            </div>
          )}
          {/* Hover Overlay Trigger */}
          <div className={styles.hoverOverlay}>
            <Sparkles size={16} className={styles.insightIcon} />
          </div>
        </div>

        {player.logistics_2026.jersey_number && (
          <span className={styles.jerseyBadge}>
            {player.logistics_2026.jersey_number}
          </span>
        )}
      </div>

      <span className={styles.playerLabel}>
        {player.player_name.split(' ').pop()}
        {player.stats_2025.threat_score && player.stats_2025.threat_score > 85 && (
          <Star 
            size={12} 
            fill="#D4AF37" 
            color="#000080" 
            style={{ marginLeft: 4, verticalAlign: 'middle', filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.5))' }} 
          />
        )}
      </span>

      <span className={styles.staminaLabel}>
        {Math.round(fatigue.current_stamina)}%
      </span>


    </motion.div>
  );
}
