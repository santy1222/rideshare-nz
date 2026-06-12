// Recompone el logo vertical (auto arriba, texto abajo) en layout horizontal (auto + texto al lado)
import sharp from "sharp";

const src = process.argv[2];
const out = "C:/Users/Lapes/rideshare-nz/public/logo.png";

// Recortar y hacer transparente el fondo, a resolución completa
const trimmed = await sharp(src).trim({ threshold: 10 }).png().toBuffer();
const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

for (let i = 0; i < data.length; i += 4) {
  const min = Math.min(data[i], data[i + 1], data[i + 2]);
  if (min >= 245) data[i + 3] = 0;
  else if (min >= 230) data[i + 3] = Math.round(((245 - min) / 15) * 255);
}

// Buscar la franja horizontal transparente más grande (separación auto/texto)
const rowOpaque = [];
for (let y = 0; y < H; y++) {
  let count = 0;
  for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 20) count++;
  rowOpaque.push(count);
}
let bestGapStart = -1, bestGapLen = 0, gapStart = -1;
for (let y = Math.floor(H * 0.2); y < H * 0.95; y++) {
  if (rowOpaque[y] === 0) {
    if (gapStart === -1) gapStart = y;
    const len = y - gapStart + 1;
    if (len > bestGapLen) { bestGapLen = len; bestGapStart = gapStart; }
  } else gapStart = -1;
}
if (bestGapStart === -1) { console.error("No encontré separación entre auto y texto"); process.exit(1); }
const splitY = bestGapStart + Math.floor(bestGapLen / 2);
console.log(`Separación detectada en y=${splitY} (imagen ${W}x${H})`);

const base = sharp(data, { raw: { width: W, height: H, channels: 4 } }).png();
const carBuf = await base.clone().extract({ left: 0, top: 0, width: W, height: splitY }).trim({ threshold: 1 }).toBuffer();
const textBuf = await base.clone().extract({ left: 0, top: splitY, width: W, height: H - splitY }).trim({ threshold: 1 }).toBuffer();

const car = await sharp(carBuf).metadata();
const text = await sharp(textBuf).metadata();

// Lienzo horizontal: auto a la izquierda, texto al lado, centrado verticalmente
const gap = Math.round(car.height * 0.08);
const canvasH = Math.max(car.height, text.height);
const canvasW = car.width + gap + text.width;

const result = await sharp({
  create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: carBuf, left: 0, top: Math.round((canvasH - car.height) / 2) },
    { input: textBuf, left: car.width + gap, top: Math.round((canvasH - text.height) / 2) },
  ])
  .png()
  .toBuffer();

const final = await sharp(result).resize({ height: 240 }).png({ compressionLevel: 9 }).toFile(out);
console.log(`Generado ${out}: ${final.width}x${final.height}, ${(final.size / 1024).toFixed(0)}KB`);
