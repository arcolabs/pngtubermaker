// Credit configuration constants — no DB imports.
// Client components must import from here (not ./credits) so the server-only
// pg driver never enters the browser bundle.

/** Credits granted per subscription tier per month */
export const TIER_CREDITS = {
  free: 0,
  creator: 6_000,
} as const;

/** Credit costs per task type */
export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
  reference_sheet: 200,
} as const;
