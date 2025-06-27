import { describe, it, expect } from 'vitest';
import RandomizerEngine from '../RandomizerEngine.js';

describe('Built-in text modifiers', () => {
  const engine = new RandomizerEngine();

  it('capitalize converts first character to uppercase', () => {
    expect(engine.applyModifiers('banana', ['capitalize'])).toBe('Banana');
  });

  it('a_an prefixes a or an based on vowel sound', () => {
    expect(engine.applyModifiers('banana', ['a_an'])).toBe('a banana');
    expect(engine.applyModifiers('apple', ['a_an'])).toBe('an apple');
  });

  it('plural pluralises common nouns', () => {
    expect(engine.applyModifiers('cat', ['plural'])).toBe('cats');
    expect(engine.applyModifiers('dress', ['plural'])).toBe('dress'); // ends with s, unchanged
    expect(engine.applyModifiers('baby', ['plural'])).toBe('babies');
  });

  it('chains modifiers in order', () => {
    expect(engine.applyModifiers('monkey', ['plural', 'capitalize'])).toBe('Monkeys');
  });
});
