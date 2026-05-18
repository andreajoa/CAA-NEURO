const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fundo azul
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, size, size);

  // Círculo branco central
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Texto "CAA"
  ctx.fillStyle = '#2563eb';
  ctx.font = `bold ${size * 0.18}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CAA', cx, cy - size * 0.04);

  ctx.font = `bold ${size * 0.1}px Arial`;
  ctx.fillText('Neuro', cx, cy + size * 0.14);

  return canvas.toBuffer('image/png');
}

fs.writeFileSync('public/icon-192.png', generateIcon(192));
fs.writeFileSync('public/icon-512.png', generateIcon(512));
console.log('✅ Ícones gerados: icon-192.png e icon-512.png');
