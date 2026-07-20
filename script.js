/**
 * Two-pointer approach — O(n) time, O(1) space.
 * Matches the Java solution provided.
 *
 */
// ── DOM refs ─────────────────────────────────────────────────
const inputEl = document.getElementById("heightInput");
const solveBtn = document.getElementById("solveBtn");
const resultBadge = document.getElementById("resultBadge");
const resultValue = document.getElementById("resultValue");
const errorMsg = document.getElementById("errorMsg");

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

// ── UI helpers ────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
  resultBadge.classList.add('hidden');
  inputEl.classList.add('invalid');
}

function clearError() {
  errorMsg.classList.add('hidden');
  inputEl.classList.remove('invalid');
}

// ── Main solve flow ───────────────────────────────────────────
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

  // Show result
  resultValue.textContent = `${waterUnits} unit${waterUnits !== 1 ? 's' : ''}`;
  resultBadge.classList.remove('hidden');

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

// ── Run on load with default input ───────────────────────────
solve();