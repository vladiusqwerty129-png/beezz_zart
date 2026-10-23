#!/usr/bin/env python3
"""Rebuild Meta CSV from scripts/ads-flash-batch.json (same as sync-ads-flash-batch)."""

from __future__ import annotations

import subprocess
import sys

ROOT = __file__.replace("/scripts/generate-meta-flashes-catalog.py", "")


def main() -> None:
    script = __import__("pathlib").Path(__file__).resolve().parent / "sync-ads-flash-batch.py"
    # Only regenerate CSV without re-encoding images
    import json
    import csv
    import hashlib
    import io
    import urllib.parse
    from pathlib import Path

    root = Path(__file__).resolve().parents[1]
    cfg = json.loads((root / "scripts/ads-flash-batch.json").read_text())
    out_repo = root / "scripts/meta-flashes-catalog.csv"
    out_dl = Path.home() / "Downloads/catalog_service.csv"
    ids_file = root / "scripts/meta-ads-set-product-ids.txt"
    base = "https://beezz-zart.ca"
    img_v = cfg["img_v"]
    set_label = cfg["set_label"]

    text = out_repo.read_text(encoding="utf-8").splitlines()
    fieldnames = next(csv.reader([text[1]]))
    old_ids = {}
    for row in csv.DictReader(text[2:], fieldnames=fieldnames):
        old_ids[row["title"]] = row["id"]

    rows = []
    for item in cfg["items"]:
        title = item["title"]
        flash_path = f"Website Images/{item['catalog_rel']}"
        pid = old_ids.get(title) or f"beezz-flash-{hashlib.sha1(flash_path.encode()).hexdigest()[:12]}"
        flash_q = urllib.parse.quote(flash_path, safe="")
        link = f"{base}/flash-quote.html?style=all&part=all&flash={flash_q}"
        img_url = f"{base}/{urllib.parse.quote(flash_path, safe='/')}?v={img_v}"
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
    out_repo.write_text(content, encoding="utf-8")
    out_dl.write_text(content, encoding="utf-8")
    ids_file.write_text("\n".join(r["id"] for r in rows) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} products to {out_dl}")


if __name__ == "__main__":
    main()
