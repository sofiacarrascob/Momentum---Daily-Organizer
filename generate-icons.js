import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standalone SVG definition of Momentum Flower Logo with background padding
const getSvg = (bg = '#FEFBEC') => `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Petal Gradient -->
    <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7D32" />
      <stop offset="60%" stop-color="#EF681E" />
      <stop offset="100%" stop-color="#D8540E" />
    </linearGradient>

    <!-- Center Disk Gradient -->
    <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D1A10" />
      <stop offset="100%" stop-color="#270B04" />
    </linearGradient>

    <!-- Subtle Petal Highlight Gradient -->
    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0" />
    </linearGradient>

    <!-- Drop Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#301208" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background for app launcher icon -->
  ${bg ? `<rect width="512" height="512" fill="${bg}" />` : ''}

  <!-- Scaled & Centered Flower Group (centered in 512x512 canvas, flower diameter is ~380px) -->
  <g transform="translate(256, 256) scale(3.8) translate(-50, -50)" filter="url(#softShadow)">
    <!-- Petal 1 (0 deg) -->
    <g transform="rotate(0 50 50)">
      <path d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Petal 2 (60 deg) -->
    <g transform="rotate(60 50 50)">
      <path d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Petal 3 (120 deg) -->
    <g transform="rotate(120 50 50)">
      <path d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Petal 4 (180 deg) -->
    <g transform="rotate(180 50 50)">
      <path d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Petal 5 (240 deg) -->
    <g transform="rotate(240 50 50)">
      <path d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Petal 6 (300 deg) -->
    <g transform="rotate(300 50 50)">
      <path d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z" fill="url(#petalGrad)" />
      <path d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z" fill="url(#highlightGrad)" />
    </g>

    <!-- Dark Brown Center Disc -->
    <path d="M 50 31 C 60.8 31 69 39.2 69 50 C 69 60.8 60.5 69 50 69 C 39.2 69 31 60.5 31 50 C 31 39.2 39.2 31 50 31 Z" fill="url(#centerGrad)" />

    <!-- Checkmark -->
    <path d="M 41.5 50.2 L 47.2 56 L 58.5 43.5" fill="none" stroke="#FFFFFF" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generate() {
  const publicDir = path.resolve('public');
  const svgContent = getSvg('#FEFBEC');

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'flower-logo.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

  for (const size of sizes) {
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.png`), pngBuffer);
  }

  // Generate apple-touch-icon.png (180x180)
  fs.copyFileSync(path.join(publicDir, 'icon-180x180.png'), path.join(publicDir, 'apple-touch-icon.png'));

  // Also write app_logo.png and overwrite app_logo.jpg
  fs.copyFileSync(path.join(publicDir, 'icon-512x512.png'), path.join(publicDir, 'app_logo.jpg'));

  console.log('Successfully generated all PWA icons with the Momentum Flower Logo!');
}

generate().catch(console.error);
