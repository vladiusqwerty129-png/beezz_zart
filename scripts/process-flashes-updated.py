#!/usr/bin/env python3
"""Convert Flashes updated/ JPGs to WebP in Website Images/."""

from __future__ import annotations

import json
import os
import re
from collections import defaultdict

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "Website Images", "Flashes updated")
OUT_DIR = os.path.join(ROOT, "Website Images")
REPORT = os.path.join(ROOT, "scripts", "flashes-updated-report.json")

MAX_SIDE = 800
QUALITY = 82


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def num_from_name(name: str) -> int:
    m = re.search(r"(\d+)", name)
    return int(m.group(1)) if m else 1


def to_webp(src_path: str, out_name: str) -> str:
    out_path = os.path.join(OUT_DIR, out_name)
    img = Image.open(src_path)
    w, h = img.size
    if max(w, h) > MAX_SIDE:
        scale = MAX_SIDE / max(w, h)
        img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.LANCZOS)
    rgb = img.convert("RGB")
    rgb.save(out_path, "WEBP", quality=QUALITY, method=6)
    return out_name


def classify(filename: str) -> dict:
    base = os.path.splitext(filename)[0]
    base = re.sub(r"\s+\d+$", "", base)  # "Nipples_Flash_1 1" -> "Nipples_Flash_1"
    base = base.rstrip("_")

    if "_Main_Flash" in base or base.endswith("_Flash_Main"):
        name = base.replace("_Flash_Main", "").replace("_Main_Flash", "")
        return {"kind": "main", "group": slug(name.replace("_", " "))}

    if "Placement_Idea" in base:
        m = re.match(r"(.+?)_(?:Flash_)?Placement_Idea_(\d+)", base)
        if m:
            return {"kind": "placement", "group": slug(m.group(1).replace("_", " ")), "num": int(m.group(2))}

    if base.startswith("Flow_") and base.endswith("_Flash"):
        return {"kind": "flow", "name": slug(base.replace("Flow_", "").replace("_Flash", ""))}

    zone_patterns = [
        (r"^Hand_Flash", ("arms", "hand", "Hand")),
        (r"^Palm_Flash", ("arms", "palm", "Palm")),
        (r"^Forearm_Flash", ("arms", "half-sleeve", "Half-Sleeve")),
        (r"^Shoulder_Flash", ("arms", "shoulder", "Shoulder")),
        (r"^Half_Sleeve_Flash", ("arms", "half-sleeve", "Half-Sleeve")),
        (r"^Sleeve_Flash", ("arms", "sleeve", "Arm-Sleeve")),
        (r"^Calf_Flash", ("legs", "calf", "Calf")),
        (r"^Feet_Flash", ("legs", "foot", "Foot")),
        (r"^Thigh_Flash", ("legs", "thigh", "Thigh")),
        (r"^Knee_Flash", ("legs", "knee", "Knee")),
        (r"^Full_Leg_Sleeve", ("legs", "sleeve", "Leg-Sleeve")),
        (r"^Butt_Flash", ("legs", "butt", "Butt")),
        (r"^Stomach_Flash", ("body-front", "stomach", "Stomach")),
        (r"^Chest_Flash", ("body-front", "chest", "Chest")),
        (r"^Nipples_Flash", ("body-front", "nipples", "Nipples")),
        (r"^Full_Front_Flash", ("body-front", "full-front", "Full-Front")),
        (r"^Lower_Back_Flash", ("back", "lower-back", "Lower-Back")),
        (r"^Back_Flash", ("back", "back", "Back")),
        (r"^Spine_Flash", ("back", "back", "Back")),
        (r"^Face_Flash", ("head", "face", "Face")),
        (r"^Ear_Flash", ("head", "ears", "Ear")),
        (r"^Neck_Flash", ("head", "neck", "Neck")),
    ]
    for pat, meta in zone_patterns:
        if re.match(pat, base):
            part, zone, label = meta
            return {"kind": "zone", "part": part, "zone": zone, "label": label, "num": num_from_name(base)}

    return {"kind": "unknown", "base": base}


def sort_key(filename: str) -> tuple:
    info = classify(filename)
    order = {"main": 0, "zone": 1, "flow": 1, "placement": 2}.get(info["kind"], 3)
    return (order, filename)


def main() -> None:
    files = sorted(
        (f for f in os.listdir(SRC_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png"))),
        key=sort_key,
    )
    report = {
        "processed": [],
        "skipped_duplicates": [],
        "unknown": [],
        "catalog": {"dark-abstract": defaultdict(lambda: defaultdict(list)), "smaller": {"main": [], "flow": []}},
    }

    seen_zone_keys: dict[tuple, int] = defaultdict(int)
    seen_groups: dict[str, dict] = {}

    for filename in files:
        info = classify(filename)
        src = os.path.join(SRC_DIR, filename)

        if info["kind"] == "zone":
            key = (info["part"], info["zone"], info["label"], info["num"])
            seen_zone_keys[key] += 1
            if seen_zone_keys[key] > 1:
                info["num"] = seen_zone_keys[(info["part"], info["zone"], info["label"], info["num"])] + info["num"] - 1
            out = f"Flashes-{info['label']}-{info['num']}.webp"
            to_webp(src, out)
            entry = {
                "src": f"Website Images/{out}",
                "alt": f"Dark abstract flash — {info['label'].lower().replace('-', ' ')} {info['num']}",
            }
            report["catalog"]["dark-abstract"][info["part"]][info["zone"]].append(entry)
            report["processed"].append({"file": filename, "out": out, **info})

        elif info["kind"] == "main":
            group = info["group"]
            out = f"Flashes-Smaller-{group.title().replace('-', '')}-Main.webp"
            to_webp(src, out)
            seen_groups[group] = {
                "id": group,
                "src": f"Website Images/{out}",
                "alt": f"Smaller flash — {group.replace('-', ' ')}",
                "placementIdeas": [],
            }
            report["processed"].append({"file": filename, "out": out, **info})

        elif info["kind"] == "placement":
            group = info["group"]
            if group not in seen_groups:
                report["unknown"].append({"file": filename, "reason": f"placement without main: {group}"})
                continue
            out = f"Flashes-Smaller-{group.title().replace('-', '')}-Placement-{info['num']}.webp"
            to_webp(src, out)
            idea = {
                "src": f"Website Images/{out}",
                "alt": f"Placement inspiration {info['num']} — {group.replace('-', ' ')}",
            }
            seen_groups[group]["placementIdeas"].append(idea)
            report["processed"].append({"file": filename, "out": out, **info})

        elif info["kind"] == "flow":
            out = f"Flashes-Smaller-Flow-{info['name'].title()}.webp"
            to_webp(src, out)
            report["catalog"]["smaller"]["flow"].append({
                "src": f"Website Images/{out}",
                "alt": f"Smaller flash — flow {info['name'].replace('-', ' ')}",
            })
            report["processed"].append({"file": filename, "out": out, **info})

        else:
            report["unknown"].append({"file": filename, **info})

    report["catalog"]["smaller"]["main"] = list(seen_groups.values())

    # sort zone entries by alt number
    for part in report["catalog"]["dark-abstract"]:
        for zone in report["catalog"]["dark-abstract"][part]:
            report["catalog"]["dark-abstract"][part][zone].sort(key=lambda x: x["alt"])

    with open(REPORT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=dict)

    print(f"Processed {len(report['processed'])} files")
    print(f"Unknown: {len(report['unknown'])}")
    if report["unknown"]:
        for u in report["unknown"]:
            print(" ", u)


if __name__ == "__main__":
    main()
