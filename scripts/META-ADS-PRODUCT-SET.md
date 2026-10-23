# Meta catalog product set — ads refresh (Oct 2026)

The catalog CSV contains **14 flashes** from `~/Desktop/Flashes ad/` (full replace upload in Commerce Manager).

| Source PNG | Meta / site title (catalog slot) |
|------------|----------------------------------|
| `Arm_Sleeve_Flash_1.png` | Sacred Oracle |
| `Arm_Sleeve_Flash_2.png` | Drift Oath |
| `Back_Flash_5.png` | Grim Veil |
| `Chest_Flash_1.png` | Jagged Wound |
| `Chest_Flash_2.png` | Ink Iris |
| `Chest_Flash_3.png` | Nettle Kindling |
| `Forearm_flash_2.png` | Coil Mirage |
| `Full_Front_Flash_2.png` | Grim Mirage |
| `Half_Sleeve_Flash_1.png` | Velvet Arc |
| `Hand_Flash_1.png` | Ledge Axis |
| `Hand_Flash_2_.png` | Jet Comet |
| `Shoulder_Flash_2.png` | Bitter Glint |
| `Stomach_Flash_2.png` | Omen Branch |
| `Thigh_Flash_3.png` | Drift Plume |

Config: `scripts/ads-flash-batch.json`. Sync: `python3 scripts/sync-ads-flash-batch.py`.  
Upload: `~/Downloads/catalog_service.csv` or `scripts/meta-flashes-catalog-ads-batch.csv`.  
Each row uses `custom_label_2` = `beezz_ads_refresh_2026-10`.

## After you upload `catalog_service.csv`

### Option A — Filter (recommended)

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
