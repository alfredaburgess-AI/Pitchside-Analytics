import json
import os
import hashlib

def generate_short_hash(text):
    return hashlib.md5(str(text).encode('utf-8')).hexdigest()[:6]

# Data from update_roster.py and merge_usl_data.py
JERSEY_MAP = {
    "Hunter Morse": 1,
    "Jaden Jones-Riley": 2,
    "Adam Armour": 3,
    "Brecc Evans": 4,
    "Diogo Barbosa": 5,
    "Mikey Lopez": 8,
    "Emiliano Terzaghi": 9,
    "Ollie Wright": 10,
    "Serigne Mbacke Faye": 11,
    "Kash Oladapo": 13,
    "Michel Poon-Angeron": 14,
    "Masashi Wada": 12,
    "Titus Washington": 15,
    "Aboubacar Camara": 23,
    "Mo Mohamad": 6,
    "JayTee Kamara": 7,
    "Zion Scarlett": 41,
    "Konstantinos Georgallides": 21,
    "Walter Varela": 28,
    "Khalid Hersi": 19,
    "Tyler Huck": 35,
}

# New players from CSV/Headshots
ROSTER_DETAILS = {
    "Aboubacar Camara": ("Forward", 9, 0, 0, 0, "/headshots/Aboubacar_Camara.jpg"),
    "Adam Armour": ("Defender", 3, 0, 0, 0, "/headshots/Adam_Armour.jpg"),
    "Brecc Evans": ("Defender", 22, 0, 0, 0, "/headshots/Brecc_Evans.jpg"),
    "Diogo Barbosa": ("Midfielder", 18, 0, 0, 0, "/headshots/Diogo_Barbosa.jpg"),
    "Emiliano Terzaghi": ("Forward", 32, 0, 0, 0, "/headshots/Emiliano_Terzaghi.jpg"),
    "Ernest Mensah Jr.": ("Defender", 27, 0, 0, 0, "/headshots/Ernest_MensahJr.jpg"),
    "Esteban Espinosa": ("Defender", 25, 0, 0, 0, "/headshots/Esteban_Espinosa.jpg"),
    "Hunter Morse": ("Goalkeeper", 1, 0, 0, 0, "/headshots/Hunter_Morse.jpg"),
    "Jaden Jones-Riley": ("Defender", 2, 0, 0, 0, "/headshots/Jaden_JonesRiley.jpg"),
    "JayTee Kamara": ("Midfielder", 11, 0, 0, 0, "/headshots/JayTee_Kamara.jpg"),
    "Kash Oladapo": ("Defender", 13, 0, 0, 0, "/headshots/Kash_Oladapo.jpg"),
    "Kemali Green": ("Defender", 16, 0, 0, 0, "/headshots/Kemali_Green.jpg"),
    "Khalid Hersi": ("Midfielder", 19, 0, 0, 0, "/headshots/Khalid_Hersi.jpg"),
    "Konstantinos Georgallides": ("Midfielder", 21, 0, 0, 0, "/headshots/Konstantinos_Georgallides.jpg"),
    "Lagos Kunga": ("Forward", 70, 0, 0, 0, "/headshots/Lagos_Kunga.jpg"),
    "Masashi Wada": ("Midfielder", 77, 0, 0, 0, "/headshots/Masashi_Wada.jpg"),
    "Matteo Kidd": ("Midfielder", 17, 0, 0, 0, "/headshots/Matteo_Kidd.jpg"),
    "Michel Poon-Angeron": ("Midfielder", 8, 0, 0, 0, "/headshots/Michel_Poon-Angeron.jpg"),
    "Mikey Lopez": ("Midfielder", 5, 0, 0, 0, "/headshots/Mikey_Lopez.jpg"),
    "Mo Mohamad": ("Defender", 6, 0, 0, 0, "/headshots/Mo_Mohamad.jpg"),
    "Ollie Wright": ("Midfielder", 10, 0, 0, 0, "/headshots/Ollie_Wright.jpg"),
    "Serigne Mbacke Faye": ("Defender", 44, 0, 0, 0, "/headshots/Serigne_MbackeFaye.jpg"),
    "Titus Washington": ("Forward", 14, 5, 4, 1662, "/headshots/Titus_Washington.jpg"),
    "Tyler Huck": ("Midfielder", 35, 0, 0, 0, "/headshots/Tyler_Huck.jpg"),
    "Walter Varela": ("Forward", 7, 2, 0, 1391, "/headshots/Walter_Varela.jpg"),
    "Zion Scarlett": ("Defender", 41, 1, 0, 1584, "/headshots/Zion_Scarlett.jpg"),
}

with open('final_tactical_data.json', 'r') as f:
    data = json.load(f)

# Remove old Portland players
data['players'] = [p for p in data['players'] if p['team_2026'] != "Portland Hearts of Pine"]

# Add new Portland players
for name, details in ROSTER_DETAILS.items():
    pos, jersey, goals, assists, minutes, img = details
    norm_name = name.lower().replace(" ", "_").replace(".", "").replace("-", "_")
    short_hash = generate_short_hash(name)
    player_id = f"portland_hearts_of_pine_{norm_name}_{short_hash}"
    
    decay = 0.45
    if pos == "Goalkeeper": decay = 0.08
    elif pos == "Defender": decay = 0.42
    elif pos == "Midfielder": decay = 0.55
    elif pos == "Forward": decay = 0.48
    
    player = {
        "player_id": player_id,
        "player_name": name,
        "team_2026": "Portland Hearts of Pine",
        "logistics_2026": {
            "jersey_number": jersey,
            "position": pos,
            "home_stadium_coords": [43.6644, -70.2523],
            "headshot_path": img
        },
        "history_2025": {
            "transfer_source_league": "USL League One"
        },
        "stats_2025": {
            "goals": goals,
            "assists": assists,
            "minutes": minutes,
            "appearances": 0,
            "match_minute_decay": decay
        },
        "environmental_modifiers": {
            "elevation_ft": 60,
            "altitude_penalty": 0.0,
            "humidity_penalty": 0.0,
            "stamina_multiplier": 1.0
        }
    }
    data['players'].append(player)

data['_meta']['total_players'] = len(data['players'])

with open('final_tactical_data.json', 'w') as f:
    json.dump(data, f, indent=4)

print(f"Successfully updated roster with {len(ROSTER_DETAILS)} Portland players.")
