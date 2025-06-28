// Utilities for managing lockable variables used by the generators
// Provides factory to attach Locked/LockState objects to an app or engine
export function createLockObjects(lockableRules = []) {
  const Locked = {};
  const LockState = {};
  lockableRules.forEach(f => {
    Locked[f] = undefined;
    LockState[f] = false;
  });
  return { Locked, LockState };
}

export function toggleLock(lockState, field) {
  // This function might need to be re-evaluated if FIELD_LIST is truly gone.
  // For now, assuming lockState will contain all relevant fields.
  if (lockState[field] === undefined) return; // Field not initialized as lockable
  lockState[field] = !lockState[field];
}
