/**
 * Maximum amount of main-thread time, in milliseconds, that the scheduler
 * attempts to use during one pulse.
 *
 * This is a cooperative budget: a running job cannot be interrupted, so one
 * long-running job may exceed this limit.
 */
export const FRAME_BUDGET = 8;
