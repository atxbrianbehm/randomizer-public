import { describe, it, expect } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

function segmentsFor(promptText) {
  // naive split into words as dummy segments for perf test
  return promptText.split(' ').map((w, i) => ({ key: `w${i}`, text: w }));
}

describe('buildReadablePrompt performance', () => {
  const engine = new RandomizerEngine();
  // minimal generator, no meta lookup during ordering (skip overhead) – we only test function speed
  const gen = {
    metadata: { name: 'bench' },
    grammar: { dummy: ['x'] },
    entry_points: { default: 'dummy' }
  };
  engine.loadGenerator(gen);

  const segs = [
    { key: 'a', text: 'console' },
    { key: 'b', text: 'with' },
    { key: 'c', text: 'blinking' },
    { key: 'd', text: 'lights' }
  ];

  it('rewrites 1000 prompts under 20ms', () => {
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
      engine.buildReadablePrompt('bench', segs);
    }
    const duration = performance.now() - t0;
    console.log('rewrite 1000 duration', duration);
    expect(duration).toBeLessThan(20);
  });
});
