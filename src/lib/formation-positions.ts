/**
 * Formation Positions — SVG coordinate mapping
 * All values are percentages (0-100) relative to the pitch container.
 * Portland (Home) occupies Y 50–95 (bottom half).
 * Opponent (Away) occupies Y 5–45 (top half).
 */

import { FormationPosition, FormationType, Player } from './types';

// ── Portland 4-4-2 ──
export const PORTLAND_4_4_2: FormationPosition[] = [
  { x: 50, y: 92, role: 'GK' },
  { x: 15, y: 78, role: 'LB' },
  { x: 38, y: 78, role: 'LCB' },
  { x: 62, y: 78, role: 'RCB' },
  { x: 85, y: 78, role: 'RB' },
  { x: 15, y: 62, role: 'LM' },
  { x: 38, y: 62, role: 'LCM' },
  { x: 62, y: 62, role: 'RCM' },
  { x: 85, y: 62, role: 'RM' },
  { x: 35, y: 48, role: 'LS' },
  { x: 65, y: 48, role: 'RS' },
];

// ── Portland 4-3-3 ──
export const PORTLAND_4_3_3: FormationPosition[] = [
  { x: 50, y: 92, role: 'GK' },
  { x: 15, y: 78, role: 'LB' },
  { x: 38, y: 78, role: 'LCB' },
  { x: 62, y: 78, role: 'RCB' },
  { x: 85, y: 78, role: 'RB' },
  { x: 25, y: 62, role: 'LCM' },
  { x: 50, y: 62, role: 'CM' },
  { x: 75, y: 62, role: 'RCM' },
  { x: 15, y: 48, role: 'LW' },
  { x: 50, y: 48, role: 'ST' },
  { x: 85, y: 48, role: 'RW' },
];

// ── Opponent 4-4-2 (mirrored, top half) ──
export const OPPONENT_FORMATION_4_4_2: FormationPosition[] = [
  { x: 50, y: 8,  role: 'GK' },
  { x: 80, y: 20, role: 'LB' },
  { x: 60, y: 20, role: 'LCB' },
  { x: 40, y: 20, role: 'RCB' },
  { x: 20, y: 20, role: 'RB' },
  { x: 80, y: 35, role: 'LM' },
  { x: 60, y: 35, role: 'LCM' },
  { x: 40, y: 35, role: 'RCM' },
  { x: 20, y: 35, role: 'RM' },
  { x: 60, y: 45, role: 'LS' },
  { x: 40, y: 45, role: 'RS' },
];

// ── Position slots per formation ──
const SLOTS_4_4_2: Record<string, number> = {
  Goalkeeper: 1,
  Defender: 4,
  Midfielder: 4,
  Forward: 2,
};

const SLOTS_4_3_3: Record<string, number> = {
  Goalkeeper: 1,
  Defender: 4,
  Midfielder: 3,
  Forward: 3,
};



// ── Public helpers ──

export function getFormation(formation: FormationType, isOpponent = false): FormationPosition[] {
  if (isOpponent) return OPPONENT_FORMATION_4_4_2;
  return formation === '4-3-3' ? PORTLAND_4_3_3 : PORTLAND_4_4_2;
}

export function getSlots(formation: FormationType): Record<string, number> {
  return formation === '4-3-3' ? SLOTS_4_3_3 : SLOTS_4_4_2;
}



/**
 * Auto-select starting XI from available players.
 * Prioritises players with headshots for visual impact.
 */
