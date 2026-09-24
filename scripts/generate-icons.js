import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard Brand SVG (Square with rounded corners or full icon)
const brandSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#c2410c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="104" fill="url(#bgGradient)"/>
  
  <!-- Outer Decorative Ring -->
  <circle cx="256" cy="230" r="160" stroke="#ffedd5" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="8 8"/>
  <circle cx="256" cy="230" r="148" stroke="#ffedd5" stroke-width="1.5" stroke-opacity="0.2"/>

  <!-- Windmill / Molen Icon Graphic -->
  <g filter="url(#shadow)">
    <!-- Windmill Tower / Body -->
    <path d="M228 320 L240 230 L272 230 L284 320 Z" fill="#ffffff" fill-opacity="0.95"/>
    <path d="M236 230 L248 180 L264 180 L276 230 Z" fill="#fef3c7"/>
    <!-- Dome cap -->
    <path d="M246 180 C246 166 266 166 266 180 Z" fill="#fbbf24"/>
    <!-- Small Tower Door & Windows -->
    <rect x="249" y="285" width="14" height="24" rx="7" fill="#7c2d12"/>
    <rect x="251" y="240" width="10" height="12" rx="2" fill="#7c2d12"/>

    <!-- Windmill Blades Center Pivot -->
    <circle cx="256" cy="188" r="12" fill="#78350f" stroke="#fef08a" stroke-width="3"/>

    <!-- Blades (Rotated 45 degrees for dynamic balance) -->
    <!-- Blade Top-Left -->
    <g transform="rotate(45 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <!-- Blade Top-Right -->
    <g transform="rotate(135 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <!-- Blade Bottom-Right -->
    <g transform="rotate(225 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <!-- Blade Bottom-Left -->
    <g transform="rotate(315 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
  </g>

  <!-- Brand Typography -->
  <text x="256" y="380" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="4">
    IN DE MOLEN
  </text>
  <text x="256" y="415" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#fed7aa" text-anchor="middle" letter-spacing="5">
    EET-STAMINÉE BIERBEEK
  </text>
  <text x="256" y="445" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" fill="#ffedd5" text-anchor="middle" letter-spacing="2" opacity="0.85">
    TEAM PLANNING APP
  </text>
</svg>
`;

// 2. Maskable SVG (Full bleed square background, content strictly inside safe 80% circle)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#c2410c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background with NO rounded corners (Android handles clipping) -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Content scaled and centered in safe zone (central 75% circle, r=185) -->
  <g transform="translate(40, 35) scale(0.84)">
    <circle cx="256" cy="230" r="160" stroke="#ffedd5" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="8 8"/>
    
    <!-- Windmill Tower -->
    <path d="M228 320 L240 230 L272 230 L284 320 Z" fill="#ffffff" fill-opacity="0.95"/>
    <path d="M236 230 L248 180 L264 180 L276 230 Z" fill="#fef3c7"/>
    <path d="M246 180 C246 166 266 166 266 180 Z" fill="#fbbf24"/>
    <rect x="249" y="285" width="14" height="24" rx="7" fill="#7c2d12"/>
    <rect x="251" y="240" width="10" height="12" rx="2" fill="#7c2d12"/>

    <!-- Pivot -->
    <circle cx="256" cy="188" r="12" fill="#78350f" stroke="#fef08a" stroke-width="3"/>

    <!-- Blades -->
    <g transform="rotate(45 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <g transform="rotate(135 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <g transform="rotate(225 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>
    <g transform="rotate(315 256 188)">
      <rect x="253" y="60" width="6" height="128" fill="#ffffff"/>
      <rect x="225" y="70" width="28" height="85" fill="#fef08a" fill-opacity="0.85" rx="3"/>
      <line x1="225" y1="90" x2="253" y2="90" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="110" x2="253" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="225" y1="130" x2="253" y2="130" stroke="#78350f" stroke-width="2"/>
    </g>

    <!-- Typography -->
    <text x="256" y="375" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="4">
      IN DE MOLEN
    </text>
    <text x="256" y="410" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#fed7aa" text-anchor="middle" letter-spacing="4">
      EET-STAMINÉE
    </text>
  </g>
</svg>
`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg.trim());
  console.log('Created public/icon.svg');

  const brandBuffer = Buffer.from(brandSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // Generate 192x192 PNG
  await sharp(brandBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created public/pwa-192x192.png');

  // Generate 512x512 PNG
  await sharp(brandBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created public/pwa-512x512.png');

  // Generate Maskable 512x512 PNG
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created public/pwa-maskable-512x512.png');

  // Generate Apple Touch Icon (180x180)
  await sharp(brandBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created public/apple-touch-icon.png');

  // Generate favicon.ico (as 32x32 PNG file)
  await sharp(brandBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created public/favicon.ico');
}

run().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
