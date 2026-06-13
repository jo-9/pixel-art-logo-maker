function cellSizeForGrid(gridSize) {
  return Math.min(56, Math.floor(420 / gridSize));
}

export function createEditor(gridEl, { onChange }) {
  let cells = [];
  let gridSize = 5;
  let tool = "draw";
  let focusR = 0;
  let focusC = 0;
  let isPainting = false;
  let strokeValue = null;

  function beginStroke(row, col) {
    cells[row][col] = !cells[row][col];
    strokeValue = cells[row][col];
    updateCellDom(row, col);
    onChange(cells);
  }

  function continueStroke(row, col) {
    if (strokeValue === null || cells[row][col] === strokeValue) return;
    cells[row][col] = strokeValue;
    updateCellDom(row, col);
    onChange(cells);
  }

  function updateCellDom(row, col) {
    const cell = gridEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;
    cell.classList.toggle("on", cells[row][col]);
    cell.classList.toggle("focused", row === focusR && col === focusC);
  }

  function updateFocusDom() {
    gridEl.querySelectorAll(".cell.focused").forEach((el) => el.classList.remove("focused"));
    const focused = gridEl.querySelector(`[data-row="${focusR}"][data-col="${focusC}"]`);
    if (focused) focused.classList.add("focused");
  }

  function bindCellEvents(cell, row, col) {
    cell.addEventListener("mousedown", (event) => {
      event.preventDefault();
      gridEl.focus();
      focusR = row;
      focusC = col;
      isPainting = true;
      beginStroke(row, col);
      updateFocusDom();
    });

    cell.addEventListener("mouseenter", () => {
      if (!isPainting) return;
      continueStroke(row, col);
    });

    cell.addEventListener("touchstart", (event) => {
      event.preventDefault();
      focusR = row;
      focusC = col;
      isPainting = true;
      beginStroke(row, col);
      updateFocusDom();
    }, { passive: false });

    cell.addEventListener("touchmove", (event) => {
      event.preventDefault();
      if (!isPainting) return;
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target || !target.classList.contains("cell")) return;
      const touchRow = Number.parseInt(target.dataset.row, 10);
      const touchCol = Number.parseInt(target.dataset.col, 10);
      continueStroke(touchRow, touchCol);
    }, { passive: false });
  }

  function render() {
    const cellPx = cellSizeForGrid(gridSize);
    gridEl.style.setProperty("--cell-size", `${cellPx}px`);
    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, var(--cell-size))`;
    gridEl.innerHTML = "";

    const fragment = document.createDocumentFragment();
    for (let r = 0; r < gridSize; r += 1) {
      for (let c = 0; c < gridSize; c += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.setAttribute("aria-label", `Cell ${r + 1}, ${c + 1}`);
        cell.classList.toggle("on", cells[r][c]);
        if (r === focusR && c === focusC) cell.classList.add("focused");
        bindCellEvents(cell, r, c);
        fragment.appendChild(cell);
      }
    }

    gridEl.appendChild(fragment);
  }

  function endStroke() {
    isPainting = false;
    strokeValue = null;
  }

  window.addEventListener("mouseup", endStroke);
  window.addEventListener("touchend", endStroke);
  window.addEventListener("touchcancel", endStroke);

  gridEl.addEventListener("keydown", (event) => {
    const { key } = event;
    if (key === "ArrowUp") {
      event.preventDefault();
      focusR = Math.max(0, focusR - 1);
      updateFocusDom();
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      focusR = Math.min(gridSize - 1, focusR + 1);
      updateFocusDom();
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      focusC = Math.max(0, focusC - 1);
      updateFocusDom();
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      focusC = Math.min(gridSize - 1, focusC + 1);
      updateFocusDom();
      return;
    }
    if (key === " " || key === "Enter") {
      event.preventDefault();
      cells[focusR][focusC] = !cells[focusR][focusC];
      updateCellDom(focusR, focusC);
      onChange(cells);
    }
  });

  return {
    setGrid(nextCells, nextSize) {
      cells = nextCells.map((row) => [...row]);
      gridSize = nextSize;
      focusR = Math.min(focusR, gridSize - 1);
      focusC = Math.min(focusC, gridSize - 1);
      render();
    },
    setTool(nextTool) {
      tool = nextTool;
    },
    getState() {
      return { cells, gridSize, tool, focusR, focusC };
    },
  };
}
