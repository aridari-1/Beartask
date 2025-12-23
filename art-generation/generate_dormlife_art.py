import requests
import base64
import os
import json
from tqdm import tqdm

API_URL = "http://127.0.0.1:7860/sdapi/v1/txt2img"

VOLUME = "Vol1"
TOTAL_IMAGES = 500
OUTPUT_DIR = f"DormLife_{VOLUME}"

THEMES = [
    ("Late Night Study", "cozy college dorm room at night, student studying under desk lamp, laptop, notebooks, warm lighting, realistic, emotional"),
    ("Dorm Hangout", "college students hanging out in dorm room, laughing, snacks, string lights, warm friendly atmosphere"),
    ("Homesickness", "college student alone in dorm bed holding family photo, emotional, soft lamp light"),
    ("Rainy Dorm Day", "rain on dorm window, student inside reading, cozy mood, lo-fi aesthetic"),
    ("Creative Escape", "college student painting or playing guitar in dorm room, expressive, inspiring")
]

os.makedirs(f"{OUTPUT_DIR}/images", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/metadata", exist_ok=True)

for i in tqdm(range(TOTAL_IMAGES)):
    theme, prompt = THEMES[i % len(THEMES)]
    idx = f"{i+1:03d}"

    payload = {
        "prompt": f"{prompt}, diverse students, high quality digital art",
        "negative_prompt": "text, watermark, logo, blurry, low quality",
        "steps": 28,
        "cfg_scale": 7,
        "width": 768,
        "height": 768
    }

    response = requests.post(API_URL, json=payload).json()
    image_data = base64.b64decode(response["images"][0])

    img_path = f"{OUTPUT_DIR}/images/DormLife_{VOLUME}_{idx}.png"
    with open(img_path, "wb") as f:
        f.write(image_data)

    metadata = {
        "name": f"Dorm Life {VOLUME} #{idx}",
        "theme": theme,
        "collection": f"Dorm Life {VOLUME}",
        "created_by": "BearTask Studio"
    }

    with open(f"{OUTPUT_DIR}/metadata/DormLife_{VOLUME}_{idx}.json", "w") as f:
        json.dump(metadata, f, indent=2)
