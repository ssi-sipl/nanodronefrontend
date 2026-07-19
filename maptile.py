import os
import math
import time
import requests

# ---------------- CONFIG ----------------
start_zoom = 15
end_zoom = 17   # safer (18 can be very heavy)

# YOUR LOCATION (Jodhpur)
center_lat = 26.277813
center_lon = 73.060143

# AREA AROUND POINT (adjust this if needed)
offset = 0.01   # ~1 km

start_latitude = center_lat + offset
start_longitude = center_lon + offset

end_latitude = center_lat - offset
end_longitude = center_lon - offset

# Output folder
folder = "./jodhpur_map"

# Tile server (ArcGIS Satellite)
url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

headers = {
    "User-Agent": "Mozilla/5.0"
}

# ---------------- FUNCTIONS ----------------
def get_x_tile(lon, zoom):
    return int((lon + 180) / 360 * (2 ** zoom))

def get_y_tile(lat, zoom):
    lat_rad = math.radians(lat)
    return int((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * (2 ** zoom))

# ---------------- MAIN ----------------
print("=== Tile Download Started ===\n")

downloaded = 0
failed = 0

for z in range(start_zoom, end_zoom + 1):

    z_folder = f"{folder}/{z}"
    os.makedirs(z_folder, exist_ok=True)

    start_x = get_x_tile(start_longitude, z)
    end_x = get_x_tile(end_longitude, z)
    start_y = get_y_tile(start_latitude, z)
    end_y = get_y_tile(end_latitude, z)

    print(f"\n--- Zoom {z} ---")

    for x in range(min(start_x, end_x), max(start_x, end_x) + 1):

        x_folder = f"{z_folder}/{x}"
        os.makedirs(x_folder, exist_ok=True)

        for y in range(min(start_y, end_y), max(start_y, end_y) + 1):

            file_path = f"{x_folder}/{y}.jpg"

            if os.path.exists(file_path):
                continue

            tile_url = url.replace("{z}", str(z)).replace("{x}", str(x)).replace("{y}", str(y))

            try:
                response = requests.get(tile_url, headers=headers, timeout=20)

                if response.status_code == 200:
                    with open(file_path, "wb") as f:
                        f.write(response.content)

                    downloaded += 1
                    print(".", end="", flush=True)
                else:
                    failed += 1
                    print("F", end="", flush=True)

            except Exception:
                failed += 1
                print("F", end="", flush=True)

            time.sleep(0.05)  # adjust speed if needed

print("\n\n=== DONE ===")
print("Downloaded:", downloaded)
print("Failed:", failed)