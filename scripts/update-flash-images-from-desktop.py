#!/usr/bin/env python3
"""Convert Desktop/Falshes ads shop JPGs into catalog WebP paths on the site."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DESKTOP = Path.home() / "Desktop" / "Falshes ads shop"
DISPLAY_PATH = ROOT / "scripts" / "meta-flash-display-names.json"
COVER_DIR = ROOT / "Website Images" / "Available blackwork flashes main page cover"

MAX_SIDE = 1200
QUALITY = 85
DESKTOP_TITLE = {"IMG_6701": "Grim Veil"}

HOMEPAGE_COVERS = {
    "Grim Veil": "home-grim-veil.webp",
    "Ink Iris": "home-ink-iris.webp",
    "Ledge Axis": "home-ledge-axis.webp",
    "Sacred Spine": "home-sacred-spine.webp",
    "Violet Nova": "home-violet-nova.webp",
    "Wraith Vault": "home-wraith-vault.webp",
}


def to_webp(jpg: Path, dest: Path, max_side: int = MAX_SIDE) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(jpg)
    w, h = img.size
    if max(w, h) > max_side:
        scale = max_side / max(w, h)
        img = img.resize(
            (max(1, round(w * scale)), max(1, round(h * scale))),
            Image.Resampling.LANCZOS,
        )
    img.convert("RGB").save(dest, "WEBP", quality=QUALITY, method=6)


def main() -> None:
    display = json.loads(DISPLAY_PATH.read_text(encoding="utf-8"))
    title_to_rel = {v: k.replace("Website Images/", "") for k, v in display.items()}

    if not DESKTOP.is_dir():
        raise SystemExit(f"Missing: {DESKTOP}")

    for jpg in sorted(DESKTOP.glob("*.JPG")):
        title = DESKTOP_TITLE.get(jpg.stem, jpg.stem)
        rel = title_to_rel.get(title)
        if not rel:
            raise SystemExit(f"No path for {title!r}")
        to_webp(jpg, ROOT / "Website Images" / rel)
        print("catalog", title)

    COVER_DIR.mkdir(parents=True, exist_ok=True)
    for title, out_name in HOMEPAGE_COVERS.items():
        src = DESKTOP / ("IMG_6701.JPG" if title == "Grim Veil" else f"{title}.JPG")
        if src.is_file():
            to_webp(src, COVER_DIR / out_name, max_side=800)
            print("cover", out_name)


if __name__ == "__main__":
    main()
