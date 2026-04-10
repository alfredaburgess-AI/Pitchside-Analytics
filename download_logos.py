import os
import re
import shutil
import urllib.request
import ssl
from duckduckgo_search import DDGS

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
os.makedirs(output_dir, exist_ok=True)
placeholder_path = "USL_League_One_horz_logo.png"

def get_team_slug(raw_team_name):
    team_slug = raw_team_name.lower().replace(" ", "_").replace("-", "_")
    return re.sub(r"[^a-z0-9_]", "", team_slug)

missing = []

with DDGS() as ddgs:
    for team in teams:
        slug = get_team_slug(team)
        out_path = os.path.join(output_dir, f"{slug}.png")
        
        # We already downloaded these successfully in previous run
        if os.path.exists(out_path):
            print(f"Already exists: {team}")
            continue
            
        print(f"Searching for {team}...")
        query = f"{team} USL crest logo transparent high res png"
        try:
            results = list(ddgs.images(query, max_results=5))
            
            downloaded = False
            for res in results:
                image_url = res.get('image')
                if not image_url: continue
                
                try:
                    req_img = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_img, context=ctx, timeout=8) as img_response:
                        data = img_response.read()
                        if len(data) > 3000:
                            with open(out_path, 'wb') as f:
                                f.write(data)
                            print(f"-> Downloaded: {image_url}")
                            downloaded = True
                            break
                except Exception as e:
                    pass
                    # print(f"-> Failed {image_url}: {e}")
                    
            if not downloaded:
                print(f"-> Could not find valid image for {team}")
                missing.append(team)
                
        except Exception as e:
            print(f"-> Error searching for {team}: {e}")
            missing.append(team)

print("\n--- Summary ---")
print(f"Missing (Using Placeholder): {missing}")

for m in missing:
    slug = get_team_slug(m)
    out_path = os.path.join(output_dir, f"{slug}.png")
    if os.path.exists(placeholder_path):
        shutil.copy(placeholder_path, out_path)
        print(f"Copied placeholder for {m}")
    else:
        print(f"Warning: Placeholder {placeholder_path} NOT FOUND to copy for {m}")
