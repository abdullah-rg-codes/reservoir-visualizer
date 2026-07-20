// ── Core algorithm ────────────────────────────────────────────
/**
 * Two-pointer approach — O(n) time, O(1) space.
 *
 * @param {number[]} height
 * @returns {number} total units of water trapped
 */
function trap(height) {
  let result   = 0;
  const n      = height.length;
  if (n < 1) return result;

  let left     = 0;
  let right    = n - 1;
  let leftMax  = height[left];
  let rightMax = height[right];

  while (left < right) {
    if (leftMax < rightMax) {
      left++;
      leftMax  = Math.max(leftMax, height[left]);
      result  += leftMax - height[left];
    } else {
      right--;
      rightMax = Math.max(rightMax, height[right]);
      result  += rightMax - height[right];
    }
  }
  return result;
}