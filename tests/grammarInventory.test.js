import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractPromptVisibleRules, loadJson, collectJsonFiles } from '@/../scripts/grammarInventory.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

/** Helper to create temporary directory with given files */
function setupTempFiles(structure) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
  for (const [rel, content] of Object.entries(structure)) {
    const full = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return tmpDir;
}

describe('grammarInventory helpers', () => {
  it('extractPromptVisibleRules merges grammar keys and variables', () => {
    const g = {
      grammar: { animal: [], origin: [] },
      variables: { fuel: {}, level: {} }
    };
    const rules = extractPromptVisibleRules(g);
    expect(rules).toEqual(['animal', 'fuel', 'level', 'origin']);
  });

  it('loadJson returns null and warns on parse error', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const tmpFile = path.join(os.tmpdir(), 'bad.json');
    fs.writeFileSync(tmpFile, '{ bad json', 'utf8');
    const res = loadJson(tmpFile);
    expect(res).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('collectJsonFiles finds nested .json files', () => {
    const dir = setupTempFiles({
      'a.json': '{}',
      'sub/b.json': '{}',
      'sub/nested/c.txt': 'ignore'
    });
    const files = collectJsonFiles(dir);
    expect(files.length).toBe(2);
    expect(files.every(f => f.endsWith('.json'))).toBe(true);
  });
});
