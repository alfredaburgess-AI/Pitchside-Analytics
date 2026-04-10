/**
 * Fatigue Calculator — Frontend Data Contract (TypeScript Port)
 * Logic-First, AI-Second Architecture
 *
 * Formula: current_stamina = (BASE_STAMINA - (minute * DECAY_RATE)) * stamina_multiplier
 */

import { Player, FatigueResult, TeamFatigueResult, EnvironmentalModifiers } from './types';

const BASE_STAMINA = 100;
const DEFAULT_DECAY_RATE_PER_MINUTE = 0.45;
const FATIGUE_DANGER_ZONE = 65; // The 'Red Line' - dropping below 65% efficiency

export function calculatePlayerFatigue(
  player: Player,
  currentMinute: number,
  envOverrides?: Partial<EnvironmentalModifiers>
): FatigueResult {
  const multiplier = envOverrides?.stamina_multiplier ?? player.environmental_modifiers.stamina_multiplier;
  const elevationFt = envOverrides?.elevation_ft ?? player.environmental_modifiers.elevation_ft;

  // Use dynamic decay rate if available, else default
  let decayRate = player.stats_2025.match_minute_decay ?? DEFAULT_DECAY_RATE_PER_MINUTE;

  // Positional Intensity: 1.1x multiplier for Midfielders and Wingers
  const status = player.logistics_2026.position.toLowerCase();
  const role = player.logistics_2026.tactical_role?.toLowerCase() || '';
  const isMidOrWinger = status.includes('midfielder') || status.includes('forward') || ['lm', 'rm', 'lw', 'rw'].includes(role);
  
  if (isMidOrWinger) {
    decayRate *= 1.1;
  }

  const rawStamina = BASE_STAMINA - (currentMinute * decayRate);
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
    needs_substitution: adjustedStamina < FATIGUE_DANGER_ZONE + 10,
  };
}

export function calculateTeamFatigue(
  players: Player[],
  currentMinute: number,
  envOverrides?: Partial<EnvironmentalModifiers>
): TeamFatigueResult {
  const results = players.map((p) => calculatePlayerFatigue(p, currentMinute, envOverrides));

  const totalStamina = results.reduce((sum, r) => sum + r.current_stamina, 0);
  const avgStamina = results.length > 0 ? totalStamina / results.length : 0;
  const exhaustedCount = results.filter((r) => r.is_exhausted).length;

  return {
    team_average_stamina: Math.round(avgStamina * 10) / 10,
    team_fatigue_percent: Math.round(100 - avgStamina),
    exhausted_players: exhaustedCount,
    total_players: results.length,
    player_breakdowns: results,
    alert_level: exhaustedCount >= 3 ? 'critical' : exhaustedCount >= 1 ? 'warning' : 'normal',
  };
}

export function getSubstitutionCandidates(
  players: Player[],
  currentMinute: number,
  envOverrides?: Partial<EnvironmentalModifiers>
): FatigueResult[] {
  return players
    .map((p) => calculatePlayerFatigue(p, currentMinute, envOverrides))
    .filter((r) => r.needs_substitution)
    .sort((a, b) => a.current_stamina - b.current_stamina);
}

export function getStaminaColor(stamina: number): string {
  if (stamina > 75) return '#00E676';
  if (stamina > FATIGUE_DANGER_ZONE) return '#FFD600';
  return '#FF1744';
}

export function getStaminaLabel(stamina: number): string {
  if (stamina > 75) return 'Optimal';
  if (stamina > FATIGUE_DANGER_ZONE) return 'Approaching Red Line';
  return 'Red Line - SUB NOW';
}
