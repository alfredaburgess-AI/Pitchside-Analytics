const fs = require('fs');

const dataPath = 'src/data/final_tactical_data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const nameMap = {
  "Hunter Morse": "Hunter_Morse.png",
  "Kashope Oladapo": "Kash_Oladapo.png",
  "Jaden Jerome Jones-Riley": "Jaden_JonesRiley.png",
  "Jaden Jones-Riley": "Jaden_JonesRiley.png",
  "Adam Armour": "Adam_Armour.png",
  "Brecc Evans": "Brecc_Evans.png",
  "Zion Scarlett": "Zion_Scarlett.png",
  "Serigne Cheikh Mbacké Faye": "Serigne_MbackeFaye.png",
  "Serigne Mbacké Faye": "Serigne_MbackeFaye.png",
  "Kemali Green": "Kemali_Green.png",
  "Mikey Lopez": "Mikey_Lopez.png",
  "Michel Poon-Angeron": "Michel_Poon-Angeron.png",
  "Diogo Barbosa": "Diogo_Barbosa.png",
  "Masashi Wada": "Masashi_Wada.png",
  "Matteo Kidd": "Matteo_Kidd.png",
  "Emiliano Franco Terzaghi": "Emiliano_Terzaghi.png",
  "Emiliano Terzaghi": "Emiliano_Terzaghi.png",
  "Jay Tee Kamara": "JayTee_Kamara.png"
};

data.players.forEach(p => {
  if (nameMap[p.player_name]) {
    p.logistics_2026.headshot_path = `/headshots/${nameMap[p.player_name]}`;
  } else {
      // General fallback to First_Last.png
      const formattedName = p.player_name.replace(/\s+/g, '_');
      p.logistics_2026.headshot_path = `/headshots/${formattedName}.png`;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log('JSON headshots updated!');
