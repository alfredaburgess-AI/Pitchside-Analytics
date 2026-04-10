import os
import re
import shutil
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

teams = [
    "AV Alta FC", "Athletic Club Boise", "Charlotte Independence", 
    "Chattanooga Red Wolves SC", "Corpus Christi FC", "FC Naples", 
    "Fort Wayne FC", "Forward Madison FC", "Greenville Triumph SC", 
    "New York Cosmos", "One Knoxville SC", "Richmond Kickers", 
    "Sarasota Paradise", "Spokane Velocity FC", "Union Omaha", 
    "Westchester SC"
]

output_dir = "public/logos/opponents"

def get_team_slug(raw_team_name):
    team_slug = raw_team_name.lower().replace(" ", "_").replace("-", "_")
    return re.sub(r"[^a-z0-9_]", "", team_slug)

known_urls = {
    "AV Alta FC": "https://seatgeekimages.com/logos/1em2k4jb7/1956044/primary/dark_background/512x512.png",
    "Athletic Club Boise": "https://images.seeklogo.com/logo-png/63/1/athletic-club-boise-logo-png_seeklogo-630092.png",
    "Charlotte Independence": "https://content.sportslogos.net/logos/124/5643/full/9755_charlotte_independence-primary-2015.png",
    "Chattanooga Red Wolves SC": "https://www.oursportscentral.com/graphics/teams/usl1_chattanooga_redwolvessc19.png",
    "Corpus Christi FC": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Corpus_Christi_FC_Logo.png/220px-Corpus_Christi_FC_Logo.png",
    "FC Naples": "https://upload.wikimedia.org/wikipedia/commons/5/5d/FC_Naples.png",
    "Spokane Velocity FC": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Spokane_Velocity_FC_logo_blue-black.png"
}

missing = []

for team in teams:
    slug = get_team_slug(team)
    out_path = os.path.join(output_dir, f"{slug}.png")
    
    # Remove existing to be clean
    if os.path.exists(out_path):
        os.remove(out_path)
    
    # Also clean up weird downloaded dupes if checking blindly
    for f in os.listdir(output_dir):
        if f.startswith(slug) and f != f"{slug}.png":
            os.remove(os.path.join(output_dir, f))

    if team in known_urls:
        url = known_urls[team]
        try:
            req_img = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_img, context=ctx, timeout=5) as img_response:
                data = img_response.read()
                with open(out_path, 'wb') as f:
                    f.write(data)
        except Exception as e:
            print(f"Failed known URL for {team}: {e}")
            missing.append(team)
    else:
        missing.append(team)

placeholder_path = "USL_League_One_horz_logo.png"

for m in missing:
    slug = get_team_slug(m)
    out_path = os.path.join(output_dir, f"{slug}.png")
    if os.path.exists(placeholder_path):
        shutil.copy(placeholder_path, out_path)
    else:
        print(f"ERROR: {placeholder_path} NOT FOUND")

print("--- Final Report ---")
print(f"Total processed: {len(teams)}")
print(f"Successfully downloaded high-res: {len(teams) - len(missing)}")
print(f"Missing (Used Placeholder): {missing}")
