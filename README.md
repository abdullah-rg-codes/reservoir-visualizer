# reservoir-visualizer
Interactive SVG visualizer for reservoir water storage between elevation blocks. Built with vanilla JavaScript, HTML &amp; CSS. Input block heights, compute trapped water units, and watch the solution render in real-time. O(n) two-pointer approach. Zero dependencies.

## Algorithm

Uses the **two-pointer approach** — O(n) time, O(1) space.

### How it works

1. Two pointers start at both ends of the array.
2. The pointer on the shorter side moves inward.
3. Water at each position = `min(leftMax, rightMax) - height[i]`.
4. Accumulate positive differences as trapped water.

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
