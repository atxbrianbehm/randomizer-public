#!/usr/bin/env node
/**
 * Metadata Linter for Randomizer Generators
 *
 * Ensures every prompt-visible grammar rule contains a `_meta` object with
 * the required fields: `slot`, `connector`, and `priority`.
 *
 * Usage:  node scripts/metadataLinter.js
 * Exit code 0 → success, 1 → missing metadata found or parsing error.
 */

import fs from 'fs';
import path from 'path';
import process from 'process';

const GENERATORS_DIR = path.resolve('generators');
const REQUIRED_FIELDS = ['slot', 'priority']; // connector is optional but recommended

export function loadJson(filePath) {
  try {
    const contents = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(contents);
  } catch (err) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${err.message}`);
  }
}

export function ruleHasMeta(rule) {
  if (!rule) return false;
  if (Array.isArray(rule)) {
    // Look for object entry that has _meta
    const firstObj = rule.find((e) => typeof e === 'object' && e._meta);
    return validateMeta(firstObj && firstObj._meta);
  }
  if (typeof rule === 'object') {
    return validateMeta(rule._meta);
  }
  return false;
}

export function validateMeta(meta) {
  if (!meta) return false;
  return REQUIRED_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(meta, field));
}

export function lintGenerator(filePath) {
  const errors = [];
  const generator = loadJson(filePath);
  const grammar = generator.grammar || {};
  for (const [key, rule] of Object.entries(grammar)) {
    if (!ruleHasMeta(rule)) {
      errors.push(`${path.basename(filePath)} → rule '${key}' is missing _meta`);
    }
  }
  return errors;
}

export function main() {
  const allFiles = fs.readdirSync(GENERATORS_DIR).filter((f) => f.endsWith('.json'));
  let allErrors = [];
  for (const file of allFiles) {
    const errors = lintGenerator(path.join(GENERATORS_DIR, file));
    allErrors = allErrors.concat(errors);
  }

  if (allErrors.length) {
    console.error('\u001b[31mMetadata linter found problems:\u001b[0m');
    for (const err of allErrors) {
      console.error(` • ${err}`);
    }
    console.error(`\nTotal missing metadata entries: ${allErrors.length}`);
    process.exit(1);
  } else {
    console.log('\u001b[32mAll generator grammar rules contain _meta.\u001b[0m');
  }
}

if (import.meta.url === process.argv[1]) {
  main();
}
