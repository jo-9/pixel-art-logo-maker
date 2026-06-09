export const PRESET_SIZES = [5, 8, 10, 16];
export const MIN_SIZE = 2;
export const MAX_SIZE = 64;

export const DEFAULT_SEED_OPTIONS = {
  none: true,
  horizontal: true,
  vertical: true,
  diagonal: true,
  swirl: true,
  colorInvert: true,
};

export function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

export function cloneGrid(cells) {
  return cells.map((row) => [...row]);
}

export function scaleGrid(cells, oldSize, newSize) {
  const next = createEmptyGrid(newSize);
  for (let r = 0; r < newSize; r += 1) {
    for (let c = 0; c < newSize; c += 1) {
      const oldR = Math.floor((r * oldSize) / newSize);
      const oldC = Math.floor((c * oldSize) / newSize);
      next[r][c] = cells[oldR][oldC];
    }
  }
  return next;
}

export function setCell(cells, row, col, value) {
  const size = cells.length;
  if (row < 0 || col < 0 || row >= size || col >= size) return cells;
  const next = cloneGrid(cells);
  next[row][col] = value;
  return next;
}

export function clearGrid(size) {
  return createEmptyGrid(size);
}

export function invertGrid(cells) {
  return cells.map((row) => row.map((cell) => !cell));
}

export function bbox(cells) {
  const size = cells.length;
  let minR = size;
  let minC = size;
  let maxR = -1;
  let maxC = -1;

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!cells[r][c]) continue;
      minR = Math.min(minR, r);
      minC = Math.min(minC, c);
      maxR = Math.max(maxR, r);
      maxC = Math.max(maxC, c);
    }
  }

  if (maxR < 0) return null;
  return { minR, minC, maxR, maxC };
}

function mirrorHorizontal(cells, size) {
  const next = cloneGrid(cells);
  const half = Math.floor(size / 2);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < half; c += 1) {
      next[r][size - 1 - c] = next[r][c];
    }
  }
  return next;
}

function mirrorVertical(cells, size) {
  const next = cloneGrid(cells);
  const half = Math.floor(size / 2);
  for (let r = 0; r < half; r += 1) {
    next[size - 1 - r] = [...next[r]];
  }
  return next;
}

function mirrorDiagonal(cells, size) {
  const next = cloneGrid(cells);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (r !== c) next[c][r] = next[r][c];
    }
  }
  return next;
}

function mirrorHorizontalColorInvert(cells, size) {
  const next = cloneGrid(cells);
  const half = Math.floor(size / 2);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < half; c += 1) {
      next[r][size - 1 - c] = !next[r][c];
    }
  }
  return next;
}

function mirrorVerticalColorInvert(cells, size) {
  const next = cloneGrid(cells);
  const half = Math.floor(size / 2);
  for (let r = 0; r < half; r += 1) {
    for (let c = 0; c < size; c += 1) {
      next[size - 1 - r][c] = !next[r][c];
    }
  }
  return next;
}

function mirrorHorizontalSwirl(cells, size) {
  const next = mirrorHorizontal(cells, size);
  const half = Math.floor(size / 2);
  const rightStart = Math.ceil(size / 2);

  for (let c = rightStart; c < size; c += 1) {
    for (let r = 0; r < half; r += 1) {
      const mirrorR = size - 1 - r;
      const tmp = next[r][c];
      next[r][c] = next[mirrorR][c];
      next[mirrorR][c] = tmp;
    }
  }

  return next;
}

function mirrorVerticalSwirl(cells, size) {
  const next = mirrorVertical(cells, size);
  const half = Math.floor(size / 2);
  const bottomStart = Math.ceil(size / 2);

  for (let r = bottomStart; r < size; r += 1) {
    for (let c = 0; c < half; c += 1) {
      const mirrorC = size - 1 - c;
      const tmp = next[r][c];
      next[r][c] = next[r][mirrorC];
      next[r][mirrorC] = tmp;
    }
  }

  return next;
}

function seedRandom(cells, size, density, region) {
  const half = Math.ceil(size / 2);
  const next = cloneGrid(cells);

  if (region === "full") {
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (Math.random() < density) next[r][c] = true;
      }
    }
    return next;
  }

  if (region === "left") {
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < half; c += 1) {
        if (Math.random() < density) next[r][c] = true;
      }
    }
    return next;
  }

  if (region === "top") {
    for (let r = 0; r < half; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (Math.random() < density) next[r][c] = true;
      }
    }
    return next;
  }

  if (region === "quadrant") {
    for (let r = 0; r < half; r += 1) {
      for (let c = 0; c < half; c += 1) {
        if (Math.random() < density) next[r][c] = true;
      }
    }
    return next;
  }

  if (region === "diagonal") {
    for (let r = 0; r < size; r += 1) {
      for (let c = r; c < size; c += 1) {
        if (Math.random() < density) next[r][c] = true;
      }
    }
    return next;
  }

  return next;
}

function applyMode(cells, size, mode) {
  switch (mode) {
    case "none":
      return cells;
    case "horizontal":
      return mirrorHorizontal(cells, size);
    case "vertical":
      return mirrorVertical(cells, size);
    case "both":
      return mirrorVertical(mirrorHorizontal(cells, size), size);
    case "diagonal":
      return mirrorDiagonal(cells, size);
    case "swirlHorizontal":
      return mirrorHorizontalSwirl(cells, size);
    case "swirlVertical":
      return mirrorVerticalSwirl(cells, size);
    case "colorInvertHorizontal":
      return mirrorHorizontalColorInvert(cells, size);
    case "colorInvertVertical":
      return mirrorVerticalColorInvert(cells, size);
    default:
      return cells;
  }
}

export function buildEnabledModes(options) {
  const modes = [];

  if (options.none) modes.push("none");
  if (options.horizontal) modes.push("horizontal");
  if (options.vertical) modes.push("vertical");
  if (options.horizontal && options.vertical) modes.push("both");
  if (options.diagonal) modes.push("diagonal");
  if (options.swirl) {
    modes.push("swirlHorizontal", "swirlVertical");
  }
  if (options.colorInvert) {
    modes.push("colorInvertHorizontal", "colorInvertVertical");
  }

  return modes;
}

function seedRegionForMode(mode) {
  switch (mode) {
    case "none":
      return "full";
    case "horizontal":
    case "swirlHorizontal":
    case "colorInvertHorizontal":
      return "left";
    case "vertical":
    case "swirlVertical":
    case "colorInvertVertical":
      return "top";
    case "both":
      return "quadrant";
    case "diagonal":
      return "diagonal";
    default:
      return "full";
  }
}

export function generateSymmetricalPattern(size, options = DEFAULT_SEED_OPTIONS) {
  const density = 0.28 + Math.random() * 0.22;
  const enabledModes = buildEnabledModes(options);
  const mode = enabledModes[Math.floor(Math.random() * enabledModes.length)] ?? "none";

  let cells = createEmptyGrid(size);
  cells = seedRandom(cells, size, density, seedRegionForMode(mode));
  cells = applyMode(cells, size, mode);

  if (!bbox(cells)) {
    const center = Math.floor(size / 2);
    cells[center][center] = true;
    cells = applyMode(cells, size, mode);
  }

  return cells;
}

export function clampSize(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return PRESET_SIZES[0];
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, parsed));
}