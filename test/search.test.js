import { describe, it, expect } from 'vitest';
import { performSearch } from '../docs/assets/js/search-logic.js';

describe('Search Logic', () => {
    const mockSearchIndex = [
        { title: 'Cloud Tactic 1', content: 'About cloud computing', tags: ['cloud', 'aws'], type: 'tactic' },
        { title: 'Edge Tactic 1', content: 'About edge computing', tags: ['edge', 'iot'], type: 'tactic' },
        { title: 'Another Cloud Tactic', content: 'More on aws', tags: ['cloud', 'aws'], type: 'tactic' }
    ];

    it('should return all items when query is empty and no tags are selected', () => {
        const results = performSearch('', new Set(), mockSearchIndex);
        expect(results).toHaveLength(3);
    });

    it('should filter by a single search query', () => {
        const results = performSearch('edge', new Set(), mockSearchIndex);
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Edge Tactic 1');
    });

    it('should filter by a tag', () => {
        const selectedTags = new Set(['aws']);
        const results = performSearch('', selectedTags, mockSearchIndex);
        expect(results).toHaveLength(2);
    });

    it('should filter by both query and tag', () => {
        const selectedTags = new Set(['cloud']);
        const results = performSearch('tactic 1', selectedTags, mockSearchIndex);
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Cloud Tactic 1');
    });

    it('should be case-insensitive', () => {
        const results = performSearch('CLOUD', new Set(), mockSearchIndex);
        expect(results).toHaveLength(2);
    });

    it('should return an empty array for no matches', () => {
        const results = performSearch('nonexistent', new Set(), mockSearchIndex);
        expect(results).toEqual([]);
    });
    
    it('should match query in title', () => {
        const results = performSearch('another', new Set(), mockSearchIndex);
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Another Cloud Tactic');
    });

    it('should match query in content', () => {
        const results = performSearch('edge', new Set(), mockSearchIndex);
        expect(results).toHaveLength(1);
        expect(results[0].content).toContain('edge');
    });

    it('should match query in tags', () => {
        const results = performSearch('edge', new Set(), mockSearchIndex);
        expect(results).toHaveLength(1);
    });
}); 