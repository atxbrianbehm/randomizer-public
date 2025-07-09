import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateGeneratorBundle } from '../src/utils/validateGeneratorBundle.js';

const fixturePath = path.resolve(
  __dirname,
  'test-generators/minimal_bundle.json',
);

function loadFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
}

describe('GeneratorBundle schema validation', () => {
  it('accepts a valid minimal bundle', () => {
    const bundle = loadFixture();
    const { valid, errors } = validateGeneratorBundle(bundle);
    if (!valid) console.error(errors);
    expect(valid).toBe(true);
  });

  it('fails when entry_points.default is missing', () => {
    const bundle = loadFixture();
    delete bundle.entry_points.default;
    const { valid } = validateGeneratorBundle(bundle);
    expect(valid).toBe(false);
  });

  it('fails when grammar key is invalid format', () => {
    const bundle = loadFixture();
    bundle.grammar['invalid-key!'] = ['oops'];
    const { valid } = validateGeneratorBundle(bundle);
    expect(valid).toBe(false);
  });
});
