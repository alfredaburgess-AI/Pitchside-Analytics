import { NextResponse } from 'next/server';

interface InsightRequest {
  minute: number;
  elevation_ft: number;
  stamina_multiplier: number;
  player_out: {
    name: string;
    position: string;
    goals: number;
    assists: number;
    minutes: number;
    threat_score?: number;
    gls_per90?: number;
    stamina?: number;
  };
  player_in: {
    name: string;
    position: string;
    goals: number;
    assists: number;
    minutes: number;
    threat_score?: number;
    gls_per90?: number;
  };
}

function generateMockInsight(data: InsightRequest): string {
  const { minute, elevation_ft, player_out, player_in } = data;

  const primaryThreats = ['Masashi Wada', 'Ollie Wright'];
  const isPrimary = primaryThreats.includes(player_out.name);
  const threatText = isPrimary ? ' (Primary Offensive Threat)' : '';
  
  // Logic-First: Recognize Starters (Top 11 by Minutes Played)
  const isStarter = player_out.minutes >= 193;
  const starterText = isStarter ? ' [Starter]' : ' [Reserve]';

  const threatScore = player_out.threat_score || 0;
  const staminaValue = player_out.stamina ? Math.round(player_out.stamina) : 68;
  const isRedLine = staminaValue <= 70;

  // Profile-based suggestions citing specific 2025 stats
  if (isPrimary && isRedLine) {
    return `🚨 CRITICAL SITUATION: Your Primary Offensive Threat (${player_out.name}${starterText}) has hit the Red Line (${staminaValue}%). With a 2025 record of 9 Goals and ${threatScore} Threat Score over ${player_out.minutes} mins, his late-game output is vital. At ${elevation_ft}ft, we recommend a 'High-Threat Finisher' profile to maintain this scoring probability.`;
  }

  if (isRedLine && minute >= 75) {
    return `⚠️ URGENT SUB: The ${player_out.position} profile (${threatScore} Threat) is exhausting at ${elevation_ft}ft. Based on ${player_out.minutes} mins of 2025 data, a 'Fresh Intensity' profile from the bench is required to secure the current result. Priority: System Stability over Name Retention.`;
  }

  return `ANALYZING: Profile ${player_out.name} (2025: ${player_out.goals} Goals, ${player_out.minutes} mins, ${threatScore} Threat) is performing within expected 2026 parameters at ${staminaValue}% stamina. The ${elevation_ft}ft elevation has not yet compromised this unit's tactical integrity.`;
}

export async function POST(request: Request) {
  try {
    const data: InsightRequest = await request.json();

    if (!data || !data.player_out || !data.player_in) {
      return NextResponse.json(
        { insight: 'Invalid request data provided.' },
        { status: 400 }
      );
    }

    // Mock mode — no external API dependency required
    const insight = generateMockInsight(data);

    // Simulate a brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json(
      { insight: 'Unable to generate tactical insight. Please try again.' },
      { status: 500 }
    );
  }
}
