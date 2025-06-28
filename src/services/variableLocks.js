// Utilities for managing lockable variables used by the generators
// Provides factory to attach Locked/LockState objects to an app or engine
import { LOCKABLE_FIELDS } from '../constants.js';
const FIELD_LIST = Array.isArray(LOCKABLE_FIELDS) ? LOCKABLE_FIELDS : [];



export function createLockObjects() {
  const Locked = {};
  const LockState = {};
  FIELD_LIST.forEach(f => {
    Locked[f] = undefined;
    LockState[f] = false;
  });
  return { Locked, LockState };
}

export function toggleLock(lockState, field) {
  if (!FIELD_LIST.includes(field)) return;
  lockState[field] = !lockState[field];
}
