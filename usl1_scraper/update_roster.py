import json

with open('final_tactical_data.json') as f:
    data = json.load(f)

roster = {
    'Hunter Morse': (1, 'Goalkeeper'),
    'Jaden Jones-Riley': (2, 'Defender'),
    'Nathan Messer': (3, 'Defender'),
    'Adam Armour': (3, 'Defender'),
    'Mo Mohamed': (6, 'Defender'),
    'Sean Vinberg': (7, 'Defender'),
    'Shandon Wright': (19, 'Defender'),
    'Colby Quiñones': (21, 'Defender'),
    'Brecc Evans': (22, 'Defender'),
    'Esteban Espinosa': (25, 'Defender'),
    'Ernest Mensah Jr.': (27, 'Defender'),
    'Zion Scarlett': (41, 'Defender'),
    'Serigne Mbacke Faye': (44, 'Defender'),
    'Séga Coulibaly': (45, 'Defender'),

    'Mikey Lopez': (5, 'Midfielder'),
    'Pat Langlois': (6, 'Midfielder'),
    'Michel Poon-Angeron': (8, 'Midfielder'),
    'Ollie Wright': (10, 'Midfielder'),
    'Jay Tee Kamara': (11, 'Midfielder'),
    'Mickey Reilly': (17, 'Midfielder'),
    'Diogo Barbosa': (18, 'Midfielder'),
    'Khalid Hersi': (19, 'Midfielder'),
    'Konstantinos Georgallides': (21, 'Midfielder'),
    'Tyler Huck': (35, 'Midfielder'),
    'Nathaniel James': (47, 'Midfielder'),
    'Masashi Wada': (77, 'Midfielder'),

    'Walter Varela': (7, 'Forward'),
    'Azaad Liadi': (9, 'Forward'),
    'Aboubacar Camara': (9, 'Forward'),
    'Evan Southern': (11, 'Forward'),
    'Jake Keegan': (12, 'Forward'),
    'Titus Washington': (14, 'Forward'),
    'Emiliano Terzaghi': (32, 'Forward'),
    'Lagos Kunga': (70, 'Forward'),
}

for p in data['players']:
    if p['team_2026'] == 'Portland Hearts of Pine':
        name = p['player_name']
        match = None
        for k in roster.keys():
            if k.replace('.','') == name.replace('.',''):
                match = roster[k]
                break
        
        if match:
            p['logistics_2026']['jersey_number'] = match[0]
            p['logistics_2026']['position'] = match[1]
        
    # Update ALL headshots to .jpg globally just to be safe
    old_path = p['logistics_2026']['headshot_path']
    if old_path and old_path.endswith('.png'):
        p['logistics_2026']['headshot_path'] = old_path.replace('.png', '.jpg')

with open('final_tactical_data.json', 'w') as f:
    json.dump(data, f, indent=4)
