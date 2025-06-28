
import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

describe('RandomizerEngine Conditional Logic', () => {
    let engine;

    beforeEach(() => {
        engine = new RandomizerEngine();
    });

    const generator = {
        metadata: {
            name: 'conditional-test'
        },
        variables: {
            x: { type: 'number', default: 10 },
            y: { type: 'number', default: 20 },
            z: { type: 'string', default: 'a' }
        },
        grammar: {
            test_and: {
                type: 'conditional',
                options: [
                    {
                        text: 'AND_SUCCESS',
                        conditions: {
                            '$and': [
                                { x: { '$eq': 10 } },
                                { y: { '$gt': 15 } }
                            ]
                        }
                    }
                ],
                fallback: 'AND_FALLBACK'
            },
            test_or: {
                type: 'conditional',
                options: [
                    {
                        text: 'OR_SUCCESS',
                        conditions: {
                            '$or': [
                                { x: { '$eq': 5 } },
                                { y: { '$gt': 15 } }
                            ]
                        }
                    }
                ],
                fallback: 'OR_FALLBACK'
            },
            test_not: {
                type: 'conditional',
                options: [
                    {
                        text: 'NOT_SUCCESS',
                        conditions: {
                            '$not': {
                                z: { '$eq': 'b' }
                            }
                        }
                    }
                ],
                fallback: 'NOT_FALLBACK'
            },
            test_nested: {
                type: 'conditional',
                options: [
                    {
                        text: 'NESTED_SUCCESS',
                        conditions: {
                            '$and': [
                                { x: { '$eq': 10 } },
                                { '$or': [
                                    { y: { '$eq': 20 } },
                                    { z: { '$eq': 'c' } }
                                ]}
                            ]
                        }
                    }
                ],
                fallback: 'NESTED_FALLBACK'
            }
        },
        entry_points: {
            default: 'test_and'
        }
    };

    it('should handle $and operator correctly', async () => {
        await engine.loadGenerator(generator);
        const result = engine.generate('conditional-test', { entryPoint: 'test_and' });
        expect(result).toBe('AND_SUCCESS');
    });

    it('should handle $or operator correctly', async () => {
        await engine.loadGenerator(generator);
        const result = engine.generate('conditional-test', { entryPoint: 'test_or' });
        expect(result).toBe('OR_SUCCESS');
    });

    it('should handle $not operator correctly', async () => {
        await engine.loadGenerator(generator);
        const result = engine.generate('conditional-test', { entryPoint: 'test_not' });
        expect(result).toBe('NOT_SUCCESS');
    });

    it('should handle nested operators correctly', async () => {
        await engine.loadGenerator(generator);
        const result = engine.generate('conditional-test', { entryPoint: 'test_nested' });
        expect(result).toBe('NESTED_SUCCESS');
    });
});
