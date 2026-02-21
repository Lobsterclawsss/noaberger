import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgBuffer = readFileSync(join(__dirname, '../public/og-image.svg'));

await sharp(svgBuffer)
  .resize(1200, 630)
  .jpeg({ quality: 90, progressive: true })
  .toFile(join(__dirname, '../public/og-image.jpg'));

console.log('✅ OG image created: og-image.jpg (1200x630)');
