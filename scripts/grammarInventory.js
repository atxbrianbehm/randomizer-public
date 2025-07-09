#!/usr/bin/env node
/*
 * Grammar Inventory Script
 * ------------------------
 * Scans all generator JSON files in the ./generators directory and outputs a
 * Markdown table listing prompt-visible grammar rules per generator pack.
 *
 * Usage:  node scripts/grammarInventory.js > inventory.md
 *
 * The script assumes each generator JSON has the following shape:
 * {
 *   "grammar": { "ruleName": [ ... ], ... },
 *   "variables": { ... }
 * }
 */

import fs from 'fs';
import path from 'path';
import process from 'process';

const GENERATORS_DIR = path.resolve(process.cwd(), 'generators');

/** Recursively walk directory and collect .json files */
export function collectJsonFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(full, list);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      list.push(full);
    }
  }
  return list;
}

export function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[inventory] failed to parse ${filePath}:`, err.message);
    return null;
  }
}

export function extractPromptVisibleRules(generatorJson) {
  const grammarKeys = generatorJson.grammar ? Object.keys(generatorJson.grammar) : [];
  const variableKeys = generatorJson.variables ? Object.keys(generatorJson.variables) : [];
  // For now treat variables as rules too (they can appear via #var# tokens)
  return [...new Set([...grammarKeys, ...variableKeys])].sort();
}

export function main() {
  if (!fs.existsSync(GENERATORS_DIR)) {
    console.error('No generators directory found.');
    process.exit(1);
  }

  const files = collectJsonFiles(GENERATORS_DIR);
  if (files.length === 0) {
    console.error('No generator JSON files found.');
    process.exit(1);
  }

  // Markdown table header
  console.log('| Generator | Prompt-visible Rules | Count |');
  console.log('|-----------|----------------------|-------|');

  for (const file of files) {
    const json = loadJson(file);
    if (!json) continue;
    const rules = extractPromptVisibleRules(json);
    const name = json.metadata?.name || path.basename(file);
    console.log(`| ${name} | ${rules.join(', ')} | ${rules.length} |`);
  }
}

if (import.meta.url === process.argv[1] || import.meta.url.endsWith('grammarInventory.js')) {
  // only run when executed via CLI
  main();
}
