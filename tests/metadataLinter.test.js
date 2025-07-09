import { describe, it, expect, vi } from 'vitest';
import { ruleHasMeta, validateMeta, lintGenerator } from '@/../scripts/metadataLinter.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

function tmpFile(name, json) {
  const file = path.join(os.tmpdir(), `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(json), 'utf8');
  return file;
}

describe('metadataLinter helpers', () => {
  it('ruleHasMeta returns true when array contains meta object', () => {
    const rule = [{ _meta: { slot: 'subject', priority: 1 } }, 'foo'];
    expect(ruleHasMeta(rule)).toBe(true);
  });

  it('ruleHasMeta returns false when meta missing required fields', () => {
    const rule = [{ _meta: { slot: 'subject' } }, 'foo'];
    expect(ruleHasMeta(rule)).toBe(false);
  });

  it('lintGenerator returns errors for missing meta', () => {
    const gen = {
      grammar: {
        good: [{ _meta: { slot: 'x', priority: 1 } }, 'a'],
        bad: ['no meta']
      }
    };
    const file = tmpFile('genTest', gen);
    const errs = lintGenerator(file);
    expect(errs.length).toBe(1);
    expect(errs[0]).toContain("bad");
  });
});
