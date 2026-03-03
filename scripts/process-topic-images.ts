/**
 * Process topic images from src/images/{topic-slug} and export to public/images/{Topic Name}.
 * - Sorts source images by file mtime ascending (oldest = fact 1).
 * - Resizes to medium (800px) and thumb (300px) JPGs.
 * - Writes 1.jpg, 1-thumb.jpg, 2.jpg, 2-thumb.jpg, ... and updates manifest.json.
 * - After processing, moves source images to src/images/{topic-slug}/done/ to avoid reprocessing.
 * - On subsequent runs, only processes new images (not in "done" folder) and continues numbering.
 *
 * Run: npx tsx scripts/process-topic-images.ts
 * Add to package.json: "process-images": "tsx scripts/process-topic-images.ts"
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const SRC_IMAGES = path.join(ROOT, 'src', 'images');
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');

const MEDIUM_WIDTH = 800;
const THUMB_WIDTH = 300;
const JPG_QUALITY = 85;

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

function slugToFolderName(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
}

async function ensureDir(p: string): Promise<void> {
  await fs.promises.mkdir(p, { recursive: true });
}

async function getImageFilesSortedByMtime(dir: string, doneDir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  // Get files that are NOT in the "done" folder
  const files = entries
    .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
    .map((e) => path.join(dir, e.name));

  const withStats = await Promise.all(
    files.map(async (f) => ({ path: f, mtime: (await fs.promises.stat(f)).mtimeMs }))
  );
  withStats.sort((a, b) => a.mtime - b.mtime);
  return withStats.map((s) => s.path);
}

async function getProcessedCount(doneDir: string): Promise<number> {
  if (!fs.existsSync(doneDir)) return 0;
  const entries = await fs.promises.readdir(doneDir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).length;
}

async function moveToDone(srcPath: string, doneDir: string): Promise<void> {
  await ensureDir(doneDir);
  const filename = path.basename(srcPath);
  const destPath = path.join(doneDir, filename);
  await fs.promises.rename(srcPath, destPath);
}

async function processImage(
  srcPath: string,
  outDir: string,
  index: number,
  sharp: typeof import('sharp')
): Promise<void> {
  const base = `${index}.jpg`;
  const thumbName = `${index}-thumb.jpg`;
  const mediumPath = path.join(outDir, base);
  const thumbPath = path.join(outDir, thumbName);

  const img = sharp(srcPath);
  const meta = await img.metadata();
  const format = meta.format === 'jpeg' || meta.format === 'jpg' ? 'jpeg' : 'jpeg';

  await img
    .resize(MEDIUM_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: JPG_QUALITY })
    .toFile(mediumPath);

  await sharp(srcPath)
    .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: JPG_QUALITY })
    .toFile(thumbPath);

  console.log(`  ${index}: ${path.basename(srcPath)} -> ${base}, ${thumbName}`);
}

async function main(): Promise<void> {
  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('sharp is required. Run: npm install -D sharp');
    process.exit(1);
  }

  if (!fs.existsSync(SRC_IMAGES)) {
    console.log('No src/images folder found. Nothing to do.');
    return;
  }

  const topicSlugs = await fs.promises.readdir(SRC_IMAGES, { withFileTypes: true });
  const dirs = topicSlugs.filter((e) => e.isDirectory()).map((e) => e.name);

  if (dirs.length === 0) {
    console.log('No topic folders in src/images.');
    return;
  }

  const manifest: Record<string, { folder: string; count: number }> = {};

  for (const slug of dirs) {
    const srcDir = path.join(SRC_IMAGES, slug);
    const doneDir = path.join(srcDir, 'done');
    
    // Get count of already processed images
    const processedCount = await getProcessedCount(doneDir);
    
    // Get unprocessed image files
    const imageFiles = await getImageFilesSortedByMtime(srcDir, doneDir);
    
    if (imageFiles.length === 0 && processedCount === 0) {
      console.log(`Skip ${slug}: no image files`);
      continue;
    }

    const folderName = slugToFolderName(slug);
    const outDir = path.join(PUBLIC_IMAGES, folderName);
    await ensureDir(outDir);

    if (imageFiles.length > 0) {
      console.log(`\n${slug} -> ${folderName} (${processedCount} already processed, ${imageFiles.length} new)`);
      
      // Process new images, starting from the next index after processed ones
      for (let i = 0; i < imageFiles.length; i++) {
        const outputIndex = processedCount + i + 1;
        await processImage(imageFiles[i], outDir, outputIndex, sharp);
        // Move processed image to "done" folder
        await moveToDone(imageFiles[i], doneDir);
      }
    } else {
      console.log(`\n${slug} -> ${folderName} (${processedCount} already processed, 0 new)`);
    }

    // Total count includes both processed and newly processed
    const totalCount = processedCount + imageFiles.length;
    manifest[slug] = { folder: folderName, count: totalCount };
  }

  const manifestPath = path.join(PUBLIC_IMAGES, 'manifest.json');
  await ensureDir(PUBLIC_IMAGES);
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('\nWrote', manifestPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
