#!/usr/bin/env python3
"""Apply the 6-flash ad batch from cover JPGs; revert mistaken Desktop-14 updates."""

from __future__ import annotations

import csv
import fnmatch
import hashlib
import io
import json
import subprocess
import urllib.parse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "scripts" / "ads-flash-batch.json"
DISPLAY_PATH = ROOT / "scripts" / "meta-flash-display-names.json"
OUT_REPO = ROOT / "scripts" / "meta-flashes-catalog.csv"
OUT_DOWNLOADS = Path.home() / "Downloads" / "catalog_service.csv"
IDS_FILE = ROOT / "scripts" / "meta-ads-set-product-ids.txt"
BASE = "https://beezz-zart.ca"

MAX_SIDE = 1200
COVER_MAX = 800
QUALITY = 85


def find_jpg(src_dir: Path, glob_pat: str) -> Path:
    for f in src_dir.iterdir():
        if f.suffix.upper() in {".JPG", ".JPEG"} and fnmatch.fnmatch(f.name, glob_pat):
            return f
    raise FileNotFoundError(f"No JPG matching {glob_pat!r} in {src_dir}")


def to_webp(jpg: Path, dest: Path, max_side: int) -> None:
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


def git_checkout(commit: str, paths: list[str]) -> None:
    if not paths:
        return
    subprocess.run(
        ["git", "checkout", commit, "--", *paths],
        cwd=ROOT,
        check=True,
    )


def flash_id_for(path: str) -> str:
    h = hashlib.sha1(path.encode()).hexdigest()[:12]
    return f"beezz-flash-{h}"


def load_old_ids() -> dict[str, str]:
    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    fields = next(csv.reader([text[1]]))
    by_title: dict[str, str] = {}
    for row in csv.DictReader(text[2:], fieldnames=fields):
        by_title[row["title"]] = row["id"]
    return by_title


def write_catalog(rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    header_meta, header_fields = text[0], text[1]
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    for r in rows:
        w.writerow([r.get(f, "") for f in fieldnames])
    body = buf.getvalue()
    content = "\n".join([header_meta, header_fields, body.rstrip("\n")]) + "\n"
    OUT_REPO.write_text(content, encoding="utf-8")
    OUT_DOWNLOADS.write_text(content, encoding="utf-8")
    IDS_FILE.write_text("\n".join(r["id"] for r in rows) + "\n", encoding="utf-8")


def main() -> None:
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    src_dir = ROOT / cfg["source_dir"]
    img_v = cfg["img_v"]
    set_label = cfg["set_label"]

    if not src_dir.is_dir():
        raise SystemExit(f"Missing source folder: {src_dir}")

    revert_commit = cfg.get("revert_catalog_rel_from_commit")
    revert_paths = cfg.get("revert_paths", [])
    if revert_commit and revert_paths:
        git_checkout(revert_commit, revert_paths)
        print(f"Reverted {len(revert_paths)} catalog images from {revert_commit}")

    for item in cfg["items"]:
        jpg = find_jpg(src_dir, item["jpg_glob"])
        rel = item["catalog_rel"]
        to_webp(jpg, ROOT / "Website Images" / rel, MAX_SIDE)
        if item.get("homepage_cover"):
            to_webp(
                jpg,
                src_dir / item["homepage_cover"],
                COVER_MAX,
            )
        print("updated", item["title"], "<=", jpg.name)

    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    fieldnames = next(csv.reader([text[1]]))
    old_ids = load_old_ids()
    rows: list[dict[str, str]] = []

    for item in cfg["items"]:
        title = item["title"]
        flash_path = f"Website Images/{item['catalog_rel']}"
        pid = old_ids.get(title) or flash_id_for(flash_path)
        flash_q = urllib.parse.quote(flash_path, safe="")
        link = f"{BASE}/flash-quote.html?style=all&part=all&flash={flash_q}"
        img_url = f"{BASE}/{urllib.parse.quote(flash_path, safe='/')}?v={img_v}"
        desc = (
            f"{title} blackwork flash, tattooed once, Beezz_zart. "
            "Request this design via the link."
        )
        row = {f: "" for f in fieldnames}
        row.update(
            {
                "id": pid,
                "image_link": img_url,
                "brand": "Beezz_zart",
                "description": desc,
                "title": title,
                "link": link,
                "custom_label_0": "Tattoo flash",
                "custom_label_1": title,
                "custom_label_2": set_label,
                "provider": "Mariia - Beezz_zart",
                "duration": "Session length varies",
                "service_category": "Personalized service",
            }
        )
        rows.append(row)

    write_catalog(rows, fieldnames)
    print(f"Meta CSV: {len(rows)} products (v={img_v})")
    print(f"  {OUT_DOWNLOADS}")


if __name__ == "__main__":
    main()
