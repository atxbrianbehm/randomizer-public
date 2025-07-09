import { describe, it, expect, vi, beforeEach } from 'vitest';
import { log, warn, error, __setDev } from '@/utils/logger.js';

describe('utils/logger', () => {
  let logSpy, warnSpy, errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('emits messages in dev mode', () => {
    __setDev(true);
    log('hello');
    warn('caution');
    error('fail');
    expect(logSpy).toHaveBeenCalledWith('[LOG]', 'hello');
    expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'caution');
    expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'fail');
  });

  it('suppresses messages in prod mode', () => {
    __setDev(false);
    log('hello');
    warn('caution');
    error('fail');
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
