import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate icons from app_Icon.PNG
const sizes = [32, 192, 512];
const publicDir = path.join(__dirname, '..', 'public');
const sourceImagePath = path.join(publicDir, 'app_Icon.PNG');

async function generateIcons() {
  try {
    // Load the source image
    const sourceImage = await loadImage(sourceImagePath);
    console.log(`Loaded source image: ${sourceImage.width}x${sourceImage.height}`);

    // Generate icons for each required size
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Draw the source image scaled to fit the canvas
      ctx.drawImage(sourceImage, 0, 0, size, size);

      const buffer = canvas.toBuffer('image/png');
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(publicDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`Generated ${filename}`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();