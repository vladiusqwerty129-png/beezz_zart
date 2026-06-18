#!/usr/bin/env python3
"""Resize + compress PNGs to WebP. Originals copied to Website Images/_originals/."""

from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from typing import Callable, Optional, Tuple

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "Website Images")
BACKUP_DIR = os.path.join(IMG_DIR, "_originals")


@dataclass
class Job:
    file: str
    max_kb: float
    resize: Callable[[Image.Image], Image.Image]


def kb(num_bytes: int) -> float:
    return round(num_bytes / 1024, 1)


def ensure_backup(src: str, name: str) -> None:
    os.makedirs(BACKUP_DIR, exist_ok=True)
    dest = os.path.join(BACKUP_DIR, name)
    if not os.path.exists(dest):
        shutil.copy2(src, dest)


def resize_long_side(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    long_side = max(w, h)
    if long_side <= max_side:
        return img.copy()
    scale = max_side / long_side
    return img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.LANCZOS)


def resize_max_width(img: Image.Image, max_width: int) -> Image.Image:
    w, h = img.size
    if w <= max_width:
        return img.copy()
    scale = max_width / w
    return img.resize((max_width, max(1, round(h * scale))), Image.Resampling.LANCZOS)


def resize_cover_square(img: Image.Image, size: int) -> Image.Image:
    w, h = img.size
    scale = max(size / w, size / h)
    nw, nh = round(w * scale), round(h * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - size) // 2
    top = (nh - size) // 2
    return resized.crop((left, top, left + size, top + size))


def resize_fit_box(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    copy = img.copy()
    copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    return copy


JOBS: list[Job] = [
    Job("Hero.png", 250, lambda img: resize_max_width(img, 1600)),
    *[Job(f"Projects-{i}.png", 120, lambda img, n=i: resize_long_side(img, 800)) for i in range(1, 9)],
    *[Job(f"Happy-Customers-{i}.png", 20, lambda img: resize_cover_square(img, 150)) for i in range(1, 6)],
    Job("Blackwork-Tattoo-Flash-1.png", 120, lambda img: resize_fit_box(img, 600, 800)),
    Job("Services-Flash-Designs.png", 120, lambda img: resize_max_width(img, 768)),
]


def save_webp(img: Image.Image, out_path: str, quality: int) -> int:
    rgb = img.convert("RGB")
    rgb.save(out_path, "WEBP", quality=quality, method=6)
    return os.path.getsize(out_path)


def convert_job(job: Job) -> dict:
    src = os.path.join(IMG_DIR, job.file)
    if not os.path.exists(src):
        raise FileNotFoundError(job.file)

    ensure_backup(src, job.file)
    out_path = os.path.join(IMG_DIR, os.path.splitext(job.file)[0] + ".webp")
    original_kb = kb(os.path.getsize(src))

    with Image.open(src) as im:
        im.load()
        working = job.resize(im)

    quality = 82
    scale = 1.0
    last_size = 0
    last_w, last_h = working.size

    for _ in range(24):
        img = working
        if scale < 0.999:
            w, h = working.size
            img = working.resize(
                (max(1, round(w * scale)), max(1, round(h * scale))),
                Image.Resampling.LANCZOS,
            )
        last_size = save_webp(img, out_path, quality)
        last_w, last_h = img.size
        if kb(last_size) <= job.max_kb:
            return {
                "file": os.path.basename(out_path),
                "original_kb": original_kb,
                "webp_kb": kb(last_size),
                "target_kb": job.max_kb,
                "width": last_w,
                "height": last_h,
                "quality": quality,
                "ok": True,
            }

        if quality > 45:
            quality -= 7
        elif scale > 0.55:
            scale *= 0.9
            quality = 78
        else:
            quality = max(30, quality - 5)

    return {
        "file": os.path.basename(out_path),
        "original_kb": original_kb,
        "webp_kb": kb(last_size),
        "target_kb": job.max_kb,
        "width": last_w,
        "height": last_h,
        "quality": quality,
        "ok": kb(last_size) <= job.max_kb,
    }


def main() -> None:
    results = []
    for job in JOBS:
        row = convert_job(job)
        results.append(row)
        mark = "OK" if row["ok"] else "MISS"
        print(
            f"[{mark}] {row['file']}: {row['original_kb']} KB -> {row['webp_kb']} KB "
            f"(target <= {row['target_kb']} KB) {row['width']}x{row['height']} q={row['quality']}"
        )

    print("\n| File | Original (KB) | WebP (KB) | Target (KB) | Dimensions | Status |")
    print("|------|---------------|-----------|-------------|------------|--------|")
    for r in results:
        print(
            f"| {r['file']} | {r['original_kb']} | {r['webp_kb']} | {r['target_kb']} | "
            f"{r['width']}x{r['height']} | {'PASS' if r['ok'] else 'FAIL'} |"
        )

    failed = [r for r in results if not r["ok"]]
    if failed:
        raise SystemExit(f"\n{len(failed)} file(s) missed target after retries.")
    print("\nAll targets met.")


if __name__ == "__main__":
    main()
