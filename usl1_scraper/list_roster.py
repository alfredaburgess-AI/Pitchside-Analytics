import csv

results = []
with open('PHOP_Master_Database.csv', mode='r', encoding='latin-1') as f:
    reader = csv.DictReader(f)
    for row in reader:
        results.append({
            'name': row['Player Name'],
            'pos': row['POS'],
            'threat': row.get('Threat_Score_0_100', 0),
            'minutes': row.get('Min', 0)
        })

for r in results:
    print(f"{r['name']} | {r['pos']} | {r['threat']} | {r['minutes']}")
