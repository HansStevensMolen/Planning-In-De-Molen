import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function prepareLogo() {
  const sourcePath = path.resolve('public/in-de-molen-logo.png');
  if (!fs.existsSync(sourcePath)) {
    console.error('Source logo does not exist at', sourcePath);
    process.exit(1);
  }

  // 1. Trim the excess white space from 960x960 down to the oval bounds
  const trimmedBuffer = await sharp(sourcePath)
    .trim({
      threshold: 10
    })
    .toBuffer();

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log('Trimmed dimensions:', trimmedMeta.width, 'x', trimmedMeta.height);

  // Add a nice slight margin (e.g. 20px) on white background
  const padX = 24;
  const padY = 16;
  const targetWidth = (trimmedMeta.width || 946) + (padX * 2);
  const targetHeight = (trimmedMeta.height || 570) + (padY * 2);

  const tightLogo = await sharp(trimmedBuffer)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.resolve('public/in-de-molen-logo.png'));

  console.log('Updated public/in-de-molen-logo.png with tight margins');

  // 2. Create Transparent version by replacing outer white background
  // We can do a flood fill or simple alpha mask from edge
  const { data, info } = await sharp(sourcePath)
    .trim({ threshold: 10 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed boundary pixels for flood fill
  function isOuterWhite(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r > 230 && g > 230 && b > 230;
  }

  for (let x = 0; x < width; x++) {
    if (isOuterWhite(x, 0)) queue.push(x, 0);
    if (isOuterWhite(x, height - 1)) queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    if (isOuterWhite(0, y)) queue.push(0, y);
    if (isOuterWhite(width - 1, y)) queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    // Make this pixel transparent
    const idx = pos * 4;
    data[idx + 3] = 0;

    // Check 4 neighbors
    if (x > 0 && !visited[pos - 1] && isOuterWhite(x - 1, y)) queue.push(x - 1, y);
    if (x < width - 1 && !visited[pos + 1] && isOuterWhite(x + 1, y)) queue.push(x + 1, y);
    if (y > 0 && !visited[pos - width] && isOuterWhite(x, y - 1)) queue.push(x, y - 1);
    if (y < height - 1 && !visited[pos + width] && isOuterWhite(x, y + 1)) queue.push(x, y + 1);
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toFile(path.resolve('public/in-de-molen-logo-transparent.png'));
  console.log('Created public/in-de-molen-logo-transparent.png');

  // 3. Generate high quality PWA icons using this exact authentic logo on vibrant brand background
  const pwaBackground = { r: 255, g: 247, b: 237, alpha: 1 }; // orange-50 warm tone
  const logoForPwa = await sharp(path.resolve('public/in-de-molen-logo-transparent.png'))
    .resize(440, 265, { fit: 'inside' })
    .toBuffer();

  const pwa512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: logoForPwa,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));
  console.log('Updated public/pwa-512x512.png');

  const pwa192 = await sharp(path.resolve('public/pwa-512x512.png'))
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));
  console.log('Updated public/pwa-192x192.png');

  // Maskable icon with 15% safe zone padding
  const logoForMaskable = await sharp(path.resolve('public/in-de-molen-logo-transparent.png'))
    .resize(360, 215, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: logoForMaskable,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));
  console.log('Updated public/pwa-maskable-512x512.png');

  // Apple touch icon (180x180)
  await sharp(path.resolve('public/pwa-512x512.png'))
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('Updated public/apple-touch-icon.png');

  // Favicon (32x32)
  await sharp(path.resolve('public/pwa-512x512.png'))
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/favicon.ico'));
  console.log('Updated public/favicon.ico');
}

prepareLogo().catch(err => {
  console.error('Error preparing logo:', err);
  process.exit(1);
});
