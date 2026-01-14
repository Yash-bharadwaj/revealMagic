import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google colors
const colors = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853'
};

function createGoogleGIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background circle (blue)
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = size * 0.22;
  const gapSize = size * 0.12;

  // Draw colored G sections
  // Blue section (top-left)
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, Math.PI * 1.25, Math.PI * 1.75);
  ctx.arc(centerX, centerY, innerRadius, Math.PI * 1.75, Math.PI * 1.25, true);
  ctx.closePath();
  ctx.fill();

  // Red section (top-right)
  ctx.fillStyle = colors.red;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.arc(centerX, centerY, innerRadius, -Math.PI * 0.25, -Math.PI * 0.75, true);
  ctx.closePath();
  ctx.fill();

  // Yellow section (bottom-right)
  ctx.fillStyle = colors.yellow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, -Math.PI * 0.25, Math.PI * 0.25);
  ctx.arc(centerX, centerY, innerRadius, Math.PI * 0.25, -Math.PI * 0.25, true);
  ctx.closePath();
  ctx.fill();

  // Green section (bottom-left)
  ctx.fillStyle = colors.green;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, Math.PI * 0.25, Math.PI * 0.75);
  ctx.arc(centerX, centerY, innerRadius, Math.PI * 0.75, Math.PI * 0.25, true);
  ctx.closePath();
  ctx.fill();

  // White overlay to create G shape
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner cutout
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // G opening (right side gap)
  ctx.fillStyle = colors.blue;
  ctx.fillRect(
    centerX + outerRadius * 0.4,
    centerY - gapSize / 2,
    outerRadius * 0.6,
    gapSize
  );

  return canvas;
}

// Generate icons
const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(size => {
  const canvas = createGoogleGIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated ${filename}`);
});

console.log('All icons generated successfully!');