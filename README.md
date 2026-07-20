# reservoir-visualizer
Interactive SVG visualizer for reservoir water storage between elevation blocks. Built with vanilla JavaScript, HTML & CSS. Input block heights, compute trapped water units, and watch the solution render in real-time. Prefix-Suffix approach. Zero dependencies.

## Algorithm

Uses the **Prefix-Suffix approach** — O(n) time, O(n) space.

### How it works

1. **Pre-compute leftMax[i]:** Maximum height from index 0 to i (inclusive)
2. **Pre-compute rightMax[i]:** Maximum height from index i to end (inclusive)
3. **Calculate waterLevel[i]:** For each position, `waterLevel[i] = min(leftMax[i], rightMax[i])`
4. **Compute trapped water:** Water at position i = `max(0, waterLevel[i] - height[i])`
5. **Build 2D grid:** Create visualization grid marking 'block', 'water', and 'empty' cells
6. **Sum total water:** Accumulate water units across all positions

### Why this approach?

- Single algorithm solves both water calculation and visualization
- Pre-computed arrays enable efficient grid rendering
- Explicitly tracks water position for SVG visualization
- Clean separation of concerns with clear algorithm steps

## Project Structure

```
water-tank/
├── index.html   — markup and layout
├── style.css    — all styling (dark theme, responsive)
├── script.js    — algorithm + SVG rendering logic
└── README.md    — this file
```

## Running locally

No build step needed — open `index.html` directly in a browser.

## Complexity

| | |
|---|---|
| Time  | O(n) |
| Space | O(1) |
| Algorithm | Two-pointer |
