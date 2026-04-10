'use client';

import { useMatch } from '@/context/MatchContext';
import { getOpponentTeams, getFullTeamName, teamNameToSlug } from '@/lib/team-utils';
import OpponentCrest from '@/components/OpponentCrest';
import styles from './MatchSetup.module.css';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function OpponentDropdown() {
  const { state, dispatch } = useMatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const opponents = getOpponentTeams();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (team: string) => {
    dispatch({ type: 'SET_OPPONENT', opponent: team });
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <label className={styles.label}>Opponent</label>
      <button
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        id="opponent-dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select opponent team"
      >
        {state.selectedOpponent ? (
          <span className={styles.selectedOpponent}>
            <OpponentCrest teamSlug={teamNameToSlug(state.selectedOpponent)} size={24} />
            <span>{getFullTeamName(state.selectedOpponent)}</span>
          </span>
        ) : (
          <span className={styles.placeholder}>Select opponent…</span>
        )}
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdownList} role="listbox">
          {opponents.map((team) => (
            <button
              key={team}
              className={`${styles.dropdownItem} ${state.selectedOpponent === team ? styles.dropdownItemActive : ''}`}
              onClick={() => handleSelect(team)}
              role="option"
              aria-selected={state.selectedOpponent === team}
            >
              <OpponentCrest teamSlug={teamNameToSlug(team)} size={24} />
              <span>{getFullTeamName(team)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
