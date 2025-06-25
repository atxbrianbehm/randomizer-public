// Utilities for managing lockable variables used by the generators
// Provides factory to attach Locked/LockState objects to an app or engine

export const lockableFields = [
  'preacher_name',
  'divine_title',
  'platforms',
  'mediaContexts'
];

export function createLockObjects() {
  const Locked = {};
  const LockState = {};
  lockableFields.forEach(f => {
    Locked[f] = undefined;
    LockState[f] = false;
  });
  return { Locked, LockState };
}

export function toggleLock(lockState, field) {
  if (!lockableFields.includes(field)) return;
  lockState[field] = !lockState[field];
}
