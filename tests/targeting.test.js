
import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';
import targetingGenerator from './test-generators/targeting-generator.json';

describe('RandomizerEngine Prompt Targeting', () => {
    let engine;

    beforeEach(() => {
        engine = new RandomizerEngine();
        engine.loadGenerator(targetingGenerator);
    });

    it('should generate a prompt for the midjourney target', () => {
        const result = engine.generate('targeting-test', { target: 'midjourney' });
        expect(result).toBe('A sleek android diplomat, cinematic lighting --quality 2 --ar 16:9');
    });

    it('should generate a prompt for the imagen target', () => {
        const result = engine.generate('targeting-test', { target: 'imagen' });
        expect(result).toBe('A cinematic lighting image of a A sleek android diplomat.');
    });

    it('should throw an error for an invalid target', () => {
        expect(() => engine.generate('targeting-test', { target: 'flux' })).toThrow("Target 'flux' not found in generator 'targeting-test'");
    });

    it('should fall back to the default entry point when no target is specified', () => {
        const result = engine.generate('targeting-test');
        expect(result).toBe('A sleek android diplomat');
    });

    it('should apply dynamic parameter mapping for midjourney target', () => {
        // Assuming 'high' quality is chosen by default due to single option
        const result = engine.generate('targeting-test', { target: 'midjourney' });
        expect(result).toBe('A sleek android diplomat, cinematic lighting --quality 2 --ar 16:9');
    });
});
