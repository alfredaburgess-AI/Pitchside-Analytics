/**
 * Team Utilities — Maps between JSON short names, full names, and logo slugs.
 */

import { TeamMeta, Player } from './types';
import tacticalData from '@/data/final_tactical_data.json';

// JSON team_2026 short names → _meta.teams full names
export const TEAM_NAME_MAP: Record<string, string> = {
  'Alta': 'AV Alta FC',
  'Athletic Club Boise': 'Athletic Club Boise',
  'Charlotte Independence': 'Charlotte Independence',
  'Chattanooga Red Wolves': 'Chattanooga Red Wolves SC',
  'Corpus Christi': 'Corpus Christi FC',
  'Fort Wayne': 'Fort Wayne FC',
  'Forward Madison': 'Forward Madison FC',
  'Greenville Triumph': 'Greenville Triumph SC',
  'Naples': 'FC Naples',
  'NY Cosmos': 'New York Cosmos',
  'One Knoxville': 'One Knoxville SC',
  'Portland Hearts of Pine': 'Portland Hearts of Pine',
  'Richmond Kickers': 'Richmond Kickers',
  'Sarasota Paradise': 'Sarasota Paradise',
  'Spokane Velocity': 'Spokane Velocity FC',
  'Union Omaha': 'Union Omaha',
  'Westchester SC': 'Westchester SC',
};

// Full team name → logo file slug (matches filenames in /logos/opponents/)
export const TEAM_SLUG_MAP: Record<string, string> = {
  'AV Alta FC': 'av_alta_fc',
  'Athletic Club Boise': 'athletic_club_boise',
  'Charlotte Independence': 'charlotte_independence',
  'Chattanooga Red Wolves SC': 'chattanooga_red_wolves_sc',
  'Corpus Christi FC': 'corpus_christi_fc',
  'Fort Wayne FC': 'fort_wayne_fc',
  'Forward Madison FC': 'forward_madison_fc',
  'Greenville Triumph SC': 'greenville_triumph_sc',
  'FC Naples': 'fc_naples',
  'New York Cosmos': 'new_york_cosmos',
  'One Knoxville SC': 'one_knoxville_sc',
  'Portland Hearts of Pine': 'portland_hearts_of_pine',
  'Richmond Kickers': 'richmond_kickers',
  'Sarasota Paradise': 'sarasota_paradise',
  'Spokane Velocity FC': 'spokane_velocity_fc',
  'Union Omaha': 'Union_Omaha',
  'Westchester SC': 'westchester_sc',
};

// Stadium names (display only)
export const STADIUM_NAMES: Record<string, string> = {
  'AV Alta FC': 'Zions Bank Stadium',
  'Athletic Club Boise': 'Boise Bench Complex',
  'Charlotte Independence': 'American Legion Memorial Stadium',
  'Chattanooga Red Wolves SC': 'CHI Memorial Stadium',
  'Corpus Christi FC': 'Corpus Christi FC Stadium',
  'Fort Wayne FC': 'Shields Field',
  'Forward Madison FC': 'Breese Stevens Field',
  'Greenville Triumph SC': 'Triumph Stadium',
  'FC Naples': 'Paradise Coast Sports Complex',
  'New York Cosmos': 'Mitchel Athletic Complex',
  'One Knoxville SC': 'Regal Soccer Stadium',
  'Portland Hearts of Pine': 'Fort Fitzy',
  'Richmond Kickers': 'City Stadium',
  'Sarasota Paradise': 'Paradise Field',
  'Spokane Velocity FC': 'ONE Spokane Stadium',
  'Union Omaha': 'Werner Park',
  'Westchester SC': 'Westchester Stadium',
};

export function teamNameToSlug(shortName: string): string {
  const fullName = TEAM_NAME_MAP[shortName] || shortName;
  return TEAM_SLUG_MAP[fullName] || fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export function getTeamMeta(shortName: string): TeamMeta | null {
  const fullName = TEAM_NAME_MAP[shortName] || shortName;
  const meta = (tacticalData._meta.teams as Record<string, TeamMeta>)[fullName];
  return meta || null;
}

export function getFullTeamName(shortName: string): string {
  return TEAM_NAME_MAP[shortName] || shortName;
}

export function getStadiumName(shortName: string): string {
  const fullName = TEAM_NAME_MAP[shortName] || shortName;
  return STADIUM_NAMES[fullName] || `${fullName} Stadium`;
}

export const PORTLAND_NAME = 'Portland Hearts of Pine';

export function getOpponentTeams(): string[] {
  const teams = new Set<string>();
  (tacticalData.players as Player[]).forEach((p) => {
    if (p.team_2026 !== PORTLAND_NAME) {
      teams.add(p.team_2026);
    }
  });
  return Array.from(teams).sort();
}

export function getPlayersByTeam(teamName: string): Player[] {
  return (tacticalData.players as Player[]).filter((p) => p.team_2026 === teamName);
}

export function getPortlandPlayers(): Player[] {
  return getPlayersByTeam(PORTLAND_NAME);
}

/**
 * Get headshot URL path for a player. Returns null if no headshot.
 * Converts "Player Headshots/Adam_Armour.png" → "/headshots/Adam_Armour.png"
 */
export function getHeadshotUrl(player: Player): string | null {
  const path = player.logistics_2026.headshot_path;
  if (!path) return null;
  const filename = path.split('/').pop();
  return `/headshots/${filename}`;
}

/**
 * Get player initials for fallback avatar
 */
export function getPlayerInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
