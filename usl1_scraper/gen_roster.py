import pandas as pd
import json

df = pd.read_csv('PHOP_Master_Database.csv', encoding='latin-1')
roster = []
for _, row in df.iterrows():
    roster.append({
        'name': row['Player Name'],
        'pos': row['Pos'],
        'threat': row['Threat_Score_0_100'] if not pd.isna(row['Threat_Score_0_100']) else 0,
        'minutes': row['Minutes Played'] if not pd.isna(row['Minutes Played']) else 0,
        'goals': row['Goals'] if not pd.isna(row['Goals']) else 0,
        'assists': row['Assists'] if not pd.isna(row['Assists']) else 0,
        'decay': 0.45 # default
    })

# Map positions to names and decay
POS_MAP = {
    'GK': ('Goalkeeper', 0.08),
    'DF': ('Defender', 0.42),
    'MF': ('Midfielder', 0.55),
    'FW': ('Forward', 0.48),
    'MF,FW': ('Midfielder', 0.55),
    'FW,MF': ('Forward', 0.48),
    'DF,MF': ('Defender', 0.42),
}

for r in roster:
    long_pos, decay = POS_MAP.get(r['pos'], ('Midfielder', 0.55))
    r['long_pos'] = long_pos
    r['decay'] = decay

print(json.dumps(roster, indent=2))
