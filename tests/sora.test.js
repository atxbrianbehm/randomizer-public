
import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';
import targetingGenerator from './test-generators/targeting-generator.json';

describe('RandomizerEngine Sora Video Logic', () => {
    let engine;

    beforeEach(() => {
        engine = new RandomizerEngine();
        engine.loadGenerator(targetingGenerator);
    });

    it('should generate a video prompt for the sora target with custom joiners', () => {
        const result = engine.generate('targeting-test', { target: 'sora' });
        expect(result).toBe('A desolate cityscape at dusk. a lone figure walks slowly, then the camera pans across the skyline. the city lights begin to flicker');
    });
});
