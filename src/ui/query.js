// Tiny DOM query helper to shorten verbose calls and keep them centralised.
// Usage: import { q } from '@/ui/query.js';
// Example: const btn = q('#generate-btn');

export function q(selector, context = document) {
  return context.querySelector(selector);
}
