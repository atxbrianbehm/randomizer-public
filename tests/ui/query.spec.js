import { describe, it, expect, beforeEach } from 'vitest';
import { q } from '../../src/ui/query.js';

// vitest runs with jsdom, so we can manipulate document

describe('q helper', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="foo"><span class="bar"></span></div>';
  });

  it('returns element for id selector', () => {
    const el = q('#foo');
    expect(el).not.toBeNull();
    expect(el.id).toBe('foo');
  });

  it('returns element for class selector', () => {
    const el = q('.bar');
    expect(el).not.toBeNull();
    expect(el.classList.contains('bar')).toBe(true);
  });

  it('returns null when not found', () => {
    const el = q('#does-not-exist');
    expect(el).toBeNull();
  });
});
