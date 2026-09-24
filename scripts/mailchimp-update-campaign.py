#!/usr/bin/env python3
"""Build / update the Beezz_zart flash-drop Mailchimp campaign from the v2 mockup."""

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("Install Pillow: pip3 install Pillow")

ROOT = Path("/Users/mariabacman/Рабочий стол — Мария’s MacBook Air/Cursor/beezz-zart")
IMG = ROOT / "Website Images"
ASSETS = ROOT / "scripts" / "email-assets"
CAMPAIGN_ID = "beee29362c"
SITE = "https://beezz-zart.ca"
EYE = "&#128065;"

api_key = os.environ.get("MAILCHIMP_API_KEY")
if not api_key:
    sys.exit("Set MAILCHIMP_API_KEY environment variable before running this script.")

dc = api_key.split("-")[-1]
API = f"https://{dc}.api.mailchimp.com/3.0"


def mc(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        return err.code, json.loads(err.read().decode())


def upload_file(path, remote_name):
    with open(path, "rb") as handle:
        b64 = base64.b64encode(handle.read()).decode()
    status, res = mc("POST", "/file-manager/files", {"name": remote_name, "file_data": b64})
    if status >= 400:
        raise RuntimeError(f"Upload failed {remote_name}: {res}")
    return res["full_size_url"]


def center_crop_portrait(src_path, out_path, target_w=174, ratio=0.85):
    """Portrait crop matching site tiles (~0.85 width:height)."""
    img = Image.open(src_path).convert("RGB")
    w, h = img.size
    target_h = int(round(target_w / ratio))
    crop_h = min(h, int(w / ratio))
    crop_w = int(crop_h * ratio)
    left = (w - crop_w) // 2
    top = (h - crop_h) // 2
    cropped = img.crop((left, top, left + crop_w, top + crop_h))
    cropped = cropped.resize((target_w * 2, target_h * 2), Image.Resampling.LANCZOS)
    cropped.save(out_path, "JPEG", quality=88, optimize=True)


def prepare_background(out_path, width=600, height=3200):
    """Radial charcoal gradient — lighter top-left, near-black elsewhere (matches site section--dark)."""
    base = Image.new("RGB", (width, height), (21, 21, 21))
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse([-140, -200, 460, 480], fill=(60, 60, 60, 100))
    draw.ellipse([220, 60, 680, 520], fill=(48, 48, 48, 55))
    draw.ellipse([40, height - 980, 560, height + 120], fill=(38, 38, 38, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=90))
    base.paste(glow, (0, 0), glow)
    base.save(out_path, "JPEG", quality=82, optimize=True)


def prepare_assets():
    ASSETS.mkdir(parents=True, exist_ok=True)
    bg_out = ASSETS / "bg-gradient.jpg"
    prepare_background(bg_out)

    tile_paths = []
    for i in range(1, 7):
        src = IMG / f"landing-page-flash-cover-{i}.webp"
        out = ASSETS / f"flash-tile-{i}.jpg"
        center_crop_portrait(src, out)
        tile_paths.append(out)

    return bg_out, tile_paths


def build_html(urls):
    bg = urls["bg"]
    tiles = urls["tiles"]

    def tile_cell(url, idx, width_pct, max_w, mobile=False):
        img_style = "display:block;width:100%;height:auto;border-radius:20px;border:0;"
        if not mobile:
            img_style += f"max-width:{max_w}px;margin:0 auto;"
        return f"""<td width="{width_pct}" valign="top" style="padding:6px;width:{width_pct};">
  <a href="{SITE}/flashes.html" style="text-decoration:none;">
    <img src="{url}" alt="Blackwork flash design {idx}" width="{max_w}" style="{img_style}">
  </a>
</td>"""

    desktop_row1 = "".join(tile_cell(tiles[i], i + 1, "33.33%", 176) for i in range(3))
    desktop_row2 = "".join(tile_cell(tiles[i], i + 1, "33.33%", 176) for i in range(3, 6))

    mobile_rows = ""
    for r in range(3):
        i = r * 2
        mobile_rows += (
            f"<tr>{tile_cell(tiles[i], i + 1, '50%', 280, mobile=True)}"
            f"{tile_cell(tiles[i + 1], i + 2, '50%', 280, mobile=True)}</tr>"
        )

    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>New blackwork flashes just dropped</title>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style type="text/css">
:root {{ color-scheme: dark; supported-color-schemes: dark; }}
#preview-text {{ display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }}
body, table, td, p, a {{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
table, td {{ mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }}
img {{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }}
.text-light {{ color:#FDFDFD !important; -webkit-text-fill-color:#FDFDFD !important; }}
.text-muted {{ color:#9A9A9A !important; -webkit-text-fill-color:#9A9A9A !important; }}
@media (prefers-color-scheme: dark) {{
  body, .email-container, .email-container td {{ background-color:#151515 !important; }}
  .text-light, .flash-headline, h1 {{ color:#FDFDFD !important; -webkit-text-fill-color:#FDFDFD !important; }}
  .text-muted {{ color:#9A9A9A !important; -webkit-text-fill-color:#9A9A9A !important; }}
  u + .body .text-light, u + .body .flash-headline {{ color:#FDFDFD !important; }}
}}
/* Mobile-first: 2-col grid is the default (works without media queries) */
tr.grid-mobile {{ display:table-row !important; }}
tr.grid-desktop {{ display:none !important; max-height:0 !important; overflow:hidden !important; mso-hide:all; }}
@media only screen and (min-width: 621px) {{
  tr.grid-mobile {{ display:none !important; max-height:0 !important; overflow:hidden !important; mso-hide:all !important; }}
  tr.grid-desktop {{ display:table-row !important; max-height:none !important; overflow:visible !important; }}
}}
@media only screen and (max-width: 620px) {{
  .email-container {{ width:100% !important; }}
  .pad {{ padding-left:16px !important; padding-right:16px !important; }}
  .flash-headline {{ font-size:25px !important; line-height:1.12 !important; letter-spacing:-0.02em !important; }}
  .btn-cell a {{ display:block !important; width:100% !important; box-sizing:border-box !important; text-align:center !important; }}
  .mc-legal {{ padding:10px 16px 14px !important; }}
  .mc-legal p {{ font-size:9px !important; line-height:1.45 !important; }}
}}
@media only screen and (max-width: 620px) {{
  #templateFooter, .mceFooter, .mce-footer, [data-block-id="footer"] {{
    background-color:#151515 !important;
    padding:8px 12px !important;
    font-size:9px !important;
    line-height:1.4 !important;
    color:#3C3C3C !important;
  }}
  #templateFooter a, .mceFooter a, .mce-footer a {{ color:#9A9A9A !important; font-size:9px !important; }}
}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#151515;">
<div id="preview-text">A few just went up on the site — first come, first inked.</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#151515" style="background-color:#151515;">
<tr><td align="center" bgcolor="#151515" style="background-color:#151515;padding:0;">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-container" bgcolor="#151515" background="{bg}" style="width:600px;max-width:600px;background-color:#151515;background-image:url('{bg}');background-repeat:no-repeat;background-size:100% auto;">

<!-- Brand header -->
<tr><td class="pad" align="center" bgcolor="#151515" style="padding:40px 24px 24px;background-color:#151515;font-family:'Satoshi','Inter',Arial,Helvetica,sans-serif;">
<p class="text-light" style="margin:0;font-size:20px;line-height:1.2;font-weight:700;color:#FDFDFD;letter-spacing:0.02em;">beezz_zart</p>
</td></tr>

<!-- Flash drop headline -->
<tr><td class="pad" align="center" bgcolor="#151515" style="padding:0 24px 24px;background-color:#151515;font-family:'Satoshi','Inter',Arial,Helvetica,sans-serif;">
<p class="text-muted" style="margin:0 0 14px;font-size:11px;line-height:1.4;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#9A9A9A;">New Flash Drop</p>
<h1 class="flash-headline text-light" style="margin:0 0 18px;font-size:36px;line-height:1.08;font-weight:700;color:#FDFDFD;letter-spacing:-0.02em;"><span style="color:#FDFDFD;-webkit-text-fill-color:#FDFDFD;">New Blackwork Flashes<br>Just Dropped</span></h1>
<p class="text-muted" style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;font-weight:400;color:#9A9A9A;max-width:480px;">Original designs, tattooed only once. When a piece is booked, it&rsquo;s off the board for good.</p>
</td></tr>

<!--[if mso]>
<tr>
<td class="pad" style="padding:0 14px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>{desktop_row1}</tr>
<tr>{desktop_row2}</tr>
</table>
</td>
</tr>
<![endif]-->
<!--[if !mso]><!-->
<!-- Mobile: 2 per row (default — no media query needed) -->
<tr class="grid-mobile">
<td class="pad" style="padding:0 14px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
{mobile_rows}
</table>
</td>
</tr>
<!-- Desktop: 3 per row (min-width 621px only) -->
<tr class="grid-desktop">
<td class="pad" style="padding:0 14px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>{desktop_row1}</tr>
<tr>{desktop_row2}</tr>
</table>
</td>
</tr>
<!--<![endif]-->

<tr><td class="pad" style="padding:0 24px 40px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="btn-cell"><tr>
<td align="center" bgcolor="#FDFDFD" style="border-radius:12px;background-color:#FDFDFD;">
<a href="{SITE}/flashes.html" style="display:block;padding:20px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:#151515;text-decoration:none;border-radius:12px;text-align:center;">View All Flashes {EYE}</a>
</td></tr></table>
</td></tr>

<!-- Personal letter -->
<tr><td class="pad" style="padding:0 24px 44px;font-family:'Inter',Arial,Helvetica,sans-serif;">
<p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#9A9A9A;">Hey,</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#9A9A9A;">I&rsquo;ve just added a new batch of blackwork flash designs and I wanted you to see them first.</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#9A9A9A;">Each flash is tattooed exactly once and never repeated, so once a design&rsquo;s gone, it&rsquo;s gone. Sizes and placement are adapted to your body, and most of them are just concepts &mdash; I will draw them freehand directly on you!</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.75;color:#9A9A9A;">See one you like? Reply to this email or press &ldquo;get a quote&rdquo; on the website &mdash; I&rsquo;ll always start with a free consultation first, so there&rsquo;s no pressure either way.</p>
<p style="margin:0 0 4px;font-size:16px;line-height:1.75;color:#FDFDFD;">Talk soon,</p>
<p style="margin:0 0 4px;font-size:16px;line-height:1.75;color:#FDFDFD;font-weight:600;">Marie</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#9A9A9A;">Beezz_zart &middot; Freehand Blackwork Tattoos &middot; Back2Life Ink, Concord, ON</p>
</td></tr>

<!-- Footer -->
<tr><td class="pad" align="center" style="padding:32px 24px 40px;font-family:'Inter',Arial,Helvetica,sans-serif;">
<p style="margin:0 0 8px;font-family:'Satoshi','Inter',Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#FDFDFD;">Beezz_zart</p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9A9A9A;">Freehand Blackwork Tattoos &middot; Toronto, Ontario</p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9A9A9A;">Back2Life Ink &middot; 10 Buttermill Ave, Unit 3, Concord, ON L4K 3X4</p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.6;">
<a href="https://www.instagram.com/beezz_zart/" style="color:#9A9A9A;text-decoration:none;">@beezz_zart</a>
</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#3C3C3C;">You&rsquo;re receiving this because you inquired with beezz_zart.</p>
</td></tr>

<!-- Mailchimp legal (dark, compact — replaces white auto-footer) -->
<tr><td class="pad mc-legal" align="center" bgcolor="#151515" style="padding:14px 24px 20px;background-color:#151515;font-family:'Inter',Arial,Helvetica,sans-serif;">
<p style="margin:0;font-size:10px;line-height:1.5;color:#3C3C3C;">Sent to *|EMAIL|* &middot; <a href="*|UPDATE_PROFILE|*" style="color:#9A9A9A;text-decoration:underline;">Preferences</a> &middot; <a href="*|UNSUB|*" style="color:#9A9A9A;text-decoration:underline;">Unsubscribe</a></p>
<p style="margin:8px 0 0;font-size:10px;line-height:1.4;color:#3C3C3C;">*|LIST:ADDRESS|*</p>
</td></tr>

</table>

</td></tr>
</table>
</body>
</html>"""


PLAIN = f"""beezz_zart

NEW FLASH DROP
New Blackwork Flashes
Just Dropped

Original designs, tattooed only once. When a piece is booked, it's off the board for good.

View all flashes: {SITE}/flashes.html

Hey,

I've just added a new batch of blackwork flash designs and I wanted you to see them first.

Each flash is tattooed exactly once and never repeated, so once a design's gone, it's gone. Sizes and placement are adapted to your body, and most of them are just concepts - I will draw them freehand directly on you!

See one you like? Reply to this email or press "get a quote" on the website - I'll always start with a free consultation first, so there's no pressure either way.

Talk soon,
Marie
Beezz_zart · Freehand Blackwork Tattoos · Back2Life Ink, Concord, ON

Beezz_zart
Freehand Blackwork Tattoos · Toronto, Ontario
Back2Life Ink · 10 Buttermill Ave, Unit 3, Concord, ON L4K 3X4
@beezz_zart

You're receiving this because you inquired with beezz_zart. Unsubscribe anytime.
"""


def main():
    print("Preparing email assets…")
    bg_path, tile_paths = prepare_assets()

    print("Uploading to Mailchimp…")
    urls = {
        "bg": upload_file(bg_path, "beezz-flash-drop-bg-v3.jpg"),
        "tiles": [upload_file(p, f"beezz-flash-tile-v3-{i}.jpg") for i, p in enumerate(tile_paths, 1)],
    }

    html = build_html(urls)

    status, _ = mc("PATCH", f"/campaigns/{CAMPAIGN_ID}", {
        "settings": {
            "subject_line": "New blackwork flashes just dropped",
            "preview_text": "A few just went up on the site — first come, first inked.",
            "title": "Flash Drop E-blast — Mockup v2",
            "from_name": "Mariia · Beezz_zart",
            "reply_to": "beezzzart22808@gmail.com",
            "auto_footer": False,
            "inline_css": False,
        }
    })
    print("PATCH campaign:", status)

    status, content = mc("PUT", f"/campaigns/{CAMPAIGN_ID}/content", {
        "html": html,
        "plain_text": PLAIN,
    })
    print("PUT content:", status)
    if status >= 400:
        print(json.dumps(content, indent=2))
        sys.exit(1)

    status, _ = mc("POST", f"/campaigns/{CAMPAIGN_ID}/actions/test", {
        "test_emails": ["beezzzart22808@gmail.com"],
        "send_type": "html",
    })
    print("Test email sent:", status)
    print("Edit: https://us11.admin.mailchimp.com/campaigns/edit?id=6220787")


if __name__ == "__main__":
    main()
