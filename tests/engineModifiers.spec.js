import { describe, it, expect } from 'vitest';
import RandomizerEngine from '../RandomizerEngine.js';

describe('RandomizerEngine modifiers', () => {
  const engine = new RandomizerEngine();

  it('capitalize modifier capitalizes first letter', () => {
    expect(engine.applyModifiers('hello world', ['capitalize'])).toBe('Hello world');
  });

  it('a_an modifier chooses correct article', () => {
    expect(engine.applyModifiers('banana', ['a_an'])).toBe('a banana');
    expect(engine.applyModifiers('apple', ['a_an'])).toBe('an apple');
  });

  it('plural modifier adds s or ies as needed', () => {
    expect(engine.applyModifiers('car', ['plural'])).toBe('cars');
    expect(engine.applyModifiers('baby', ['plural'])).toBe('babies');
    expect(engine.applyModifiers('buses', ['plural'])).toBe('buses');
  });

  it('chains multiple modifiers', () => {
    const result = engine.applyModifiers('apple', ['plural', 'capitalize']);
    expect(result).toBe('Apples');
  });
});