export function selectStartingXI(
  players: Player[],
  formation: FormationType = '4-4-2',
): { starters: Player[]; bench: Player[] } {
  const slots = getSlots(formation);

  const byPosition: Record<string, Player[]> = {
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: [],
  };
  const others: Player[] = [];

  players.forEach((p) => {
    const pos = p.logistics_2026.position;
    if (byPosition[pos]) {
      byPosition[pos].push(p);
    } else {
      others.push(p);
    }
  });

  // Sort: Minutes Played (desc), headshots first, then alphabetical
  Object.keys(byPosition).forEach((pos) => {
    byPosition[pos].sort((a, b) => {
      // Prioritize Minutes Spent on Pitch (Experience)
      const am = a.stats_2025.minutes || 0;
      const bm = b.stats_2025.minutes || 0;
      if (am !== bm) return bm - am;

      // Tie-breaker 1: Headshot availability
      const ah = a.logistics_2026.headshot_path ? 0 : 1;
      const bh = b.logistics_2026.headshot_path ? 0 : 1;
      if (ah !== bh) return ah - bh;

      // Tie-breaker 2: Name
      return a.player_name.localeCompare(b.player_name);
    });
  });

  const starters: Player[] = [];
  const remainingPlayers: Player[] = [];

  // 1. Fill slots with natural positions
  Object.entries(slots).forEach(([pos, count]) => {
    const available = byPosition[pos] || [];
    starters.push(...available.slice(0, count));
    remainingPlayers.push(...available.slice(count));
  });

  // 2. Add 'others' to the bench pool only (unassigned positions don't start)
  remainingPlayers.push(...others);

  // 3. Fill any gaps from the remaining pool if we don't have enough natural starters
  const targetCount = Object.values(slots).reduce((a, b) => a + b, 0);
  if (starters.length < targetCount) {
    const gaps = targetCount - starters.length;
    remainingPlayers.sort((a, b) => {
      const ah = a.logistics_2026.headshot_path ? 0 : 1;
      const bh = b.logistics_2026.headshot_path ? 0 : 1;
      if (ah !== bh) return ah - bh;
      return a.player_name.localeCompare(b.player_name);
    });
    starters.push(...remainingPlayers.slice(0, gaps));
    const bench = remainingPlayers.slice(gaps);
    return { starters, bench };
  }

  return { starters, bench: remainingPlayers };
}

/**
 * Reassign the squad when the formation changes.
 * Players that lose a slot are moved to the bench.
 * Empty slots remain unfilled for the user to drag in.
 */
export function reassignForFormation(
  currentStarters: Player[],
  currentBench: Player[],
  newFormation: FormationType,
): { starters: Player[]; bench: Player[] } {
  const newSlots = getSlots(newFormation);

  // 1. Prioritise keeping current starters in their roles
  const byPosition: Record<string, Player[]> = {
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: [],
  };

  currentStarters.forEach((p) => {
    const pos = p.logistics_2026.position;
    if (byPosition[pos]) byPosition[pos].push(p);
  });

  const starters: Player[] = [];
  const remainingStarters: Player[] = [];

  // Fill as many slots as possible from current starters
  Object.entries(newSlots).forEach(([pos, count]) => {
    const available = byPosition[pos] || [];
    starters.push(...available.slice(0, count));
    remainingStarters.push(...available.slice(count));
  });

  // 2. We might still have gaps if the new formation needs more players in a category
  const targetCount = Object.values(newSlots).reduce((a, b) => a + b, 0);
  const displacedStartersAndBench = [...remainingStarters, ...currentBench];

  if (starters.length < targetCount) {
    // Group remaining players by position
    const benchByPos: Record<string, Player[]> = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: [],
    };
    displacedStartersAndBench.forEach(p => {
      const pos = p.logistics_2026.position;
      if (benchByPos[pos]) benchByPos[pos].push(p);
    });

    // Try to fill specific category gaps first
    Object.entries(newSlots).forEach(([pos, count]) => {
      const currentlyFilled = starters.filter(p => p.logistics_2026.position === pos).length;
      const gaps = count - currentlyFilled;
      if (gaps > 0) {
        const available = benchByPos[pos] || [];
        const toAdd = available.slice(0, gaps);
        starters.push(...toAdd);
        // Remove from displaced pool
        toAdd.forEach(added => {
          const idx = displacedStartersAndBench.findIndex(p => p.player_id === added.player_id);
          if (idx !== -1) displacedStartersAndBench.splice(idx, 1);
        });
      }
    });
  }

  // 3. Last resort: if still < 11 (e.g. not enough players in a category), just fill with anyone
  if (starters.length < targetCount && displacedStartersAndBench.length > 0) {
    const gaps = targetCount - starters.length;
    starters.push(...displacedStartersAndBench.slice(0, gaps));
    const bench = displacedStartersAndBench.slice(gaps);
    return { starters, bench };
  }

  return { starters, bench: displacedStartersAndBench };
}

