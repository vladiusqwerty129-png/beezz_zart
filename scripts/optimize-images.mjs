#!/usr/bin/env node
/**
 * Resize + compress PNGs to WebP. Originals copied to Website Images/_originals/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'Website Images');
const BACKUP_DIR = path.join(IMG_DIR, '_originals');

/** @type {Array<{ file: string, maxKB: number, resize: import('sharp').ResizeOptions | ((meta: sharp.Metadata) => import('sharp').ResizeOptions) }>} */
const JOBS = [
  {
    file: 'Hero.png',
    maxKB: 250,
    resize: () => ({ width: 1600, withoutEnlargement: true }),
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    file: `Projects-${i + 1}.png`,
    maxKB: 120,
    resize: () => ({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }),
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    file: `Happy-Customers-${i + 1}.png`,
    maxKB: 20,
    resize: () => ({ width: 150, height: 150, fit: 'cover' }),
  })),
  {
    file: 'Blackwork-Tattoo-Flash-1.png',
    maxKB: 120,
    // Desktop services panel: ~600×800 display (4/5 in half-column)
    resize: () => ({ width: 600, height: 800, fit: 'inside', withoutEnlargement: true }),
  },
  {
    file: 'Services-Flash-Designs.png',
    maxKB: 120,
    // Mobile services panel: full-width ~768px, 16/10 capped at 320px tall
    resize: () => ({ width: 768, withoutEnlargement: true }),
  },
];

function kb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

function ensureBackup(srcPath, fileName) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dest = path.join(BACKUP_DIR, fileName);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(srcPath, dest);
  }
}

async function encodeWebp(inputPath, outputPath, resizeOptions, quality, extraScale = 1) {
  const meta = await sharp(inputPath).metadata();
  let opts =
    typeof resizeOptions === 'function' ? resizeOptions(meta) : { ...resizeOptions };

  if (extraScale < 1) {
    const w = meta.width || opts.width;
    const h = meta.height || opts.height;
    if (w && h && !opts.width && !opts.height) {
      opts = {
        ...opts,
        width: Math.max(1, Math.round(w * extraScale)),
        height: Math.max(1, Math.round(h * extraScale)),
        fit: opts.fit || 'inside',
        withoutEnlargement: true,
      };
    } else if (opts.width) {
      opts = {
        ...opts,
        width: Math.max(1, Math.round(opts.width * extraScale)),
        height: opts.height ? Math.max(1, Math.round(opts.height * extraScale)) : undefined,
      };
    }
  }

  await sharp(inputPath).rotate().resize(opts).webp({ quality, effort: 6 }).toFile(outputPath);

  const outMeta = await sharp(outputPath).metadata();
  return {
    width: outMeta.width,
    height: outMeta.height,
    bytes: fs.statSync(outputPath).size,
  };
}

async function convertJob(job) {
  const inputPath = path.join(IMG_DIR, job.file);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing source file: ${job.file}`);
  }

  ensureBackup(inputPath, job.file);

  const outputPath = path.join(IMG_DIR, job.file.replace(/\.png$/i, '.webp'));
  const originalKB = kb(fs.statSync(inputPath).size);

  let quality = 82;
  let scale = 1;
  let result;

  for (let attempt = 0; attempt < 24; attempt++) {
    result = await encodeWebp(inputPath, outputPath, job.resize, quality, scale);
    const sizeKB = kb(result.bytes);
    if (sizeKB <= job.maxKB) {
      return {
        file: path.basename(outputPath),
        originalKB,
        webpKB: sizeKB,
        targetKB: job.maxKB,
        width: result.width,
        height: result.height,
        quality,
        scale,
        ok: true,
      };
    }

    if (quality > 45) {
      quality -= 7;
    } else if (scale > 0.55) {
      scale *= 0.9;
      quality = 78;
    } else {
      quality = Math.max(30, quality - 5);
    }
  }

  const sizeKB = kb(result.bytes);
  return {
    file: path.basename(outputPath),
    originalKB,
    webpKB: sizeKB,
    targetKB: job.maxKB,
    width: result.width,
    height: result.height,
    quality,
    scale,
    ok: sizeKB <= job.maxKB,
  };
}

async function main() {
  const results = [];
  for (const job of JOBS) {
    const row = await convertJob(job);
    results.push(row);
    const mark = row.ok ? 'OK' : 'MISS';
    console.log(
      `[${mark}] ${row.file}: ${row.originalKB} KB -> ${row.webpKB} KB (target <= ${row.targetKB} KB) ${row.width}x${row.height} q=${row.quality}`
    );
  }

  console.log('\n| File | Original (KB) | WebP (KB) | Target (KB) | Dimensions | Status |');
  console.log('|------|---------------|-----------|-------------|------------|--------|');
  for (const r of results) {
    console.log(
      `| ${r.file} | ${r.originalKB} | ${r.webpKB} | ${r.targetKB} | ${r.width}x${r.height} | ${r.ok ? 'PASS' : 'FAIL'} |`
    );
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    process.exitCode = 1;
    console.error(`\n${failed.length} file(s) missed target after retries.`);
  } else {
    console.log('\nAll targets met.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
