#!/usr/bin/env python3
"""Apply ad flash batch from Desktop/Flashes ad PNGs; rebuild Meta CSV (14 products)."""

from __future__ import annotations

import csv
import hashlib
import io
import json
import urllib.parse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "scripts" / "ads-flash-batch.json"
DISPLAY_NAMES_PATH = ROOT / "scripts" / "meta-flash-display-names.json"
OUT_REPO = ROOT / "scripts" / "meta-flashes-catalog.csv"
OUT_ADS = ROOT / "scripts" / "meta-flashes-catalog-ads-batch.csv"
OUT_DOWNLOADS = Path.home() / "Downloads" / "catalog_service.csv"
IDS_FILE = ROOT / "scripts" / "meta-ads-set-product-ids.txt"
BASE = "https://beezz-zart.ca"

MAX_SIDE = 1200
QUALITY = 85


def load_display_names() -> dict[str, str]:
    raw = json.loads(DISPLAY_NAMES_PATH.read_text(encoding="utf-8"))
    return {k.replace("\\", "/"): v for k, v in raw.items()}


def title_for_item(item: dict, display_names: dict[str, str]) -> str:
    if item.get("title"):
        return item["title"]
    flash_path = f"Website Images/{item['catalog_rel']}"
    title = display_names.get(flash_path)
    if not title:
        raise KeyError(f"No display name for {flash_path} (add to meta-flash-display-names.json)")
    return title


def resolve_source(item: dict, ads_dir: Path) -> Path:
    name = item.get("source_file")
    if not name:
        raise ValueError(f"Missing source_file for {item}")
    path = ads_dir / name
    if not path.is_file():
        raise FileNotFoundError(path)
    return path


def to_webp(src: Path, dest: Path, max_side: int = MAX_SIDE) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(src)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > max_side:
        scale = max_side / max(w, h)
        img = img.resize(
            (max(1, round(w * scale)), max(1, round(h * scale))),
            Image.Resampling.LANCZOS,
        )
    img.convert("RGB").save(dest, "WEBP", quality=QUALITY, method=6)


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


def main() -> None:
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    ads_dir = Path(cfg["ads_dir"]).expanduser()
    img_v = cfg["img_v"]
    set_label = cfg["set_label"]
    items = cfg["items"]
    display_names = load_display_names()

    if not ads_dir.is_dir():
        raise SystemExit(f"Missing ads folder: {ads_dir}")

    for item in items:
        src = resolve_source(item, ads_dir)
        title = title_for_item(item, display_names)
        to_webp(src, ROOT / "Website Images" / item["catalog_rel"])
        print("updated", title, "<=", src.name)

    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    fieldnames = next(csv.reader([text[1]]))
    old_ids = load_old_ids()
    rows: list[dict[str, str]] = []

    for item in items:
        title = title_for_item(item, display_names)
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

    header_meta, header_fields = text[0], text[1]
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    for r in rows:
        w.writerow([r.get(f, "") for f in fieldnames])
    content = "\n".join([header_meta, header_fields, buf.getvalue().rstrip("\n")]) + "\n"
    OUT_REPO.write_text(content, encoding="utf-8")
    OUT_ADS.write_text(content, encoding="utf-8")
    OUT_DOWNLOADS.write_text(content, encoding="utf-8")
    IDS_FILE.write_text("\n".join(r["id"] for r in rows) + "\n", encoding="utf-8")

    print(f"Meta CSV: {len(rows)} products (v={img_v})")
    print(f"  {OUT_DOWNLOADS}")


if __name__ == "__main__":
    main()
