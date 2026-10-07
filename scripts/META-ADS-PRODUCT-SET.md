# Meta catalog product set — ads refresh (Oct 2026)

The CSV tags **14 flashes** with `custom_label_2` = `beezz_ads_refresh_2026-10`:
updated artwork from Desktop + new **Grim Veil**.

## After you upload `catalog_service.csv`

### Option A — Filter (recommended, stays in sync if you re-tag)

1. Commerce Manager → your catalog → **Sets** → **Create set**
2. Choose **Use filters**
3. Add rule: **Custom label 2** → **is** → `beezz_ads_refresh_2026-10`
4. Name the set e.g. **Beezz ads refresh Oct 2026**
5. Save

### Option B — Bulk IDs (fixed list of 14)

1. Create set → filter by **Content ID (id)**
2. Paste IDs from `meta-ads-set-product-ids.txt` (one per line)

Sets are **not** created from the CSV file itself — Meta only reads product fields; you create the set once in the UI (or via Marketing API).

## Ads

When creating a catalog ad, choose this **product set** instead of “All products”.
