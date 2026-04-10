import json
import csv

json_path = 'dashboard/src/data/final_tactical_data.json'
csv_path = 'usl1_scraper/Players_export.csv'

with open(json_path, 'r') as f:
    data = json.load(f)

csv_players = {}
with open(csv_path, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        csv_players[row['player_name']] = {
            'match_minute_decay': float(row['match_minute_decay']) if row['match_minute_decay'] else 0.010,
            'threat_score_0_100': float(row['threat_score_0_100']) if row['threat_score_0_100'] else 0.0,
            'chances_created_per90': float(row['chances_created_per90']) if row['chances_created_per90'] else 0.0
        }

for player in data['players']:
    name = player['player_name']
    if 'baseline_performance' not in player:
        player['baseline_performance'] = {}
    
    if name in csv_players:
        player['baseline_performance']['match_minute_decay'] = csv_players[name]['match_minute_decay']
        player['baseline_performance']['threat_score_0_100'] = csv_players[name]['threat_score_0_100']
        player['baseline_performance']['chances_created_per90'] = csv_players[name]['chances_created_per90']
    else:
        player['baseline_performance']['match_minute_decay'] = 0.010
        player['baseline_performance']['threat_score_0_100'] = 0.0
        player['baseline_performance']['chances_created_per90'] = 0.0

with open(json_path, 'w') as f:
    json.dump(data, f, indent=4)

print("Merge complete")
