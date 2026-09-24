#!/usr/bin/env python3
"""Sync dark-abstract part/zone galleries from Website Images/Flashes/All Body parts Flashes/."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLASHES_ROOT = ROOT / "Website Images" / "Flashes"
PARTS_ROOT = FLASHES_ROOT / "All Body parts Flashes"
DATA_JS = ROOT / "flashes-data.js"
SNIPPET_JS = ROOT / "scripts" / "flashes-catalog-snippet.js"
REPORT_JSON = ROOT / "scripts" / "flashes-part-folders-report.json"

# partId -> folder name matcher (first matching subdir of PARTS_ROOT)
PART_FOLDER_MATCH = {
    "arms": lambda n: n.lower().startswith("all arm"),
    "legs": lambda n: "legs" in n.lower(),
    "body-front": lambda n: "body front" in n.lower(),
    "back": lambda n: "back" in n.lower() and "body" not in n.lower(),
    "head": lambda n: "head" in n.lower(),
}

PART_ALL_LABEL = {
    "arms": "All Arms",
    "legs": "All Legs",
    "body-front": "All Body Front",
    "back": "All Back",
    "head": "All Head",
}

# Optional: subfolder name (case-insensitive) -> zone id for each part
ZONE_FOLDER_ALIASES = {
    "arms": {
        "sleeve": ("sleeve",),
        "half-sleeve": ("half sleeve", "half-sleeve", "halfsleeve"),
        "shoulder": ("shoulder",),
        "hand": ("hand",),
        "palm": ("palm",),
    },
    "legs": {
        "calf": ("calf",),
        "foot": ("foot",),
        "thigh": ("thigh",),
        "knee": ("knee",),
        "sleeve": ("sleeve", "leg sleeve"),
        "butt": ("butt",),
    },
    "body-front": {
        "stomach": ("stomach",),
        "chest": ("chest",),
        "nipples": ("nipples",),
        "sternum": ("sternum",),
        "full-front": ("full front", "full-front", "fullfront"),
    },
    "back": {
        "back": ("back", "spine"),
        "lower-back": ("lower back", "lower-back", "lowerback"),
    },
    "head": {
        "neck": ("neck",),
        "ears": ("ear", "ears"),
        "face": ("face",),
    },
}


def num_sort_key(filename: str) -> tuple[int, str]:
    match = re.search(r"(\d+)", filename)
    num = int(match.group(1)) if match else 10**9
    return (num, filename.lower())


def list_webps(folder: Path) -> list[str]:
    if not folder.is_dir():
        return []
    files = [f.name for f in folder.iterdir() if f.suffix.lower() == ".webp"]
    files.sort(key=num_sort_key)
    return files


def rel_path(folder: Path, filename: str) -> str:
    full = folder / filename
    rel = full.relative_to(ROOT).as_posix()
    return rel


def js_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def flash_entry(src: str, alt: str) -> str:
    return f"{{ src: {js_str(src)}, alt: {js_str(alt)} }}"


def js_array(entries: list[str]) -> str:
    if not entries:
        return "[]"
    inner = ",\n        ".join(entries)
    return f"[\n        {inner},\n      ]"


def match_zone_id(part_id: str, folder_name: str) -> str | None:
    key = folder_name.lower().strip()
    aliases = ZONE_FOLDER_ALIASES.get(part_id, {})
    for zone_id, names in aliases.items():
        for name in names:
            if key == name or name in key:
                return zone_id
    return None


def find_part_folder(part_id: str) -> Path | None:
    if not PARTS_ROOT.is_dir():
        return None
    matcher = PART_FOLDER_MATCH[part_id]
    for name in sorted(os.listdir(PARTS_ROOT)):
        path = PARTS_ROOT / name
        if path.is_dir() and matcher(name):
            return path
    return None


def build_part_galleries() -> tuple[dict, dict]:
    """Returns (catalog_zones per part, preview src per part for All zone card)."""
    catalog: dict[str, dict[str, list[dict[str, str]]]] = {}
    previews: dict[str, str] = {}
    report: dict = {"parts": {}}

    for part_id in PART_FOLDER_MATCH:
        part_folder = find_part_folder(part_id)
        part_report: dict = {"folder": part_folder.name if part_folder else None, "zones": {}}
        zones: dict[str, list[dict[str, str]]] = {}

        if part_folder:
            # Aggregate "all" gallery: numbered files in the part folder root
            root_files = list_webps(part_folder)
            if root_files:
                label = PART_ALL_LABEL[part_id]
                zones["all"] = [
                    {
                        "src": rel_path(part_folder, fn),
                        "alt": f"Dark abstract flash — {label.lower()} {i}",
                    }
                    for i, fn in enumerate(root_files, 1)
                ]
                previews[part_id] = zones["all"][0]["src"]
                part_report["zones"]["all"] = len(root_files)

            # Zone subfolders (when you add Sleeve, Half Sleeve, etc.)
            for sub_name in sorted(os.listdir(part_folder)):
                sub_path = part_folder / sub_name
                if not sub_path.is_dir():
                    continue
                zone_id = match_zone_id(part_id, sub_name)
                if not zone_id:
                    part_report.setdefault("skipped_subdirs", []).append(sub_name)
                    continue
                files = list_webps(sub_path)
                if not files:
                    continue
                zones[zone_id] = [
                    {
                        "src": rel_path(sub_path, fn),
                        "alt": f"Dark abstract flash — {zone_id.replace('-', ' ')} {i}",
                    }
                    for i, fn in enumerate(files, 1)
                ]
                part_report["zones"][zone_id] = len(files)

        catalog[part_id] = zones
        report["parts"][part_id] = part_report

    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return catalog, previews


def zone_order(part_id: str, zones: dict[str, list[dict[str, str]]]) -> list[str]:
    order_map = {
        "arms": ["all", "sleeve", "half-sleeve", "shoulder", "hand", "palm"],
        "legs": ["all", "calf", "foot", "thigh", "knee", "sleeve", "butt"],
        "body-front": ["all", "stomach", "chest", "nipples", "sternum", "full-front"],
        "back": ["all", "back", "lower-back"],
        "head": ["all", "neck", "ears", "face"],
    }
    preferred = order_map.get(part_id, [])
    keys = [k for k in preferred if k in zones]
    keys.extend(sorted(k for k in zones if k not in keys))
    return keys


def render_zone_catalog_block(part_id: str, zones: dict[str, list[dict[str, str]]]) -> str:
    lines = [f'    "{part_id}": {{']
    keys = zone_order(part_id, zones)
    for zone_id in keys:
        entries = zones.get(zone_id, [])
        js_entries = [flash_entry(e["src"], e["alt"]) for e in entries]
        lines.append(f'      "{zone_id}": {js_array(js_entries)},')
    lines.append("    },")
    return "\n".join(lines)


def patch_catalog_in_js(catalog: dict[str, dict[str, list[dict[str, str]]]]) -> None:
    text = DATA_JS.read_text(encoding="utf-8")
    start = text.find("  'dark-abstract': {")
    if start < 0:
        raise SystemExit("Could not find dark-abstract catalog in flashes-data.js")
    # Replace each part block inside dark-abstract only (arms through head)
    for part_id, zones in catalog.items():
        marker = f'    "{part_id}": {{'
        idx = text.find(marker, start)
        if idx < 0:
            raise SystemExit(f"Missing catalog part block: {part_id}")
        depth = 0
        end = idx
        for i in range(idx, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    if text[end : end + 1] == ",":
                        end += 1
                    break
        # Merge: keep existing zone keys not overridden by folder scan (folder wins when non-empty)
        existing = {}
        old_block = text[idx:end]
        for zone_id in re.findall(r'"([a-z-]+)"\s*:\s*\[', old_block):
            existing[zone_id] = True
        merged = dict(zones)
        for zone_id in existing:
            if zone_id not in merged or not merged[zone_id]:
                # preserve catalog zone from file if no folder data
                m = re.search(
                    rf'"{re.escape(zone_id)}"\s*:\s*(\[[\s\S]*?\]),',
                    old_block,
                )
                if m and zone_id not in zones:
                    pass  # keep old block via not replacing whole part - we replace whole part below

        new_block = render_zone_catalog_block(part_id, merge_with_existing_block(old_block, zones))
        text = text[:idx] + new_block + text[end:]

    DATA_JS.write_text(text, encoding="utf-8")


def merge_with_existing_block(
    old_block: str, folder_zones: dict[str, list[dict[str, str]]]
) -> dict[str, list[dict[str, str]]]:
    """Folder data overrides; keep legacy catalog zones when folder has no data for that zone."""
    merged: dict[str, list[dict[str, str]]] = {}
    for zone_id in re.findall(r'"([a-z-]+)"\s*:\s*\[', old_block):
        if zone_id in folder_zones and folder_zones[zone_id]:
            merged[zone_id] = folder_zones[zone_id]
        else:
            # parse minimal - leave old block segment by re-read from regex
            m = re.search(
                rf'"{re.escape(zone_id)}"\s*:\s*(\[[\s\S]*?\]),',
                old_block,
            )
            if not m:
                continue
            arr_text = m.group(1)
            entries = []
            for src_m, alt_m in zip(
                re.finditer(r'src:\s*"([^"]+)"', arr_text),
                re.finditer(r'alt:\s*"([^"]+)"', arr_text),
            ):
                entries.append({"src": src_m.group(1), "alt": alt_m.group(1)})
            if entries:
                merged[zone_id] = entries
    for zone_id, items in folder_zones.items():
        if items and zone_id not in merged:
            merged[zone_id] = items
    return merged


def patch_zone_previews(previews: dict[str, str]) -> None:
    zone_arrays = {
        "arms": "ARM_ZONES",
        "legs": "LEG_ZONES",
        "body-front": "BODY_FRONT_ZONES",
        "back": "BACK_ZONES",
        "head": "HEAD_ZONES",
    }
    text = DATA_JS.read_text(encoding="utf-8")
    for part_id, var in zone_arrays.items():
        preview = previews.get(part_id)
        if not preview:
            continue
        label = PART_ALL_LABEL[part_id]
        entry = (
            f"  {{ id: 'all', label: {js_str(label)}, "
            f"preview: {js_str(preview)} }},\n"
        )
        pattern = rf"window\.{var} = \["
        m = re.search(pattern, text)
        if not m:
            raise SystemExit(f"Missing {var}")
        insert_at = m.end()
        segment = text[m.start() : insert_at + 200]
        if "id: 'all'" in segment.split("];", 1)[0]:
            # replace existing all entry preview/label
            text = re.sub(
                rf"(window\.{var} = \[\s*)\{{ id: 'all'[^]]+?\}},\s*",
                rf"\1{entry}",
                text,
                count=1,
            )
        else:
            text = text[:insert_at] + "\n" + entry + text[insert_at:]
    text = re.sub(
        r"window\.FLASHES_IMG_V = '\d+';",
        "window.FLASHES_IMG_V = '122';",
        text,
        count=1,
    )
    DATA_JS.write_text(text, encoding="utf-8")


def bump_html_cache() -> None:
    for path in ROOT.rglob("*.html"):
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        new_text = re.sub(
            r"flashes-data\.js\?v=\d+",
            "flashes-data.js?v=123",
            text,
        )
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")


def main() -> None:
    catalog, previews = build_part_galleries()
    patch_catalog_in_js(catalog)
    patch_zone_previews(previews)
    bump_html_cache()
    print(f"Updated {DATA_JS.name}; report -> {REPORT_JSON.name}")


if __name__ == "__main__":
    main()
