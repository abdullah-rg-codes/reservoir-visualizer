// Constants 
const CELL_SIZE   = 36;   // px — width & height of each grid cell
const CELL_GAP    = 2;    // px — gap between cells
const COLORS = {
  block:   '#1e293b',
  water:   '#0ea5e9',
  waterFg: 'rgba(14,165,233,0.18)',
  empty:   '#f5f7fa',
  border:  '#d0d7e5',
};

// DOM refs
const inputEl = document.getElementById('heightInput');
const solveBtn = document.getElementById('solveBtn');
const svgWrapper = document.getElementById('svgWrapper');
const resultBadge = document.getElementById('resultBadge');
const resultValue = document.getElementById('resultValue');
const errorMsg = document.getElementById('errorMsg');
const legend = document.getElementById('legend');

function parseInput(raw) {
  const parts = raw.trim().split(',');

  if (parts.length < 2) {
    return { heights: [], error: 'Enter at least two values.' };
  }

  const heights = [];
  for (const part of parts) {
    const val = Number(part.trim());
    if (!Number.isInteger(val) || val < 0) {
      return { heights: [], error: `"${part.trim()}" is not a valid non-negative integer.` };
    }
    heights.push(val);
  }

  return { heights, error: null };
}

function trap(height) {
  let result = 0;
  const n = height.length;
  if (n < 1) return result;

  let left = 0;
  let right = n - 1;
  let leftMax = height[left];
  let rightMax = height[right];

  while (left < right) {
    if (leftMax < rightMax) {
      left++;
      leftMax = Math.max(leftMax, height[left]);
      result += leftMax - height[left];
    } else {
      right--;
      rightMax = Math.max(rightMax, height[right]);
      result += rightMax - height[right];
    }
  }
  return result;
}

/**
 * Build a 2D grid showing cell types for SVG rendering.
 * Each cell is one of: 'block' | 'water' | 'empty'
 *
 * @param {number[]} heights
 * @returns {{ grid: string[][], maxH: number, waterUnits: number }}
 */
function buildGrid(heights) {
  const maxH = Math.max(...heights);
  const cols = heights.length;

  // leftMax[i]  = max height to the left  of i (inclusive)
  // rightMax[i] = max height to the right of i (inclusive)
  const leftMax  = new Array(cols).fill(0);
  const rightMax = new Array(cols).fill(0);

  leftMax[0]        = heights[0];
  rightMax[cols - 1]= heights[cols - 1];

  for (let i = 1; i < cols; i++) {
    leftMax[i] = Math.max(leftMax[i - 1], heights[i]);
  }
  for (let i = cols - 2; i >= 0; i--) {
    rightMax[i] = Math.max(rightMax[i + 1], heights[i]);
  }

  // waterLevel[i] = how high water sits at column i
  const waterLevel = heights.map((h, i) => Math.min(leftMax[i], rightMax[i]));

  // Build grid row by row (row 0 = top)
  // grid[row][col] → 'block' | 'water' | 'empty'
  const grid = [];
  for (let row = 0; row < maxH; row++) {
    const rowHeight = maxH - row;         // which height level this row represents
    const cells = heights.map((h, col) => {
      if (rowHeight <= h)               return 'block';
      if (rowHeight <= waterLevel[col]) return 'water';
      return 'empty';
    });
    grid.push(cells);
  }

  const waterUnits = trap(heights);
  return { grid, maxH, waterUnits };
}

/**
 * Render SVG visualization
 * @param {string[][]} grid
 * @param {number[]}   heights original height array
 * @returns {string} SVG markup
 */
function renderSVG(grid, heights) {
  const rows      = grid.length;
  const cols      = heights.length;
  const cellStep  = CELL_SIZE + CELL_GAP;

  // Reserve left margin for Y-axis labels
  const labelW    = 28;
  const svgW      = labelW + cols * cellStep - CELL_GAP + 4;
  const svgH      = rows * cellStep - CELL_GAP + 28; // +28 for X-axis labels

  const ns = 'http://www.w3.org/2000/svg';

  let rects = '';

  // Grid cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = grid[r][c];
      const x    = labelW + c * cellStep;
      const y    = r * cellStep;
      let fill   = COLORS.empty;
      let stroke = COLORS.border;

      if (type === 'block') {
        fill   = COLORS.block;
        stroke = '#2a3f5a';
      } else if (type === 'water') {
        fill   = COLORS.water;
        stroke = 'rgba(14,165,233,0.4)';
      }

      rects += `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"
        fill="${fill}" stroke="${stroke}" stroke-width="1" rx="2"/>`;
    }
  }

  // Y-axis labels (height numbers on the left)
  let yLabels = '';
  for (let r = 0; r < rows; r++) {
    const heightVal = rows - r;
    const y = r * cellStep + CELL_SIZE / 2 + 4;
    yLabels += `<text x="${labelW - 6}" y="${y}" text-anchor="end"
      font-size="10" fill="${COLORS.border}" font-family="monospace">${heightVal}</text>`;
  }

  // X-axis labels (column index below grid)
  let xLabels = '';
  for (let c = 0; c < cols; c++) {
    const x = labelW + c * cellStep + CELL_SIZE / 2;
    const y = rows * cellStep + 16;
    xLabels += `<text x="${x}" y="${y}" text-anchor="middle"
      font-size="10" fill="${COLORS.border}" font-family="monospace">${heights[c]}</text>`;
  }

  return `<svg xmlns="${ns}" viewBox="0 0 ${svgW} ${svgH}"
    aria-label="Water tank visualisation" role="img">
    <title>Water tank grid</title>
    ${yLabels}
    ${rects}
    ${xLabels}
  </svg>`;
}

// UI helpers
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
  resultBadge.classList.add('hidden');
  legend.classList.add('hidden');
  inputEl.classList.add('invalid');
  svgWrapper.innerHTML = '<p class="placeholder-text">Fix the input to see the visualisation</p>';
}

function clearError() {
  errorMsg.classList.add('hidden');
  inputEl.classList.remove('invalid');
}

// Main solve flow
function solve() {
  clearError();

  const { heights, error } = parseInput(inputEl.value);
  if (error) {
    showError(error);
    return;
  }

  const { grid, maxH, waterUnits } = buildGrid(heights);

  // Edge: all same height → no water
  if (maxH === 0) {
    showError('All block heights are 0 — no water can be stored.');
    return;
  }

  // Render SVG
  svgWrapper.innerHTML = renderSVG(grid, heights);

  // Show result
  resultValue.textContent = `${waterUnits} unit${waterUnits !== 1 ? 's' : ''}`;
  resultBadge.classList.remove('hidden');
  legend.classList.remove('hidden');

  // Subtle animation on result
  resultBadge.style.animation = 'none';
  requestAnimationFrame(() => {
    resultBadge.style.animation = '';
  });
}

solveBtn.addEventListener('click', solve);

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') solve();
});

// Prevent alphabets and special characters — only allow numbers and commas
inputEl.addEventListener('input', (e) => {
  const cleaned = e.target.value.replace(/[^0-9,]/g, '');
  if (e.target.value !== cleaned) {
    e.target.value = cleaned;
  }
});

// Quick-example buttons
document.querySelectorAll('.btn-example').forEach((btn) => {
  btn.addEventListener('click', () => {
    inputEl.value = btn.dataset.value;
    solve();
  });
});

//load with default input
solve();
