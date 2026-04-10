import json
import pandas as pd
import os
import re
import unicodedata
import hashlib
from datetime import datetime, timezone

def normalize_name(name):
    """Normalize accents and convert to a comparable snake_case string aggressively."""
    if pd.isna(name) or not name:
        return ""
    name_str = str(name).strip()
    nfkd_form = unicodedata.normalize('NFKD', name_str)
    normalized = nfkd_form.encode('ASCII', 'ignore').decode('utf-8')
    normalized = normalized.lower().replace(" ", "_").replace("-", "_")
    return re.sub(r"[^a-z0-9_]", "", normalized)

def generate_short_hash(text):
    return hashlib.md5(str(text).encode('utf-8')).hexdigest()[:6]

def merge_data():
    footy_dir = "Footy_datasets"
    headshots_dir = "Player Headshots"
    
    usl1_2026_csv_path = os.path.join(footy_dir, "usa-usl-league-one-players-2026-to-2026-stats.csv")
    mls_next_pro_csv_path = os.path.join(footy_dir, "usa-mls-next-pro-players-2026-to-2026-stats.csv")
    usl2_csv_path = os.path.join(footy_dir, "usa-usl-league-two-players-2026-to-2026-stats.csv")
    
    json_roster_path = "data/usl1_2026_rosters.json"
    output_path = "final_tactical_data.json"

    # Environmental Data Dictionary for all 17 teams
    environmental_map = {
        "AV Alta FC": {"elevation_ft": 2350, "climate_note": "Arid"},
        "Athletic Club Boise": {"elevation_ft": 2730, "climate_note": "Semi-Arid"},
        "Charlotte Independence": {"elevation_ft": 750, "climate_note": "High Humidity"},
        "Chattanooga Red Wolves SC": {"elevation_ft": 680, "climate_note": "High Humidity"},
        "Corpus Christi FC": {"elevation_ft": 10, "climate_note": "High Humidity"},
        "FC Naples": {"elevation_ft": 10, "climate_note": "High Humidity"},
        "Fort Wayne FC": {"elevation_ft": 790, "climate_note": "Temperate"},
        "Forward Madison FC": {"elevation_ft": 860, "climate_note": "Temperate"},
        "Greenville Triumph SC": {"elevation_ft": 960, "climate_note": "High Humidity"},
        "New York Cosmos": {"elevation_ft": 70, "climate_note": "Temperate"},
        "One Knoxville SC": {"elevation_ft": 900, "climate_note": "High Humidity"},
        "Portland Hearts of Pine": {"elevation_ft": 60, "climate_note": "Temperate", "stadium_name": "Fort Fitzy"},
        "Richmond Kickers": {"elevation_ft": 160, "climate_note": "High Humidity"},
        "Sarasota Paradise": {"elevation_ft": 20, "climate_note": "High Humidity"},
        "Spokane Velocity FC": {"elevation_ft": 1900, "climate_note": "Semi-Arid"},
        "Union Omaha": {"elevation_ft": 1150, "climate_note": "Temperate"},
        "Westchester SC": {"elevation_ft": 150, "climate_note": "Temperate"}
    }

    if not os.path.exists(json_roster_path):
         print(f"Error: {json_roster_path} not found.")
         return

    print("Loading datasets...")
    with open(json_roster_path, 'r') as f:
        json_roster = json.load(f)
        
    roster_lookup = {
        normalize_name(player["player_name"]): player
        for player in json_roster
    }

    try:
        df_usl1_2026 = pd.read_csv(usl1_2026_csv_path)
    except FileNotFoundError as e:
        print(f"Error loading USL1 CSV: {e}")
        return

    try:
        df_mls_np = pd.read_csv(mls_next_pro_csv_path)
    except FileNotFoundError:
        df_mls_np = pd.DataFrame()

    try:
        df_usl2 = pd.read_csv(usl2_csv_path)
    except FileNotFoundError:
        df_usl2 = pd.DataFrame()

    try:
        df_phop = pd.read_csv("PHOP_Master_Database.csv", encoding='latin-1')
    except FileNotFoundError:
        df_phop = pd.DataFrame()

    try:
        df_export = pd.read_csv("Players_export.csv")
    except FileNotFoundError:
        df_export = pd.DataFrame()

    # Performance Optimization: Pre-compute _norm_name
    name_col_usl1 = 'full_name' if 'full_name' in df_usl1_2026.columns else 'name'
    df_usl1_2026['_norm_name'] = df_usl1_2026[name_col_usl1].apply(normalize_name)

    if not df_mls_np.empty:
        name_col_mls = 'full_name' if 'full_name' in df_mls_np.columns else 'name'
        df_mls_np['_norm_name'] = df_mls_np[name_col_mls].apply(normalize_name)

    if not df_usl2.empty:
        name_col_usl2 = 'full_name' if 'full_name' in df_usl2.columns else 'name'
        df_usl2['_norm_name'] = df_usl2[name_col_usl2].apply(normalize_name)

    if not df_phop.empty:
        df_phop['_norm_name'] = df_phop['Player Name'].apply(normalize_name)

    if not df_export.empty:
        df_export['_norm_name'] = df_export['player_name'].apply(normalize_name)

    stat_cols = {
        'goals': 'goals_overall',
        'assists': 'assists_overall',
        'minutes': 'minutes_played_overall',
        'appearances': 'appearances_overall'
    }

    final_data = []
    processed_norms = set()
    team_counts_all = {}  
    team_counts_matched = {}
    unmatched_portland_players = []

    print(f"Processing master list...")

    for index, current_player in df_usl1_2026.iterrows():
        # Name Scrubbing: Remove legacy "0" or "O" suffixes and trailing spaces
        raw_player_name = str(current_player.get(name_col_usl1, '')).strip().rstrip(' 0O').strip()
        # Security Hardening: Aggressively sanitize names for path safety
        raw_player_name = re.sub(r'[^a-zA-Z0-9\s\'\-]', '', raw_player_name)
        
        if not raw_player_name or raw_player_name.lower() == 'nan':
            continue

        raw_team_name = str(current_player.get('Current Club', current_player.get('team', 'Unknown')))
        
        # Ensure name consistency (e.g., Mohamed Mohamed vs Mo Mohamad)
        norm_name = normalize_name(raw_player_name)
        processed_norms.add(norm_name)

        # Baseline Decay Map based on physical metabolic demand
        POSITION_DECAY_MAP = {
            "goalkeeper": 0.08,
            "defender": 0.42,
            "midfielder": 0.55,
            "forward": 0.48,
            "unknown": 0.45
        }
        
        pos_raw = str(current_player.get('position', 'unknown')).lower()
        decay_val = POSITION_DECAY_MAP.get(pos_raw, 0.45)
        # Handle compound positions (e.g. Midfielder/Forward)
        if 'midfielder' in pos_raw: decay_val = POSITION_DECAY_MAP["midfielder"]
        elif 'forward' in pos_raw: decay_val = POSITION_DECAY_MAP["forward"]
        elif 'defender' in pos_raw: decay_val = POSITION_DECAY_MAP["defender"]
        elif 'gk' in pos_raw or 'goalkeeper' in pos_raw: decay_val = POSITION_DECAY_MAP["goalkeeper"]

        merged_record = {
            "player_id": "", 
            "player_name": raw_player_name,
            "team_2026": raw_team_name,
            "logistics_2026": {
                "jersey_number": None,
                "position": str(current_player.get('position', 'Unknown')),
                "home_stadium_coords": None,
                "headshot_path": None
            },
            "history_2025": {
                "transfer_source_league": "USL League One"
            },
            "stats_2025": {
                "goals": 0,
                "assists": 0,
                "minutes": 0,
                "appearances": 0,
                "match_minute_decay": float(decay_val)
            },
            "environmental_modifiers": {}
        }

        # Environmental data — resolve early for elevation_ft injection
        env_data = environmental_map.get(raw_team_name, {"elevation_ft": 0, "climate_note": "Unknown"})

        # HEADSHOT LOGIC (.png prioritized)
        # Standard: /headshots/[First]_[Last].png
        first_last = raw_player_name.replace(' ', '_').replace('-', '')
        merged_record["logistics_2026"]["headshot_path"] = f"/headshots/{first_last}.png"
        
        # SPECIFIC OVERRIDES & AUDIT
        if norm_name == "mo_mohamad" or norm_name == "mohamed_mohamed":
            merged_record["player_name"] = "Mo Mohamad"
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Mo_Mohamad.png"
            merged_record["logistics_2026"]["jersey_number"] = 6
        
        # Portland Jersey Overrides Dictionary
        PORTLAND_JERSEY_MAPPING = {
            "hunter_morse": 1,
            "jaden_jones_riley": 2, "jaden_jerome_jones_riley": 2,
            "adam_armour": 3,
            "brecc_evans": 4,
            "diogo_barbosa": 5,
            "jay_tee_kamara": 7,
            "mikey_lopez": 8,
            "emiliano_terzaghi": 9, "emiliano_franco_terzaghi": 9,
            "ollie_wright": 10,
            "serigne_mbacke_faye": 11, "serigne_cheikh_mbacke_faye": 11,
            "kashope_oladapo": 13, "kash_oladapo": 13,
            "michel_poon_angeron": 14,
            "masashi_wada": 12,
            "titus_washington": 15,
            "aboubacar_camara": 23, "aboubacar_kamara": 23
        }
        
        if norm_name in PORTLAND_JERSEY_MAPPING:
            merged_record["logistics_2026"]["jersey_number"] = PORTLAND_JERSEY_MAPPING[norm_name]

        if norm_name == "ollie_wright":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Ollie_Wright.png"
            
        if norm_name == "jay_tee_kamara":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/JayTee_Kamara.png"

        if norm_name == "emiliano_franco_terzaghi" or norm_name == "emiliano_terzaghi":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Emiliano_Terzaghi.png"

        if norm_name == "adam_armour":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Adam_Armour.png"
        
        if norm_name == "hunter_morse":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Hunter_Morse.png"

        if norm_name == "serigne_cheikh_mbacke_faye" or norm_name == "serigne_mbacke_faye":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Serigne_MbackeFaye.png"

        if norm_name == "kashope_oladapo" or norm_name == "kash_oladapo":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Kash_Oladapo.png"

        if norm_name == "jaden_jones_riley" or norm_name == "jaden_jerome_jones_riley":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Jaden_JonesRiley.png"

        if norm_name == "aboubacar_camara" or norm_name == "aboubacar_kamara":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Aboubacar_Camara.png"
            merged_record["team_2026"] = "Portland Hearts of Pine"

        if norm_name == "michel_poon_angeron":
            merged_record["logistics_2026"]["headshot_path"] = "/headshots/Michel_Poon-Angeron.png"

        # Extract Stats (MLS Next Pro & USL2) using pre-computed _norm_name
        mls_match = pd.DataFrame()
        if not df_mls_np.empty:
            mls_match = df_mls_np[df_mls_np['_norm_name'] == norm_name]
            
        usl2_match = pd.DataFrame()
        if not df_usl2.empty:
            usl2_match = df_usl2[df_usl2['_norm_name'] == norm_name]

        matched_in_merge = False

        if not mls_match.empty:
            match = mls_match.iloc[0]
            merged_record["history_2025"]["transfer_source_league"] = "MLS Next Pro"
            merged_record["stats_2025"]["goals"] = int(match.get(stat_cols['goals'], 0))
            merged_record["stats_2025"]["assists"] = int(match.get(stat_cols['assists'], 0))
            merged_record["stats_2025"]["minutes"] = int(match.get(stat_cols['minutes'], 0))
            merged_record["stats_2025"]["appearances"] = int(match.get(stat_cols['appearances'], 0))
            matched_in_merge = True
            
        elif not usl2_match.empty:
            match = usl2_match.iloc[0]
            merged_record["history_2025"]["transfer_source_league"] = "USL League Two"
            merged_record["stats_2025"]["goals"] = int(match.get(stat_cols['goals'], 0))
            merged_record["stats_2025"]["assists"] = int(match.get(stat_cols['assists'], 0))
            merged_record["stats_2025"]["minutes"] = int(match.get(stat_cols['minutes'], 0))
            merged_record["stats_2025"]["appearances"] = int(match.get(stat_cols['appearances'], 0))
            matched_in_merge = True

        # Merge Logistics and fallback Stats from JSON
        json_hit = roster_lookup.get(norm_name)
        if json_hit:
            matched_in_merge = True
            merged_record["logistics_2026"]["jersey_number"] = json_hit.get("logistics_2026", {}).get("jersey_number")
            merged_record["logistics_2026"]["home_stadium_coords"] = json_hit.get("logistics_2026", {}).get("home_stadium_coords")
            if merged_record["team_2026"] == 'Unknown':
                 merged_record["team_2026"] = json_hit.get("team_2026", "Unknown")
                 
            # Fallback to JSON history/stats
            if merged_record["history_2025"]["transfer_source_league"] == "USL League One":
                 history = json_hit.get("history_2025", {})
                 if history.get("transfer_source_league") != "USL League One":
                      merged_record["history_2025"]["transfer_source_league"] = history.get("transfer_source_league", "USL League One")
                 
                 stats = json_hit.get("stats_2025", {})
                 if stats.get("goals") or stats.get("minutes") or stats.get("appearances"):
                      merged_record["stats_2025"]["goals"] = int(stats.get("goals", 0))
                      merged_record["stats_2025"]["assists"] = int(stats.get("assists", 0))
                      merged_record["stats_2025"]["minutes"] = int(stats.get("minutes", 0))
                      merged_record["stats_2025"]["appearances"] = int(stats.get("appearances", stats.get("games_played", 0)))

        # PHOP Master Database Overrides
        if not df_phop.empty:
            phop_match = df_phop[df_phop['_norm_name'] == norm_name]
            if not phop_match.empty:
                match = phop_match.iloc[0]
                # Default to current merged value if not found or is NaN
                p_goals = match.get("Gls", float('nan'))
                if not pd.isna(p_goals): merged_record["stats_2025"]["goals"] = int(p_goals)
                
                p_assists = match.get("Assists", float('nan'))
                if not pd.isna(p_assists): merged_record["stats_2025"]["assists"] = int(p_assists)
                
                p_min = match.get("Min", float('nan'))
                if pd.isna(p_min): p_min = match.get("Minutes Played", float('nan'))
                if not pd.isna(p_min): merged_record["stats_2025"]["minutes"] = int(p_min)
                
                p_threat = match.get("Threat_Score_0_100", float('nan'))
                if not pd.isna(p_threat): merged_record["stats_2025"]["threat_score"] = float(p_threat)

        # Players Export (Base44) Overrides
        if not df_export.empty:
            export_match = df_export[df_export['_norm_name'] == norm_name]
            if not export_match.empty:
                match = export_match.iloc[0]
                p_decay = match.get("match_minute_decay", float('nan'))
                if not pd.isna(p_decay): merged_record["stats_2025"]["match_minute_decay"] = float(p_decay)
                
                p_gls90 = match.get("gls_per90", float('nan'))
                if not pd.isna(p_gls90): merged_record["stats_2025"]["gls_per90"] = float(p_gls90)

        # HUNTER MORSE OVERRIDE
        if norm_name == "hunter_morse":
            merged_record["logistics_2026"]["position"] = "Goalkeeper"
            merged_record["logistics_2026"]["jersey_number"] = 1

        # Math Refactor: Environmental Modifiers (Logic-First — all values strictly numeric)
        elevation = int(env_data["elevation_ft"])
        alt_penalty = float(0.05 if elevation > 1500 else 0.0)
        hum_penalty = float(0.06 if env_data["climate_note"] == 'High Humidity' else 0.0)
        stamina_multiplier = round((1.0 - alt_penalty) * (1.0 - hum_penalty), 3)

        merged_record["environmental_modifiers"] = {
            "elevation_ft": elevation,
            "altitude_penalty": alt_penalty,
            "humidity_penalty": hum_penalty,
            "stamina_multiplier": float(stamina_multiplier)
        }

        # Simulator Support: Generate unified player_id
        team_slug = raw_team_name.lower().replace(" ", "_").replace("-", "_")
        team_slug = re.sub(r"[^a-z0-9_]", "", team_slug)
        short_hash = generate_short_hash(raw_player_name)
        player_id = f"{team_slug}_{norm_name}_{short_hash}"
        merged_record["player_id"] = player_id

        final_data.append(merged_record)
        team_counts_matched[raw_team_name] = team_counts_matched.get(raw_team_name, 0) + 1

        # Audit Reporting for Portland Hearts of Pine
        if "portland" in raw_team_name.lower() and not matched_in_merge:
            unmatched_portland_players.append(raw_player_name)

    # ── Secondary Pass: Ensure all Portland players from PHOP are included ──
    print(f"Running secondary Portland roster check...")
    if not df_phop.empty:
        for index, phop_player in df_phop.iterrows():
            raw_name = str(phop_player.get('Player Name', '')).strip().rstrip(' 0O').strip()
            norm_name = normalize_name(raw_name)
            
            if norm_name in processed_norms or not raw_name:
                continue
            
            # Position-based decay normalization
            phop_pos = str(phop_player.get('POS', phop_player.get('Position', 'unknown'))).lower()
            decay_val = 0.45 
            if 'midfielder' in phop_pos or 'mf' in phop_pos: decay_val = 0.55
            elif 'forward' in phop_pos or 'fw' in phop_pos: decay_val = 0.48
            elif 'defender' in phop_pos or 'df' in phop_pos: decay_val = 0.42
            elif 'gk' in phop_pos: decay_val = 0.08

            # Create record for player found in Master DB but missing from national stats
            merged_record = {
                "player_id": "", 
                "player_name": raw_name,
                "team_2026": "Portland Hearts of Pine",
                "logistics_2026": {
                    "jersey_number": None,
                    "position": str(phop_player.get('POS', phop_player.get('Position', 'Unknown'))),
                    "home_stadium_coords": [43.6644, -70.2523], # Default Fort Fitzy
                    "headshot_path": f"/headshots/{raw_name.replace(' ', '_')}.jpg"
                },
                "history_2025": {
                    "transfer_source_league": "USL League One"
                },
                "stats_2025": {
                    "goals": 0, "assists": 0, "minutes": 0, "appearances": 0,
                    "match_minute_decay": float(decay_val)
                },
                "environmental_modifiers": {}
            }

            # Map Position specifically for formation support
            pos_raw = str(phop_player.get('POS', '')).lower()
            if 'gk' in pos_raw: merged_record["logistics_2026"]["position"] = "Goalkeeper"
            elif 'df' in pos_raw: merged_record["logistics_2026"]["position"] = "Defender"
            elif 'mf' in pos_raw: merged_record["logistics_2026"]["position"] = "Midfielder"
            elif 'fw' in pos_raw: merged_record["logistics_2026"]["position"] = "Forward"

            # Apply stats from PHOP
            p_goals = phop_player.get("Gls", float('nan'))
            if not pd.isna(p_goals): merged_record["stats_2025"]["goals"] = int(p_goals)
            p_min = phop_player.get("Min", float('nan'))
            if not pd.isna(p_min): merged_record["stats_2025"]["minutes"] = int(p_min)
            p_threat = phop_player.get("Threat_Score_0_100", float('nan'))
            if not pd.isna(p_threat): merged_record["stats_2025"]["threat_score"] = float(p_threat)

            # Apply headshot overrides for this secondary set
            if norm_name == "aboubacar_camara" or norm_name == "aboubacar_kamara":
                merged_record["logistics_2026"]["headshot_path"] = "/headshots/Aboubacar_Camara.png"

            if norm_name == "michel_poon_angeron":
                merged_record["logistics_2026"]["headshot_path"] = "/headshots/Michel_Poon-Angeron.png"

            # Apply same Jersey Overrides to secondary set
            if norm_name in PORTLAND_JERSEY_MAPPING:
                merged_record["logistics_2026"]["jersey_number"] = PORTLAND_JERSEY_MAPPING[norm_name]

            # Shared environmental Modifiers (Fort Fitzy)
            merged_record["environmental_modifiers"] = {
                "elevation_ft": 60, "altitude_penalty": 0.0, "humidity_penalty": 0.0, "stamina_multiplier": 1.0
            }

            # ID matches standard pattern
            player_id = f"portland_hearts_of_pine_{norm_name}_{generate_short_hash(raw_name)}"
            merged_record["player_id"] = player_id

            final_data.append(merged_record)
            processed_norms.add(norm_name)



    # ── Data Validation Pass (Logic-First guarantee) ──
    validation_errors = []
    for i, record in enumerate(final_data):
        env = record.get("environmental_modifiers", {})
        for key in ["elevation_ft", "altitude_penalty", "humidity_penalty", "stamina_multiplier"]:
            val = env.get(key)
            if not isinstance(val, (int, float)):
                validation_errors.append(f"Record {i} ({record['player_name']}): environmental_modifiers.{key} is {type(val).__name__}, expected numeric")
        stats = record.get("stats_2025", {})
        stat_keys_to_check = ["goals", "assists", "minutes", "appearances"]
        if "threat_score" in stats:
            stat_keys_to_check.append("threat_score")
        if "match_minute_decay" in stats:
            stat_keys_to_check.append("match_minute_decay")
        if "gls_per90" in stats:
            stat_keys_to_check.append("gls_per90")
            
        for key in stat_keys_to_check:
            val = stats.get(key)
            if not isinstance(val, (int, float)):
                validation_errors.append(f"Record {i} ({record['player_name']}): stats_2025.{key} is {type(val).__name__}, expected numeric")

    if validation_errors:
        print("\n❌ VALIDATION FAILED — cannot export non-numeric data:")
        for err in validation_errors:
            print(f"  • {err}")
        return

    print(f"\n✅ Validation passed: all environmental_modifiers and stats_2025 fields are strictly numeric.")

    # ── FINAL SCRUBBING PASS (Ensures Data Integrity) ──
    POSITION_DECAY_MAP = {
        "goalkeeper": 0.08,
        "defender": 0.42,
        "midfielder": 0.55,
        "forward": 0.48,
        "unknown": 0.45
    }

    for record in final_data:
        # 1. Clean Names Again (Aggressive suffix stripping)
        old_name = record["player_name"]
        record["player_name"] = str(old_name).strip().rstrip(' 0O').strip()
        
        # 2. Normalize Decay Rates (Force realism for simulation)
        stats = record.get("stats_2025", {})
        pos = str(record["logistics_2026"]["position"]).lower()
        
        # Determine target decay
        target_decay = POSITION_DECAY_MAP.get(pos, 0.45)
        if 'midfielder' in pos: target_decay = POSITION_DECAY_MAP["midfielder"]
        elif 'forward' in pos: target_decay = POSITION_DECAY_MAP["forward"]
        elif 'defender' in pos: target_decay = POSITION_DECAY_MAP["defender"]
        elif 'gk' in pos or 'goalkeeper' in pos: target_decay = POSITION_DECAY_MAP["goalkeeper"]

        # Only override if missing OR looks like a broken tiny value (like the 0.008 we saw)
        current_decay = stats.get("match_minute_decay", 0)
        if not current_decay or current_decay < 0.05:
            record["stats_2025"]["match_minute_decay"] = float(target_decay)

    # ── Build _meta.teams aggregate ──
    teams_aggregate = {}
    for team_name_key, env_info in environmental_map.items():
        elev = int(env_info["elevation_ft"])
        a_pen = 0.05 if elev > 1500 else 0.0
        h_pen = 0.06 if env_info["climate_note"] == "High Humidity" else 0.0
        teams_aggregate[team_name_key] = {
            "elevation_ft": elev,
            "altitude_penalty": a_pen,
            "humidity_penalty": h_pen,
            "stamina_multiplier": round((1.0 - a_pen) * (1.0 - h_pen), 3)
        }

    # ── FORCE INJECTION FOR MISSING PORTLAND PLAYERS ──
    if "aboubacar_camara" not in processed_norms:
        print(f"Force-injecting Aboubacar Camara to Portland roster...")
        camara = {
            "player_id": f"portland_hearts_of_pine_aboubacar_camara_{generate_short_hash('Aboubacar Camara')}",
            "player_name": "Aboubacar Camara", "team_2026": "Portland Hearts of Pine",
            "logistics_2026": {
                "jersey_number": 23, "position": "Forward",
                "home_stadium_coords": [43.6644, -70.2523], "headshot_path": "/headshots/Aboubacar_Camara.png"
            },
            "history_2025": { "transfer_source_league": "USL League One" },
            "stats_2025": { "goals": 0, "assists": 0, "minutes": 0, "appearances": 0, "match_minute_decay": 0.48 },
            "environmental_modifiers": { "elevation_ft": 60, "altitude_penalty": 0.0, "humidity_penalty": 0.0, "stamina_multiplier": 1.0 }
        }
        final_data.append(camara)

    # ── Build top-level output with _meta wrapper ──
    output_payload = {
        "_meta": {
            "schema_version": "2.0",
            "architecture": "logic_first_ai_second",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_players": len(final_data),
            "fatigue_formula": "current_stamina = (base_stamina - (minutes_played * decay_rate)) * stamina_multiplier",
            "fatigue_defaults": {
                "base_stamina": 100,
                "decay_rate_per_minute": 0.9
            },
            "teams": teams_aggregate
        },
        "players": final_data
    }

    with open(output_path, 'w') as out_f:
        json.dump(output_payload, out_f, indent=4)
        
    print(f"\n✅ Merging Complete! Output {len(final_data)} records to '{output_path}' (schema v2.0).\n")
    print("--- Auditability Match Rate Summary ---")
    for team in sorted(team_counts_all.keys()):
        total = team_counts_all[team]
        matched = team_counts_matched.get(team, 0)
        print(f"Matched {matched}/{total} {team} players")
        
    if unmatched_portland_players:
        print("\n--- Unmatched Portland Players ---")
        for player in unmatched_portland_players:
            print(f"- {player}")
    else:
        print("\nAll Portland players perfectly matched across sources!")

    print(f"\n📦 Schema v2.0 | {len(teams_aggregate)} teams | {len(final_data)} players")
    print(f"🔗 Ready for export to v0.dev/Next.js")

if __name__ == "__main__":
    merge_data()
