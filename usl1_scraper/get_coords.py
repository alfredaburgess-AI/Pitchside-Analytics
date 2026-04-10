import json
import time
from geopy.geocoders import Nominatim
import ssl
import urllib.request
import os

# Create an unverified SSL context, just in case
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

teams_stadiums = {
    "AV Alta FC": "Lancaster Municipal Stadium, Lancaster, CA",
    "Athletic Club Boise": "The Stadium at Expo Idaho, Garden City, ID",
    "Charlotte Independence": "American Legion Memorial Stadium, Charlotte, NC",
    "Chattanooga Red Wolves SC": "CHI Memorial Stadium, East Ridge, TN",
    "Corpus Christi FC": "Corpus Christi FC Stadium, Corpus Christi, TX",
    "FC Naples": "Paradise Coast Sports Complex, Naples, FL",
    "Fort Wayne FC": "Bishop John D'Arcy Stadium, Fort Wayne, IN",
    "Forward Madison FC": "Breese Stevens Field, Madison, WI",
    "Greenville Triumph SC": "Paladin Stadium, Greenville, SC",
    "New York Cosmos": "Mitchel Athletic Complex, Uniondale, NY",
    "One Knoxville SC": "Regal Soccer Stadium, Knoxville, TN",
    "Portland Hearts of Pine": "Fitzpatrick Stadium, Portland, ME",
    "Richmond Kickers": "City Stadium, Richmond, VA",
    "Sarasota Paradise": "Sarasota High School Stadium, Sarasota, FL",
    "Spokane Velocity FC": "ONE Spokane Stadium, Spokane, WA",
    "Union Omaha": "Werner Park, Papillion, NE",
    "Westchester SC": "Mount Vernon Memorial Stadium, Mount Vernon, NY"
}

geolocator = Nominatim(user_agent="usl1_scraper_agent", ssl_context=ctx)
stadium_coords = {}

print("Geocoding stadiums...")
for team, address in teams_stadiums.items():
    try:
        # Give some sleep to avoid hitting Nominatim too hard
        time.sleep(1.5)
        # Try finding by full address
        location = geolocator.geocode(address)
        if location:
            stadium_coords[team] = {
                "stadium": address.split(',')[0],
                "lat": round(location.latitude, 5),
                "lon": round(location.longitude, 5)
            }
            print(f"Found: {team} -> {location.latitude}, {location.longitude}")
        else:
            # Fallback to city
            city_str = address.split(',')[1].strip() + ", " + address.split(',')[2].strip() if len(address.split(',')) > 2 else address
            print(f"Could not find exact stadium for {team}, trying city: {city_str}")
            location = geolocator.geocode(city_str)
            if location:
                 stadium_coords[team] = {
                    "stadium": address.split(',')[0],
                    "lat": round(location.latitude, 5),
                    "lon": round(location.longitude, 5)
                }
            else:
                stadium_coords[team] = {
                    "stadium": address.split(',')[0],
                    "lat": 0.0,
                    "lon": 0.0
                }
    except Exception as e:
        print(f"Error geocoding {team}: {e}")
        stadium_coords[team] = {
                "stadium": address.split(',')[0],
                "lat": 0.0,
                "lon": 0.0
        }

# Generate config.py
config_content = "STADIUM_COORDS = " + json.dumps(stadium_coords, indent=4) + "\n"

with open("config.py", "w") as f:
    f.write(config_content)
print("config.py generated successfully.")
