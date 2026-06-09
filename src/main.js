import {
  PRESET_SIZES,
  DEFAULT_SEED_OPTIONS,
  clampSize,
  clearGrid,
  generateSymmetricalPattern,
  invertGrid,
  scaleGrid,
} from "./grid.js";
import { downloadPng, renderToCanvas } from "./export.js";
import { createEditor } from "./editor.js";

const gridSizeSelect = document.getElementById("grid-size");
const customSizeInput = document.getElementById("custom-size");
const gridEl = document.getElementById("grid");
const previewCanvas = document.getElementById("preview");
const regenBtn = document.getElementById("regen-btn");
const regenMenuBtn = document.getElementById("regen-menu-btn");
const regenMenu = document.getElementById("regen-menu");
const seedOptionInputs = [...document.querySelectorAll("[data-seed-option]")];
const clearBtn = document.getElementById("clear-btn");
const invertBtn = document.getElementById("invert-btn");
const exportBtn = document.getElementById("export-btn");
const toolButtons = [...document.querySelectorAll(".tool-btn")];

let gridSize = PRESET_SIZES[0];
let seedOptions = { ...DEFAULT_SEED_OPTIONS };

function readSeedOptions() {
  const next = { ...DEFAULT_SEED_OPTIONS };
  seedOptionInputs.forEach((input) => {
    const key = input.dataset.seedOption;
    if (key in next) next[key] = input.checked;
  });
  return next;
}

function regen() {
  seedOptions = readSeedOptions();
  setCells(generateSymmetricalPattern(gridSize, seedOptions), gridSize);
}

let cells = generateSymmetricalPattern(gridSize, seedOptions);

function updatePreview() {
  renderToCanvas(cells, previewCanvas);
}

function setCells(nextCells, nextSize = gridSize) {
  cells = nextCells;
  gridSize = nextSize;
  editor.setGrid(cells, gridSize);
  updatePreview();
}

const editor = createEditor(gridEl, {
  onChange(nextCells) {
    cells = nextCells;
    updatePreview();
  },
});

function isCustomMode() {
  return gridSizeSelect.value === "custom";
}

function readSelectedSize() {
  if (isCustomMode()) {
    return clampSize(customSizeInput.value);
  }
  return clampSize(gridSizeSelect.value);
}

function syncCustomInputVisibility() {
  const showCustom = isCustomMode();
  customSizeInput.hidden = !showCustom;
  if (showCustom) customSizeInput.focus();
}

function syncSelectForSize(size) {
  const preset = String(size);
  if (PRESET_SIZES.includes(size)) {
    gridSizeSelect.value = preset;
    customSizeInput.hidden = true;
    return;
  }
  gridSizeSelect.value = "custom";
  customSizeInput.value = String(size);
  customSizeInput.hidden = false;
}

function applyGridSize(nextSize) {
  const clamped = clampSize(nextSize);
  if (clamped === gridSize) return;
  const scaled = scaleGrid(cells, gridSize, clamped);
  setCells(scaled, clamped);
  syncSelectForSize(clamped);
}

function setRegenMenuOpen(open) {
  regenMenu.hidden = !open;
  regenMenuBtn.setAttribute("aria-expanded", String(open));
}

gridSizeSelect.addEventListener("change", () => {
  syncCustomInputVisibility();
  applyGridSize(readSelectedSize());
});

customSizeInput.addEventListener("change", () => {
  if (!isCustomMode()) return;
  applyGridSize(readSelectedSize());
});

customSizeInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  applyGridSize(readSelectedSize());
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toolButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    editor.setTool(button.dataset.tool);
  });
});

regenBtn.addEventListener("click", regen);

regenMenuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  setRegenMenuOpen(regenMenu.hidden);
});

seedOptionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    seedOptions = readSeedOptions();
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".regen-split")) return;
  setRegenMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setRegenMenuOpen(false);
});

clearBtn.addEventListener("click", () => {
  setCells(clearGrid(gridSize), gridSize);
});

invertBtn.addEventListener("click", () => {
  setCells(invertGrid(cells), gridSize);
});

exportBtn.addEventListener("click", () => {
  downloadPng(cells);
});

setCells(cells, gridSize);
editor.setTool("draw");
gridEl.focus();