import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Resolve schema path relative to this file regardless of CJS/ESM execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../schema/generatorBundle.json');

// Lazily read & compile so consumer code can tree-shake if unused
let _validator;
function getValidator() {
  if (_validator) return _validator;
  const rawSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const ajv = new Ajv({
    allErrors: true,
    strict: false, // allow self-contained $ref within schema file
  });
  addFormats(ajv);
  _validator = ajv.compile(rawSchema);
  return _validator;
}

/**
 * Validate an object against the Generator Bundle JSON schema.
 * @param {unknown} bundle – JS object parsed from JSON
 * @returns {{ valid: boolean, errors: Ajv.ErrorObject[] | null | undefined }}
 */
export function validateGeneratorBundle(bundle) {
  const validate = getValidator();
  const valid = validate(bundle);
  return { valid, errors: validate.errors };
}

/** Convenience: throws with pretty message if invalid. */
export function assertValidGeneratorBundle(bundle) {
  const { valid, errors } = validateGeneratorBundle(bundle);
  if (!valid) {
    const msg = errors
      .map(e => `${e.instancePath || '/'} ${e.message}`)
      .join('\n');
    const error = new Error(`Invalid generator bundle:\n${msg}`);
    error.errors = errors;
    throw error;
  }
}
