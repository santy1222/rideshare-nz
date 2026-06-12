// Procesa un logo: recorta bordes blancos, fondo blanco -> transparente, reduce y guarda en public/logo.png
// Uso: node scripts/process-logo.mjs "<ruta-imagen-origen>"
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("Falta la ruta de la imagen de origen");
  process.exit(1);
}
const out = new URL("../public/logo.png", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const trimmed = await sharp(src).trim({ threshold: 10 }).png().toBuffer();
const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Fondo blanco -> transparente, con rampa para los bordes anti-aliased
for (let i = 0; i < data.length; i += 4) {
  const min = Math.min(data[i], data[i + 1], data[i + 2]);
  if (min >= 245) data[i + 3] = 0;
  else if (min >= 230) data[i + 3] = Math.round(((245 - min) / 15) * 255);
}

const result = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ height: 240 })
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`Generado ${out}: ${result.width}x${result.height}, ${(result.size / 1024).toFixed(0)}KB`);
