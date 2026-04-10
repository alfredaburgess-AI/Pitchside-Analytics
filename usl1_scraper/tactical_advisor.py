"""
Tactical Advisor Module — Logic-First, AI-Second Architecture
==============================================================
This module is DECOUPLED from the real-time simulation loop.
It is ONLY triggered when a user clicks 'Get AI Insight' on a specific substitution.

Usage:
    from tactical_advisor import get_substitution_insight

    insight = get_substitution_insight(
        minute=67,
        elevation_ft=2730,
        stamina_multiplier=0.95,
        player_out={"name": "John Doe", "position": "Forward", "goals": 5, "assists": 3, "minutes": 1200},
        player_in={"name": "Jane Smith", "position": "Forward", "goals": 8, "assists": 6, "minutes": 900}
    )
    print(insight)

Environment:
    Set ANTHROPIC_API_KEY to use live Claude API.
    If unset, falls back to intelligent mock mode (no external calls).
"""

import os
import json

# ── Configuration ──
USE_MOCK = not bool(os.environ.get("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 300

# ── Prompt Template ──
PROMPT_TEMPLATE = """Player: {out_name}. 2025 Stats: {out_goals} Goals{top_scorer}, {out_minutes}+ mins. Current Match State: {minute}th minute, {stamina}% Stamina, Away at {elevation_ft}ft. Provide a tactical justification for keeping him on or subbing him."""


def _build_prompt(minute, elevation_ft, stamina_multiplier, player_out, player_in):
    """Builds the formatted prompt from substitution context."""
    # Logic-First: Recognize Primary Scoring Threats (9 Goals)
    primary_threats = ["Masashi Wada", "Ollie Wright"]
    is_primary = player_out.get("name") in primary_threats
    threat_text = " (Primary Offensive Threat)" if is_primary else ""
    
    # Logic-First: Recognize Starters (Top 11 by Minutes Played)
    is_starter = player_out.get("minutes", 0) >= 193
    starter_text = " [Starter]" if is_starter else " [Reserve]"
    
    threat_score = player_out.get("threat_score", player_out.get("threat_score_0_100", 0))
    stamina = player_out.get("stamina", 68)
    
    return PROMPT_TEMPLATE.format(
        minute=minute,
        elevation_ft=elevation_ft,
        out_name=f"{player_out['name']}{starter_text}{threat_text}",
        out_goals=player_out.get("goals", 0),
        top_scorer=f" | Threat Score: {threat_score}",
        out_minutes=player_out.get("minutes", 0),
        stamina=stamina
    )


def _mock_response(minute, elevation_ft, stamina_multiplier, player_out, player_in):
    """Generates a data-driven intelligent mock response referencing 2025 stats."""
    primary_threats = ["Masashi Wada", "Ollie Wright"]
    is_primary = player_out.get("name") in primary_threats
    stamina = player_out.get("stamina", 68)
    is_red_line = stamina <= 70
    
    threat_score = player_out.get("threat_score", player_out.get("threat_score_0_100", 72.5))
    minutes_2025 = player_out.get("minutes", 1200)

    if is_primary and is_red_line:
        return f"🚨 CRITICAL SITUATION: Your Primary Offensive Threat (2025: 9 Goals, {threat_score} Threat) is at {stamina}% stamina in the {minute}' min. At {elevation_ft}ft, maintaining this high-minutes profile ({minutes_2025} mins) risks output drop-off. Recommend subbing in a fresh 'High-Threat' profile to capitalize on late-game opportunities."

    if is_red_line and minute >= 75:
        return f"⚠️ URGENT SUB: Based on 2025 profile (Threat: {threat_score}), this {player_out.get('position')} has exceeded physical limits at this elevation. Refreshing with a high-intensity profile is tactically prioritized over individual retention to secure the points."

    return f"ANALYZING: Profile {player_out['name']} (2025: {player_out.get('goals', 0)} Goals, {minutes_2025} mins, {threat_score} Threat) currently stable at {stamina}% stamina. Despite the {elevation_ft}ft environment, the tactical unit is preserved. Monitor for drop-off past the 75th minute."


def _call_claude(prompt):
    """Calls the Anthropic Claude API. Only invoked when ANTHROPIC_API_KEY is set."""
    try:
        import anthropic
    except ImportError:
        return "[ERROR] anthropic package not installed. Run: pip install anthropic"

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
    
    message = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text


def get_substitution_insight(minute, elevation_ft, stamina_multiplier, player_out, player_in):
    """
    Get a tactical explanation for a proposed substitution.
    
    This function is the ONLY entry point for AI in the system.
    It is NEVER called during the simulation loop — only on user demand.
    
    Args:
        minute (int): Current match minute (0-90+)
        elevation_ft (int): Venue elevation in feet
        stamina_multiplier (float): Team's environmental stamina modifier
        player_out (dict): Player being removed — keys: name, position, goals, assists, minutes
        player_in (dict): Player being added — keys: name, position, goals, assists, minutes
    
    Returns:
        str: Natural language tactical explanation
    """
    if USE_MOCK:
        print("[Tactical Advisor] Running in MOCK mode (no ANTHROPIC_API_KEY set)")
        return _mock_response(minute, elevation_ft, stamina_multiplier, player_out, player_in)
    
    print("[Tactical Advisor] Calling Claude API...")
    prompt = _build_prompt(minute, elevation_ft, stamina_multiplier, player_out, player_in)
    return _call_claude(prompt)


# ── CLI Test Mode ──
if __name__ == "__main__":
    print("=" * 60)
    print("  Tactical Advisor — Test Mode")
    print(f"  Mode: {'MOCK (no API key)' if USE_MOCK else 'LIVE (Claude API)'}")
    print("=" * 60)

    test_insight = get_substitution_insight(
        minute=67,
        elevation_ft=2730,
        stamina_multiplier=0.95,
        player_out={
            "name": "Blake Bodily",
            "position": "Defender",
            "goals": 2,
            "assists": 4,
            "minutes": 1800
        },
        player_in={
            "name": "Zion Scarlett",
            "position": "Forward",
            "goals": 8,
            "assists": 6,
            "minutes": 1350
        }
    )

    print(f"\n{test_insight}")
