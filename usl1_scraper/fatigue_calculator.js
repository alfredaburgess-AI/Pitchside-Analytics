/**
 * Fatigue Calculator — Frontend Data Contract
 * =============================================
 * Logic-First, AI-Second Architecture
 * 
 * This module calculates player and team fatigue using ONLY the deterministic
 * data from final_tactical_data.json. Zero external API calls. Zero latency.
 * 
 * Formula: current_stamina = (BASE_STAMINA - (minute * DECAY_RATE)) * stamina_multiplier
 * 
 * Data Contract:
 *   Each player object in the JSON must have:
 *   - environmental_modifiers.stamina_multiplier  (float, 0-1)
 *   - environmental_modifiers.elevation_ft        (int, feet)
 *   - environmental_modifiers.altitude_penalty    (float, 0-1)
 *   - environmental_modifiers.humidity_penalty     (float, 0-1)
 *   - stats_2025.minutes                          (int)
 *   - stats_2025.goals                            (int)
 *   - stats_2025.assists                          (int)
 *   - stats_2025.appearances                      (int)
 * 
 * Usage (Next.js / v0.dev):
 *   import { calculatePlayerFatigue, calculateTeamFatigue, getSubstitutionCandidates }
 *     from './fatigue_calculator.js';
 * 
 *   const fatigue = calculatePlayerFatigue(player, 67);
 *   const teamFatigue = calculateTeamFatigue(teamPlayers, 67);
 *   const subs = getSubstitutionCandidates(teamPlayers, 67);
 */

// ── Fatigue Constants (from _meta.fatigue_defaults) ──
const BASE_STAMINA = 100;
const DECAY_RATE_PER_MINUTE = 0.9;
const FATIGUE_DANGER_ZONE = 35; // Below this, player is exhausted

/**
 * Calculate a single player's current stamina at a given match minute.
 * Pure math — no API calls.
 * 
 * @param {Object} player - Player object from final_tactical_data.json
 * @param {number} currentMinute - Current match minute (0-90+)
 * @returns {Object} Fatigue breakdown
 */
export function calculatePlayerFatigue(player, currentMinute) {
  const multiplier = player.environmental_modifiers.stamina_multiplier;
  const elevationFt = player.environmental_modifiers.elevation_ft;

  const rawStamina = BASE_STAMINA - (currentMinute * DECAY_RATE_PER_MINUTE);
  const adjustedStamina = Math.max(0, rawStamina * multiplier);
  const fatiguePercent = Math.round(100 - adjustedStamina);

  return {
    player_id: player.player_id,
    player_name: player.player_name,
    position: player.logistics_2026.position,
    current_stamina: Math.round(adjustedStamina * 10) / 10,
    fatigue_percent: Math.min(100, fatiguePercent),
    stamina_multiplier: multiplier,
    elevation_ft: elevationFt,
    is_exhausted: adjustedStamina < FATIGUE_DANGER_ZONE,
    needs_substitution: adjustedStamina < FATIGUE_DANGER_ZONE + 10
  };
}

/**
 * Calculate the average fatigue for an entire team's active roster.
 * 
 * @param {Array} players - Array of player objects (active 11 or full squad)
 * @param {number} currentMinute - Current match minute
 * @returns {Object} Team fatigue summary
 */
export function calculateTeamFatigue(players, currentMinute) {
  const results = players.map(p => calculatePlayerFatigue(p, currentMinute));

  const totalStamina = results.reduce((sum, r) => sum + r.current_stamina, 0);
  const avgStamina = results.length > 0 ? totalStamina / results.length : 0;
  const exhaustedCount = results.filter(r => r.is_exhausted).length;

  return {
    team_average_stamina: Math.round(avgStamina * 10) / 10,
    team_fatigue_percent: Math.round(100 - avgStamina),
    exhausted_players: exhaustedCount,
    total_players: results.length,
    player_breakdowns: results,
    alert_level: exhaustedCount >= 3 ? 'critical' : (exhaustedCount >= 1 ? 'warning' : 'normal')
  };
}

/**
 * Get substitution candidates — players who need to come off.
 * Sorted by most fatigued first.
 * 
 * @param {Array} players - Array of player objects
 * @param {number} currentMinute - Current match minute
 * @returns {Array} Players needing substitution, sorted by urgency
 */
export function getSubstitutionCandidates(players, currentMinute) {
  return players
    .map(p => calculatePlayerFatigue(p, currentMinute))
    .filter(r => r.needs_substitution)
    .sort((a, b) => a.current_stamina - b.current_stamina);
}

/**
 * Quick fatigue check for a single minute tick during simulation.
 * Returns only the minimal data needed for the UI update loop.
 * 
 * @param {Array} players - Array of player objects
 * @param {number} currentMinute - Current match minute
 * @returns {Object} Minimal fatigue data for fast rendering
 */
export function tickFatigue(players, currentMinute) {
  return players.map(p => {
    const multiplier = p.environmental_modifiers.stamina_multiplier;
    const raw = BASE_STAMINA - (currentMinute * DECAY_RATE_PER_MINUTE);
    const stamina = Math.max(0, Math.round(raw * multiplier * 10) / 10);
    return {
      id: p.player_id,
      s: stamina,                          // stamina (compact for fast tick)
      e: stamina < FATIGUE_DANGER_ZONE     // exhausted flag
    };
  });
}

// ── Node.js test mode ──
// Run: node fatigue_calculator.js
if (typeof process !== 'undefined' && process.argv[1]?.includes('fatigue_calculator')) {
  import('fs').then(fs => {
    const raw = fs.readFileSync('final_tactical_data.json', 'utf8');
    const data = JSON.parse(raw);
    
    console.log('='.repeat(60));
    console.log('  Fatigue Calculator — Verification Test');
    console.log(`  Schema: v${data._meta.schema_version} | ${data._meta.total_players} players`);
    console.log(`  Formula: ${data._meta.fatigue_formula}`);
    console.log('='.repeat(60));

    // Pick first 5 players for demo
    const sample = data.players.slice(0, 5);
    
    [30, 60, 75, 85].forEach(minute => {
      console.log(`\n── Minute ${minute} ──`);
      sample.forEach(player => {
        const result = calculatePlayerFatigue(player, minute);
        const status = result.is_exhausted ? '🔴 EXHAUSTED' : (result.needs_substitution ? '🟡 TIRED' : '🟢 OK');
        console.log(`  ${status} ${result.player_name}: ${result.current_stamina}% (×${result.stamina_multiplier})`);
      });
    });

    // Team fatigue at minute 75
    console.log('\n── Team Fatigue Summary (Minute 75) ──');
    const teamResult = calculateTeamFatigue(sample, 75);
    console.log(`  Avg Stamina: ${teamResult.team_average_stamina}%`);
    console.log(`  Exhausted: ${teamResult.exhausted_players}/${teamResult.total_players}`);
    console.log(`  Alert: ${teamResult.alert_level.toUpperCase()}`);
  });
}
