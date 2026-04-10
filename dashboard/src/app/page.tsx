'use client';

import { MatchProvider } from '@/context/MatchContext';
import Header from '@/components/Header';
import VenueToggle from '@/components/MatchSetup/VenueToggle';
import FormationToggle from '@/components/MatchSetup/FormationToggle';
import OpponentDropdown from '@/components/MatchSetup/OpponentDropdown';
import StadiumCard from '@/components/MatchSetup/StadiumCard';
import MatchMinuteSlider from '@/components/MatchSetup/MatchMinuteSlider';
import TacticalPitch from '@/components/Pitch/TacticalPitch';
import BenchPanel from '@/components/BenchAdvisor/BenchPanel';
import TacticalAdvisor from '@/components/BenchAdvisor/TacticalAdvisor';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <MatchProvider>
      <div className="dashboard">
        <Header />

        <main className="dashboardGrid">
          {/* Left Column — Match Setup */}
          <section className="columnLeft">
            <h2 className="columnTitle">Match Setup</h2>
            <VenueToggle />
            <FormationToggle />
            <OpponentDropdown />
            <StadiumCard />
            <MatchMinuteSlider />
          </section>

          {/* Center Column — Interactive Pitch */}
          <section className="columnCenter">
            <h2 className="columnTitle">Interactive Pitch</h2>
            <ErrorBoundary fallbackTitle="Pitch Analysis Offline">
              <TacticalPitch />
            </ErrorBoundary>
          </section>

          {/* Right Column — Bench & Advisor */}
          <section className="columnRight">
            <BenchPanel />
            <ErrorBoundary fallbackTitle="Tactical Advisor Failure">
              <TacticalAdvisor />
            </ErrorBoundary>
          </section>
        </main>
      </div>
    </MatchProvider>
  );
}
