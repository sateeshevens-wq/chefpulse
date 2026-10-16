import fs from 'fs';
import zlib from 'zlib';

// Helper to create a valid uncompressed / raw uncompressed deflate PNG file
function createPng(width, height, drawPixel) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data: for each scanline, filter byte (0) followed by RGBA pixels
  const rawScanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawScanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLength;
    rawData[rowOffset] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function drawChefPulse(x, y, w, h, maskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: Deep obsidian (#0f0f11)
  let r = 16, g = 16, b = 20, a = 255;

  // Outer border if not maskable
  if (!maskable) {
    const margin = 0.05;
    if (nx < margin || nx > 1 - margin || ny < margin || ny > 1 - margin) {
      // Rounded corner check
      const cx = nx < 0.5 ? margin : 1 - margin;
      const cy = ny < 0.5 ? margin : 1 - margin;
      const dist = Math.hypot(nx - cx, ny - cy);
      if (dist > 0.08) {
        return [0, 0, 0, 0];
      }
    }
  }

  // Chef Hat Silhouette in center (ny between 0.22 and 0.58, nx between 0.25 and 0.75)
  // Crown circles
  const c1 = Math.hypot(nx - 0.5, ny - 0.32);
  const c2 = Math.hypot(nx - 0.38, ny - 0.38);
  const c3 = Math.hypot(nx - 0.62, ny - 0.38);

  const isHatCrown = (c1 < 0.16) || (c2 < 0.13) || (c3 < 0.13);
  const isHatBase = (nx >= 0.36 && nx <= 0.64 && ny >= 0.42 && ny <= 0.55);
  const isHatBand = (nx >= 0.34 && nx <= 0.66 && ny >= 0.55 && ny <= 0.62);

  if (isHatCrown || isHatBase) {
    // Warm Amber / Golden gradient (#f59e0b -> #fbbf24)
    r = 245;
    g = Math.floor(158 + (ny - 0.2) * 50);
    b = 11;
  } else if (isHatBand) {
    // Bright Gold brim
    r = 251;
    g = 191;
    b = 36;
  }

  // Heartbeat pulse wave line (ny between 0.68 and 0.82)
  // Line segments approximation
  const pulseY = (px) => {
    if (px < 0.25 || px > 0.75) return 0.75;
    if (px >= 0.25 && px < 0.38) return 0.75;
    if (px >= 0.38 && px < 0.44) return 0.75 - (px - 0.38) * 1.5; // up
    if (px >= 0.44 && px < 0.50) return 0.66 + (px - 0.44) * 3.0; // down
    if (px >= 0.50 && px < 0.56) return 0.84 - (px - 0.50) * 4.0; // sharp peak up
    if (px >= 0.56 && px < 0.62) return 0.60 + (px - 0.56) * 3.0; // down
    if (px >= 0.62 && px < 0.68) return 0.78 - (px - 0.62) * 0.5; // bounce
    return 0.75;
  };

  const targetY = pulseY(nx);
  const distToPulse = Math.abs(ny - targetY);
  if (distToPulse < 0.018 && nx >= 0.15 && nx <= 0.85) {
    r = 253;
    g = 224;
    b = 71; // Glowing pulse yellow
  }

  return [r, g, b, a];
}

// Generate icons
fs.mkdirSync('./public', { recursive: true });

console.log('Generating PWA icons...');
fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, (x, y, w, h) => drawChefPulse(x, y, w, h, false)));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, (x, y, w, h) => drawChefPulse(x, y, w, h, false)));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, (x, y, w, h) => drawChefPulse(x, y, w, h, true)));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, (x, y, w, h) => drawChefPulse(x, y, w, h, false)));

// Generate a 32x32 favicon.ico (or PNG)
fs.writeFileSync('./public/favicon.ico', createPng(32, 32, (x, y, w, h) => drawChefPulse(x, y, w, h, false)));
console.log('All PWA icons generated in /public successfully!');
