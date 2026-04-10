// ── Pitchside Analytics — Type Definitions ──

export type TacticalRole = 'GK' | 'LB' | 'CB' | 'RB' | 'LM' | 'CM' | 'RM' | 'LW' | 'ST' | 'RW';

export interface PlayerLogistics {
  jersey_number: number | null;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  tactical_role?: TacticalRole;
  home_stadium_coords: [number, number] | null;
  headshot_path: string | null;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  minutes: number;
  appearances: number;
  threat_score?: number;
  match_minute_decay?: number;
  gls_per90?: number;
}

export interface EnvironmentalModifiers {
  elevation_ft: number;
  altitude_penalty: number;
  humidity_penalty: number;
  stamina_multiplier: number;
}

export interface Player {
  player_id: string;
  player_name: string;
  team_2026: string;
  logistics_2026: PlayerLogistics;
  history_2025: {
    transfer_source_league: string;
  };
  stats_2025: PlayerStats;
  environmental_modifiers: EnvironmentalModifiers;
}

export interface TeamMeta {
  elevation_ft: number;
  altitude_penalty: number;
  humidity_penalty: number;
  stamina_multiplier: number;
}

export interface TacticalData {
  _meta: {
    schema_version: string;
    architecture: string;
    generated_at: string;
    total_players: number;
    fatigue_formula: string;
    fatigue_defaults: {
      base_stamina: number;
      decay_rate_per_minute: number;
    };
    teams: Record<string, TeamMeta>;
  };
  players: Player[];
}

export interface FatigueResult {
  player_id: string;
  player_name: string;
  position: string;
  current_stamina: number;
  fatigue_percent: number;
  stamina_multiplier: number;
  elevation_ft: number;
  is_exhausted: boolean;
  needs_substitution: boolean;
}

export interface TeamFatigueResult {
  team_average_stamina: number;
  team_fatigue_percent: number;
  exhausted_players: number;
  total_players: number;
  player_breakdowns: FatigueResult[];
  alert_level: 'normal' | 'warning' | 'critical';
}

export interface FormationPosition {
  x: number; // percent 0-100
  y: number; // percent 0-100
  role: string;
}

export type FormationType = '4-4-2' | '4-3-3';

export interface MatchState {
  venue: 'home' | 'away';
  selectedOpponent: string | null;
  currentMinute: number;
  formation: FormationType;
  activeSquad: Player[];
  bench: Player[];
  opponentSquad: Player[];
  environmentalModifiers: TeamMeta;
  advisorInsight: string | null;
  advisorLoading: boolean;
  swapSource: Player | null;
}
