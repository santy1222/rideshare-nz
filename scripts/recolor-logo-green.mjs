// Recolorea los píxeles verdes del logo al verde EXACTO de la marca (#1D9E75 = brand-500).
// El texto es color plano: el anti-aliasing lo maneja el canal alfa, así que se asigna
// el RGB exacto sin conservar la luminosidad original.
import sharp from "sharp";

const file = "C:/Users/Lapes/rideshare-nz/public/logo.png";

// brand-500 #1D9E75
const BRAND_RGB = [0x1d, 0x9e, 0x75];

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) return [l * 255, l * 255, l * 255].map(Math.round);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
}

const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

let changed = 0;
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0) continue;
  const [h, s] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
  // rango de verdes (60°-180°) con saturación apreciable Y verde dominante en
  // términos absolutos (excluye el ruido verdoso de los píxeles casi negros)
  const greenDominance = data[i + 1] - Math.max(data[i], data[i + 2]);
  if (h >= 60 / 360 && h <= 180 / 360 && s > 0.15 && greenDominance > 30) {
    data[i] = BRAND_RGB[0]; data[i + 1] = BRAND_RGB[1]; data[i + 2] = BRAND_RGB[2];
    changed++;
  }
}

const result = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(file);

console.log(`Recoloreados ${changed} píxeles → ${info.width}x${info.height}, ${(result.size / 1024).toFixed(0)}KB`);
