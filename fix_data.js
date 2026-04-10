const fs = require('fs');

const dataPath = 'src/data/final_tactical_data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const updates = {
  "Hunter Morse": { num: 1, pos: "Goalkeeper", team: "Portland Hearts of Pine" },
  "Kashope Oladapo": { num: 23, pos: "Goalkeeper", team: "Portland Hearts of Pine" },
  "Jaden Jerome Jones-Riley": { num: 2, pos: "Defender", team: "Portland Hearts of Pine" },
  "Jaden Jones-Riley": { num: 2, pos: "Defender", team: "Portland Hearts of Pine" },
  "Adam Armour": { num: 3, pos: "Defender", team: "Portland Hearts of Pine" },
  "Brecc Evans": { num: 22, pos: "Defender", team: "Portland Hearts of Pine" },
  "Zion Scarlett": { num: 41, pos: "Defender", team: "Portland Hearts of Pine" },
  "Serigne Mbacké Faye": { num: 44, pos: "Defender", team: "Portland Hearts of Pine" },
  "Serigne Cheikh Mbacké Faye": { num: 44, pos: "Defender", team: "Portland Hearts of Pine" },
  "Kemali Green": { num: 66, pos: "Defender", team: "Portland Hearts of Pine" },
  "Mikey Lopez": { num: 5, pos: "Midfielder", team: "Portland Hearts of Pine" },
  "Michel Poon-Angeron": { num: 8, pos: "Midfielder", team: "Portland Hearts of Pine" },
  "Diogo Barbosa": { num: 18, pos: "Midfielder", team: "Portland Hearts of Pine" },
  "Masashi Wada": { num: 77, pos: "Midfielder", team: "Portland Hearts of Pine" },
  "Matteo Kidd": { num: 98, pos: "Midfielder", team: "Portland Hearts of Pine" },
  "Emiliano Terzaghi": { num: 32, pos: "Forward", team: "Portland Hearts of Pine" },
  "Emiliano Franco Terzaghi": { num: 32, pos: "Forward", team: "Portland Hearts of Pine" },
  "Jay Tee Kamara": { num: 11, pos: "Forward", team: "Portland Hearts of Pine" }
};

data.players.forEach(p => {
  // Update image mapping to be consistent with what user expects
  const formattedName = p.player_name.replace(/\s+/g, '_');
  p.logistics_2026.headshot_path = `/headshots/${formattedName}.png`;

  // Restore jersey numbers and positions
  const updateInfo = updates[p.player_name];
  if (updateInfo) {
    p.logistics_2026.jersey_number = updateInfo.num;
    p.logistics_2026.position = updateInfo.pos;
    p.team_2026 = updateInfo.team; // Ensure they are on Portland Hearts of Pine
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log('JSON updated!');
