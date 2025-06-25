// Utilities for managing lockable variables used by the generators
// Provides factory to attach Locked/LockState objects to an app or engine
import { LOCKABLE_FIELDS } from '../constants.js';



export function createLockObjects() {
  const Locked = {};
  const LockState = {};
  LOCKABLE_FIELDS.forEach(f => {
    Locked[f] = undefined;
    LockState[f] = false;
  });
  return { Locked, LockState };
}

export function toggleLock(lockState, field) {
  if (!LOCKABLE_FIELDS.includes(field)) return;
  lockState[field] = !lockState[field];
}
