import { bbox } from "./grid.js";

export const EXPORT_SIZE = 512;
export const TARGET_MARGIN = 90;

export function renderToCanvas(cells, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  const bounds = bbox(cells);
  if (!bounds) return;

  const bboxW = bounds.maxC - bounds.minC + 1;
  const bboxH = bounds.maxR - bounds.minR + 1;
  const maxDim = Math.max(bboxW, bboxH);

  const available = EXPORT_SIZE - TARGET_MARGIN * 2;
  const cellPx = Math.max(1, Math.floor(available / maxDim));
  const logoW = bboxW * cellPx;
  const logoH = bboxH * cellPx;

  const offsetX = Math.floor((EXPORT_SIZE - logoW) / 2);
  const offsetY = Math.floor((EXPORT_SIZE - logoH) / 2);

  ctx.fillStyle = "#ffffff";
  for (let r = bounds.minR; r <= bounds.maxR; r += 1) {
    for (let c = bounds.minC; c <= bounds.maxC; c += 1) {
      if (!cells[r][c]) continue;
      const x = offsetX + (c - bounds.minC) * cellPx;
      const y = offsetY + (r - bounds.minR) * cellPx;
      ctx.fillRect(x, y, cellPx, cellPx);
    }
  }
}

export function downloadPng(cells, filename = "logo.png") {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  renderToCanvas(cells, canvas);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      resolve(true);
    }, "image/png");
  });
}