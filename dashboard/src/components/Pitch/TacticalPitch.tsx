'use client';

import { useMatch } from '@/context/MatchContext';
import { assignFormationPositions, getTacticalLineYs } from '@/lib/formation-positions';
import PlayerNode from './PlayerNode';
import styles from './Pitch.module.css';

export default function InteractivePitch() {
  const { state } = useMatch();

  const portlandPositions = assignFormationPositions(state.activeSquad, state.formation, false);
  const tacticalYs = getTacticalLineYs(state.formation);

  return (
    <div className={styles.pitchContainer}>
      <div className={styles.pitch} id="interactive-pitch">
        {/* SVG Field Lines */}
        <svg
          className={styles.fieldSvg}
          viewBox="0 0 680 1050"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grass stripes */}
          <defs>
            <pattern id="grassPattern" x="0" y="0" width="680" height="75" patternUnits="userSpaceOnUse">
              <rect width="680" height="75" fill="rgba(0, 29, 61, 0.12)" />
              <rect y="37.5" width="680" height="37.5" fill="rgba(0, 29, 61, 0.08)" />
            </pattern>
          </defs>
          <rect width="680" height="1050" fill="url(#grassPattern)" rx="8" />

          {/* Boundary */}
          <rect x="30" y="30" width="620" height="990" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

          {/* Halfway line */}
          <line x1="30" y1="525" x2="650" y2="525" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

          {/* Center circle */}
          <circle cx="340" cy="525" r="91.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle cx="340" cy="525" r="4" fill="rgba(255,255,255,0.15)" />

          {/* Top penalty area */}
          <rect x="148" y="30" width="384" height="165" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <rect x="220" y="30" width="240" height="55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <circle cx="340" cy="145" r="3" fill="rgba(255,255,255,0.12)" />
          <rect x="270" y="20" width="140" height="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" rx="2" />

          {/* Bottom penalty area */}
          <rect x="148" y="855" width="384" height="165" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <rect x="220" y="965" width="240" height="55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <circle cx="340" cy="905" r="3" fill="rgba(255,255,255,0.12)" />
          <rect x="270" y="1015" width="140" height="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" rx="2" />

          {/* Corner arcs */}
          <path d="M30,40 Q40,30 50,30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <path d="M630,30 Q640,30 650,40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <path d="M30,1010 Q40,1020 50,1020" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <path d="M630,1020 Q640,1020 650,1010" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

          {/* ── Tactical unit lines (dashed) ── */}
          {tacticalYs.map((yPct, i) => {
            const yPx = (yPct / 100) * 1050;
            return (
              <line
                key={`tactic-${i}`}
                x1="50"
                y1={yPx}
                x2="630"
                y2={yPx}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.5"
                strokeDasharray="12 8"
                className={styles.tacticalLine}
              />
            );
          })}
        </svg>

        {/* Player Nodes */}
        <div className={styles.nodesLayer}>
          {portlandPositions.map(({ player, position }) => (
            <PlayerNode
              key={player.player_id}
              player={player}
              x={position.x}
              y={position.y}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
