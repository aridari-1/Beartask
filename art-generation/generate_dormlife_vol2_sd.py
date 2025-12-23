import requests
import base64
import os
import json
import random
from tqdm import tqdm

# Stable Diffusion API
API_URL = "http://127.0.0.1:7860/sdapi/v1/txt2img"

# Collection config
VOLUME = "Vol2"
TOTAL_IMAGES = 500

OUTPUT_DIR = f"DormLife_{VOLUME}"
os.makedirs(f"{OUTPUT_DIR}/images", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/metadata", exist_ok=True)

# ----------------------------
# RARITY LOGIC
# ----------------------------
def assign_rarity():
    r = random.random()
    if r < 0.70:
        return "Common", 1
    elif r < 0.95:
        return "Rare", 3
    else:
        return "Legendary", 10

# ----------------------------
# THEMES (VOL. 2 – EMOTIONAL)
# ----------------------------
THEMES = [
    ("Burnout", "college student alone in dorm room at night, exhausted expression, laptop glow lighting face, emotional burnout, cinematic lighting"),
    ("Loneliness", "lonely college student sitting on dorm bed holding phone, soft lamp light, emotional, homesick"),
    ("Identity", "college student standing in dorm room looking into mirror, self reflection, emotional realism"),
    ("Quiet Victory", "college student relieved after studying, morning sunlight through dorm window, peaceful emotional moment"),
    ("Anxiety", "anxious college student preparing for exam in dorm room, tense posture, cinematic lighting"),
    ("Creative Escape", "college student writing or playing music in dorm room at night, emotional, calm atmosphere")
]

# ----------------------------
# GENERATION LOOP
# ----------------------------
for i in tqdm(range(TOTAL_IMAGES)):
    theme, base_prompt = THEMES[i % len(THEMES)]
    idx = f"{i + 1:03d}"

    rarity, tickets = assign_rarity()

    prompt = (
        f"{base_prompt}, high quality digital art, realistic, cinematic lighting, "
        f"deep emotion, dorm life photography style"
    )

    payload = {
        "prompt": prompt,
        "negative_prompt": "text, watermark, logo, blurry, distorted, low quality",
        "steps": 28,
        "cfg_scale": 7,
        "width": 768,
        "height": 768
    }

    response = requests.post(API_URL, json=payload)
    response.raise_for_status()

    image_base64 = response.json()["images"][0]
    image_bytes = base64.b64decode(image_base64)

    image_path = f"{OUTPUT_DIR}/images/DormLife_{VOLUME}_{idx}.png"
    with open(image_path, "wb") as img_file:
        img_file.write(image_bytes)

    metadata = {
        "name": f"Dorm Life {VOLUME} #{idx}",
        "collection": f"Dorm Life {VOLUME}",
        "theme": theme,
        "rarity": rarity,
        "lottery_tickets": tickets,
        "creator": "BearTask Studio",
        "description": "An emotional moment from college dorm life, capturing the unseen side of student experiences."
    }

    metadata_path = f"{OUTPUT_DIR}/metadata/DormLife_{VOLUME}_{idx}.json"
    with open(metadata_path, "w") as meta_file:
        json.dump(metadata, meta_file, indent=2)

print("Dorm Life Vol. 2 generation completed.")
