'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MatchState, Player, TeamMeta, FormationType } from '@/lib/types';
import { getPortlandPlayers, getPlayersByTeam, getTeamMeta } from '@/lib/team-utils';
import { selectStartingXI, reassignForFormation } from '@/lib/formation-positions';

const PORTLAND_META: TeamMeta = {
  elevation_ft: 60,
  altitude_penalty: 0.0,
  humidity_penalty: 0.0,
  stamina_multiplier: 1.0,
};

type MatchAction =
  | { type: 'SET_VENUE'; venue: 'home' | 'away' }
  | { type: 'SET_OPPONENT'; opponent: string }
  | { type: 'SET_MINUTE'; minute: number }
  | { type: 'SET_FORMATION'; formation: FormationType }
  | { type: 'SWAP_PLAYER'; benchPlayer: Player; pitchPlayer: Player }
  | { type: 'SET_INSIGHT'; insight: string | null }
  | { type: 'SET_ADVISOR_LOADING'; loading: boolean }
  | { type: 'SET_SWAP_SOURCE'; player: Player | null }
  | { type: 'INIT'; players: Player[] };

function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'INIT': {
      const { starters, bench } = selectStartingXI(action.players, state.formation);
      return { ...state, activeSquad: starters, bench };
    }
    case 'SET_VENUE': {
      const env = action.venue === 'home'
        ? PORTLAND_META
        : (state.selectedOpponent ? getTeamMeta(state.selectedOpponent) || PORTLAND_META : PORTLAND_META);
      return { ...state, venue: action.venue, environmentalModifiers: env };
    }
    case 'SET_OPPONENT': {
      const opponentPlayers = getPlayersByTeam(action.opponent);
      const { starters: opStarters } = selectStartingXI(opponentPlayers);
      const env = state.venue === 'away'
        ? getTeamMeta(action.opponent) || PORTLAND_META
        : PORTLAND_META;
      return {
        ...state,
        selectedOpponent: action.opponent,
        opponentSquad: opStarters,
        environmentalModifiers: env,
      };
    }
    case 'SET_MINUTE':
      return { ...state, currentMinute: action.minute };
    case 'SET_FORMATION': {
      const { starters, bench } = reassignForFormation(
        state.activeSquad,
        state.bench,
        action.formation,
      );
      return { ...state, formation: action.formation, activeSquad: starters, bench };
    }
    case 'SWAP_PLAYER': {
      const newActive = state.activeSquad.map((p) =>
        p.player_id === action.pitchPlayer.player_id ? action.benchPlayer : p
      );
      const newBench = state.bench.map((p) =>
        p.player_id === action.benchPlayer.player_id ? action.pitchPlayer : p
      );
      return { ...state, activeSquad: newActive, bench: newBench, swapSource: null };
    }
    case 'SET_INSIGHT':
      return { ...state, advisorInsight: action.insight, advisorLoading: false };
    case 'SET_ADVISOR_LOADING':
      return { ...state, advisorLoading: action.loading };
    case 'SET_SWAP_SOURCE':
      return { ...state, swapSource: action.player };
    default:
      return state;
  }
}

const initialState: MatchState = {
  venue: 'home',
  selectedOpponent: null,
  currentMinute: 0,
  formation: '4-4-2',
  activeSquad: [],
  bench: [],
  opponentSquad: [],
  environmentalModifiers: PORTLAND_META,
  advisorInsight: null,
  advisorLoading: false,
  swapSource: null,
};

interface MatchContextValue {
  state: MatchState;
  dispatch: React.Dispatch<MatchAction>;
}

const MatchContext = createContext<MatchContextValue | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(matchReducer, initialState);

  useEffect(() => {
    const portlandPlayers = getPortlandPlayers();
    dispatch({ type: 'INIT', players: portlandPlayers });
  }, []);

  return (
    <MatchContext.Provider value={{ state, dispatch }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error('useMatch must be used within MatchProvider');
  return ctx;
}