/**
 * Stable assignment of players to formation positions.
 * Ensures that for a given category (e.g. Defender), 
 * the players are mapped to slots from left-to-right based on a stable sort (player_id).
 */
export function assignFormationPositions(
  starters: Player[],
  formation: FormationType = '4-4-2',
  isOpponent = false,
): { player: Player; position: FormationPosition }[] {
  const positions = getFormation(formation, isOpponent);
  const assigned: { player: Player; position: FormationPosition }[] = [];
  
  // Categorise players
  const playersByCat: Record<string, Player[]> = {
    Goalkeeper: [], Defender: [], Midfielder: [], Forward: []
  };
  starters.forEach(p => {
    const cat = p.logistics_2026.position;
    if (playersByCat[cat]) playersByCat[cat].push(p);
  });
  
  // Sort players by ID for stability
  Object.values(playersByCat).forEach(list => list.sort((a,b) => a.player_id.localeCompare(b.player_id)));

  // Categorise slots
  const categoryMap: Record<string, string> = {
    'GK': 'Goalkeeper',
    'LB': 'Defender', 'RB': 'Defender', 'LCB': 'Defender', 'RCB': 'Defender', 'CB': 'Defender',
    'LM': 'Midfielder', 'RM': 'Midfielder', 'LCM': 'Midfielder', 'RCM': 'Midfielder', 'CM': 'Midfielder',
    'LW': 'Forward', 'RW': 'Forward', 'ST': 'Forward', 'LS': 'Forward', 'RS': 'Forward'
  };
  
  const slotsByCat: Record<string, {pos: FormationPosition, idx: number}[]> = {
    Goalkeeper: [], Defender: [], Midfielder: [], Forward: []
  };
  
  positions.forEach((pos, idx) => {
    const cat = categoryMap[pos.role] || 'Midfielder';
    slotsByCat[cat].push({ pos, idx });
  });

  // Sort slots by horizontal X coordinate
  Object.values(slotsByCat).forEach(list => list.sort((a,b) => a.pos.x - b.pos.x));

  const usedPlayerIds = new Set<string>();
  const usedPositionIndices = new Set<number>();

  // Assign grouped categories
  ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(cat => {
    const players = playersByCat[cat];
    const slots = slotsByCat[cat];
    players.forEach((player, i) => {
      if (slots[i]) {
        assigned.push({ player, position: slots[i].pos });
        usedPlayerIds.add(player.player_id);
        usedPositionIndices.add(slots[i].idx);
      }
    });
  });

  // Overflow for any outliers (shouldn't happen with 11 players and 11 slots)
  const remainingPlayers = starters.filter(p => !usedPlayerIds.has(p.player_id));
  const remainingSlots = positions
    .map((pos, idx) => ({ pos, idx }))
    .filter(s => !usedPositionIndices.has(s.idx))
    .sort((a,b) => a.pos.x - b.pos.x);

  remainingPlayers.forEach((player, i) => {
    if (remainingSlots[i]) {
      assigned.push({ player, position: remainingSlots[i].pos });
    }
  });

  return assigned;
}

/**
 * Tactical‑line Y coordinates per formation for drawing dashed unit lines.
 */
export function getTacticalLineYs(formation: FormationType): number[] {
  if (formation === '4-3-3') return [80, 65]; 
  return [80, 65]; 
}
