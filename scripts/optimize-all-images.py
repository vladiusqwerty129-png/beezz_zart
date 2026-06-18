#!/usr/bin/env python3
"""Second pass: convert all large photos in Website Images/ to WebP."""

from __future__ import annotations

import json
import os
import re
import shutil
from dataclasses import dataclass
from typing import Callable

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "Website Images")
BACKUP_DIR = os.path.join(IMG_DIR, "_originals")
REPORT_PATH = os.path.join(ROOT, "scripts", "optimize-all-report.json")

SKIP_NAMES = {"logo.png"}
SKIP_PREFIXES = ("icon-",)
MIN_KB = 40
RASTER_EXT = {".png", ".jpg", ".jpeg"}

DIAGRAM_PREFIXES = ("Arm-", "Body-", "Back-", "Front-", "Head-", "Leg-")
HERO_NAMES = {
    "Hero.png",
    "Flashes-Picker-Hero.png",
    "Contact.png",
    "FAQ.png",
}
AVATAR_PREFIX = "Happy-Customers-"


@dataclass
class Profile:
    name: str
    max_side: int
    max_kb: float
    fit: str = "inside"


def kb(num_bytes: int | float) -> float:
    return round(num_bytes / 1024, 1)


def folder_raster_bytes(include_webp: bool) -> int:
    total = 0
    for name in os.listdir(IMG_DIR):
        path = os.path.join(IMG_DIR, name)
        if not os.path.isfile(path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext in RASTER_EXT or (include_webp and ext == ".webp"):
            total += os.path.getsize(path)
    return total


def should_skip(name: str, size_bytes: int) -> bool:
    if name in SKIP_NAMES or name.startswith(SKIP_PREFIXES):
        return True
    if os.path.splitext(name)[1].lower() not in RASTER_EXT:
        return True
    return size_bytes / 1024 < MIN_KB


def classify(name: str) -> Profile:
    if name.startswith(AVATAR_PREFIX):
        return Profile("avatar", 150, 20)
    if name in HERO_NAMES:
        return Profile("hero", 1600, 250)
    base = name
    if any(base.startswith(p) for p in DIAGRAM_PREFIXES):
        return Profile("diagram", 480, 60)
    return Profile("photo", 800, 120)


def ensure_backup(src: str, name: str) -> None:
    os.makedirs(BACKUP_DIR, exist_ok=True)
    dest = os.path.join(BACKUP_DIR, name)
    if not os.path.exists(dest):
        shutil.copy2(src, dest)


def resize_image(img: Image.Image, max_side: int, fit: str, profile_name: str) -> Image.Image:
    if profile_name == "avatar":
        w, h = img.size
        scale = max(max_side / w, max_side / h)
        resized = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.LANCZOS)
        left = (resized.width - max_side) // 2
        top = (resized.height - max_side) // 2
        return resized.crop((left, top, left + max_side, top + max_side))
    w, h = img.size
    if fit == "inside":
        if max(w, h) <= max_side:
            return img.copy()
        scale = max_side / max(w, h)
        return img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.LANCZOS)
    return img.copy()


def save_webp(img: Image.Image, out_path: str, quality: int) -> int:
    if img.mode not in ("RGB", "RGBA"):
        rgb = img.convert("RGBA" if "A" in img.getbands() else "RGB")
    else:
        rgb = img
    if rgb.mode == "RGBA":
        bg = Image.new("RGB", rgb.size, (255, 255, 255))
        bg.paste(rgb, mask=rgb.split()[3])
        rgb = bg
    else:
        rgb = rgb.convert("RGB")
    rgb.save(out_path, "WEBP", quality=quality, method=6)
    return os.path.getsize(out_path)


def convert_file(name: str) -> dict:
    src = os.path.join(IMG_DIR, name)
    stem, _ = os.path.splitext(name)
    out_name = stem + ".webp"
    out_path = os.path.join(IMG_DIR, out_name)
    profile = classify(name)
    original_bytes = os.path.getsize(src)
    ensure_backup(src, name)

    with Image.open(src) as im:
        im.load()
        working = resize_image(im, profile.max_side, profile.fit, profile.name)

    quality = 82
    scale = 1.0
    last_size = 0
    last_w, last_h = working.size

    for _ in range(28):
        img = working
        if scale < 0.999:
            w, h = working.size
            img = working.resize(
                (max(1, round(w * scale)), max(1, round(h * scale))),
                Image.Resampling.LANCZOS,
            )
        last_size = save_webp(img, out_path, quality)
        last_w, last_h = img.size
        if kb(last_size) <= profile.max_kb:
            return {
                "source": name,
                "output": out_name,
                "profile": profile.name,
                "original_kb": kb(original_bytes),
                "webp_kb": kb(last_size),
                "target_kb": profile.max_kb,
                "width": last_w,
                "height": last_h,
                "quality": quality,
                "ok": True,
            }
        if quality > 42:
            quality -= 6
        elif scale > 0.5:
            scale *= 0.88
            quality = 78
        else:
            quality = max(28, quality - 4)

    return {
        "source": name,
        "output": out_name,
        "profile": profile.name,
        "original_kb": kb(original_bytes),
        "webp_kb": kb(last_size),
        "target_kb": profile.max_kb,
        "width": last_w,
        "height": last_h,
        "quality": quality,
        "ok": kb(last_size) <= profile.max_kb,
    }


