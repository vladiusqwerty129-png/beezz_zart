#!/usr/bin/env python3
"""Build Meta services catalog CSV from Desktop ad JPGs + display-name mapping."""

from __future__ import annotations

import csv
import hashlib
import io
import json
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESKTOP = Path.home() / "Desktop" / "Falshes ads shop"
DISPLAY_PATH = ROOT / "scripts" / "meta-flash-display-names.json"
OUT_REPO = ROOT / "scripts" / "meta-flashes-catalog.csv"
OUT_DOWNLOADS = Path.home() / "Downloads" / "catalog_service.csv"
IDS_FILE = ROOT / "scripts" / "meta-ads-set-product-ids.txt"

IMG_V = "134"
SET_LABEL = "beezz_ads_refresh_2026-10"
BASE = "https://beezz-zart.ca"

DESKTOP_TITLE = {"IMG_6701": "Grim Veil"}


def flash_id_for(path: str) -> str:
    h = hashlib.sha1(path.encode()).hexdigest()[:12]
    return f"beezz-flash-{h}"


def enc_path(path: str) -> str:
    return urllib.parse.quote(path, safe="/")


def load_old_ids() -> dict[str, str]:
    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    fields = next(csv.reader([text[1]]))
    by_title: dict[str, str] = {}
    for row in csv.DictReader(text[2:], fieldnames=fields):
        by_title[row["title"]] = row["id"]
    return by_title


def make_row(title: str, rel_path: str, old_ids: dict[str, str]) -> dict[str, str]:
    flash_path = f"Website Images/{rel_path}"
    pid = old_ids.get(title) or flash_id_for(flash_path)
    flash_q = urllib.parse.quote(flash_path, safe="")
    link = f"{BASE}/flash-quote.html?style=all&part=all&flash={flash_q}"
    img_url = f"{BASE}/{enc_path(flash_path)}?v={IMG_V}"
    desc = (
        f"{title} blackwork flash, tattooed once, Beezz_zart. "
        "Request this design via the link."
    )
    row = {f: "" for f in FIELDNAMES}
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
            "custom_label_2": SET_LABEL,
            "provider": "Mariia - Beezz_zart",
            "duration": "Session length varies",
            "service_category": "Personalized service",
        }
    )
    return row


def write_catalog(rows: list[dict[str, str]]) -> None:
    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    header_meta, header_fields = text[0], text[1]
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    for r in rows:
        w.writerow([r.get(f, "") for f in FIELDNAMES])
    body = buf.getvalue()
    content = "\n".join([header_meta, header_fields, body.rstrip("\n")]) + "\n"
    OUT_REPO.write_text(content, encoding="utf-8")
    OUT_DOWNLOADS.write_text(content, encoding="utf-8")
    IDS_FILE.write_text("\n".join(r["id"] for r in rows) + "\n", encoding="utf-8")


def main() -> None:
    global FIELDNAMES
    display = json.loads(DISPLAY_PATH.read_text(encoding="utf-8"))
    title_to_rel = {v: k.replace("Website Images/", "") for k, v in display.items()}
    text = OUT_REPO.read_text(encoding="utf-8").splitlines()
    FIELDNAMES = next(csv.reader([text[1]]))
    old_ids = load_old_ids()

    if not DESKTOP.is_dir():
        raise SystemExit(f"Missing desktop folder: {DESKTOP}")

    rows: list[dict[str, str]] = []
    for jpg in sorted(DESKTOP.glob("*.JPG")):
        title = DESKTOP_TITLE.get(jpg.stem, jpg.stem)
        rel = title_to_rel.get(title)
        if not rel:
            raise SystemExit(f"No catalog path for {title!r} ({jpg.name})")
        rows.append(make_row(title, rel, old_ids))

    write_catalog(rows)
    print(f"Wrote {len(rows)} products to {OUT_REPO} and {OUT_DOWNLOADS}")


if __name__ == "__main__":
    main()