def update_codebase_references(converted: list[dict]) -> list[str]:
    edited: list[str] = []
    mapping: list[tuple[str, str]] = []
    for row in converted:
        src = row["source"]
        out = row["output"]
        stem, ext = os.path.splitext(src)
        mapping.append((src, out))
        if ext.lower() in (".jpg", ".jpeg"):
            mapping.append((stem + ".jpeg", out))
            mapping.append((stem + ".JPEG", out))

    exts = (".html", ".js", ".css", ".md")
    for dirpath, _, filenames in os.walk(ROOT):
        if "node_modules" in dirpath.split(os.sep) or "/.git" in dirpath or dirpath.endswith(".git"):
            continue
        for fname in filenames:
            if not fname.endswith(exts):
                continue
            path = os.path.join(dirpath, fname)
            if path.startswith(os.path.join(ROOT, "scripts")) and fname.startswith("optimize"):
                continue
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
            original = text
            for old, new in mapping:
                text = text.replace(f"Website Images/{old}", f"Website Images/{new}")
            if text != original:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(text)
                edited.append(os.path.relpath(path, ROOT))
    return sorted(set(edited))


def homepage_image_paths() -> set[str]:
    paths: set[str] = set()
    index_path = os.path.join(ROOT, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()
    for m in re.finditer(r"Website Images/[^\"'\s>]+\.(?:webp|png|jpe?g)", html, re.I):
        paths.add(m.group(0).split("?")[0])

    flashes_data = os.path.join(ROOT, "flashes-data.js")
    with open(flashes_data, "r", encoding="utf-8") as f:
        js = f.read()
    block = re.search(r"window\.HOMEPAGE_FLASHES\s*=\s*\[(.*?)\];", js, re.S)
    if block:
        for m in re.finditer(r"['\"]Website Images/[^'\"]+['\"]", block.group(1)):
            paths.add(m.group(0).strip("'\"").split("?")[0])
    paths.add("Website Images/logo.png")
    return paths


def main() -> None:
    before_bytes = folder_raster_bytes(include_webp=False)
    before_webp_bytes = folder_raster_bytes(include_webp=True)

    candidates = []
    for name in sorted(os.listdir(IMG_DIR)):
        path = os.path.join(IMG_DIR, name)
        if not os.path.isfile(path):
            continue
        size = os.path.getsize(path)
        if should_skip(name, size):
            continue
        candidates.append(name)

    results = []
    for name in candidates:
        row = convert_file(name)
        results.append(row)
        mark = "OK" if row["ok"] else "MISS"
        print(
            f"[{mark}] {row['source']} -> {row['output']} ({row['profile']}): "
            f"{row['original_kb']} KB -> {row['webp_kb']} KB (<= {row['target_kb']}) "
            f"{row['width']}x{row['height']}"
        )

    edited = update_codebase_references(results)

    after_webp_only = 0
    for name in os.listdir(IMG_DIR):
        if name.endswith(".webp"):
            after_webp_only += os.path.getsize(os.path.join(IMG_DIR, name))

    hp_paths = homepage_image_paths()
    hp_before = 0
    hp_after = 0
    for rel in sorted(hp_paths):
        path = os.path.join(ROOT, rel.replace("/", os.sep))
        if os.path.isfile(path):
            hp_after += os.path.getsize(path)
        stem = os.path.splitext(rel)[0]
        for ext in (".png", ".jpg", ".jpeg", ".webp"):
            alt = stem + ext
            alt_path = os.path.join(ROOT, alt.replace("/", os.sep))
            if os.path.isfile(alt_path) and ext != ".webp":
                hp_before += os.path.getsize(alt_path)
                break
        else:
            if os.path.isfile(path):
                hp_before += os.path.getsize(path)

    report = {
        "converted_count": len(results),
        "failed": [r for r in results if not r["ok"]],
        "folder_png_jpg_bytes_before": before_bytes,
        "folder_all_raster_before": before_webp_bytes,
        "folder_webp_bytes_after": after_webp_only,
        "homepage_paths": sorted(hp_paths),
        "homepage_bytes_after": hp_after,
        "results": results,
        "edited_files": edited,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n=== Folder totals ===")
    print(f"PNG/JPG/JPEG before: {kb(before_bytes):,.1f} KB ({before_bytes / (1024*1024):.2f} MB)")
    print(f"All raster (incl existing webp) before pass: {kb(before_webp_bytes):,.1f} KB")
    print(f"WebP folder total after: {kb(after_webp_only):,.1f} KB ({after_webp_only / (1024*1024):.2f} MB)")
    print(f"\nHomepage referenced images after: {kb(hp_after):,.1f} KB ({hp_after / (1024*1024):.2f} MB)")

    print("\n| Source | WebP | Target | Profile | Status |")
    print("|--------|------|--------|---------|--------|")
    for r in results:
        print(
            f"| {r['source']} | {r['webp_kb']} KB | {r['target_kb']} KB | {r['profile']} | "
            f"{'PASS' if r['ok'] else 'FAIL'} |"
        )

    print(f"\nEdited {len(edited)} files:")
    for p in edited:
        print(f"  - {p}")

    failed = [r for r in results if not r["ok"]]
    if failed:
        raise SystemExit(f"{len(failed)} conversion(s) missed target.")

    if hp_after > 2 * 1024 * 1024:
        print(f"\nWARNING: Homepage image total {kb(hp_after)/1024:.2f} MB still above 2 MB target.")


if __name__ == "__main__":
    main()
