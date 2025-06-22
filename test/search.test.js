import { expect } from 'chai';
import { performSearch } from '../docs/assets/js/search-logic.js';

describe('Search Logic', () => {
    const mockSearchIndex = [
        { title: 'Cloud Tactic 1', content: 'About cloud computing', tags: ['cloud', 'aws'], type: 'tactic' },
        { title: 'Edge Tactic 1', content: 'About edge devices', tags: ['edge', 'iot'], type: 'tactic' },
        { title: 'Cloud Tactic 2', content: 'More on aws services', tags: ['cloud', 'aws', 's3'], type: 'tactic' },
        { title: 'General IT', content: 'A book about general topics', tags: ['general'], type: 'tactic' },
        { title: 'Cloud Category', content: 'All about cloud', tags: [], type: 'category' }
    ];

    it('should return empty for queries less than 2 characters without tags', () => {
        const results = performSearch('a', new Set(), mockSearchIndex);
        expect(results).to.be.an('array').that.is.empty;
    });

    it('should filter by a simple text query', () => {
        const results = performSearch('edge', new Set(), mockSearchIndex);
        expect(results).to.have.lengthOf(1);
        expect(results[0].title).to.equal('Edge Tactic 1');
    });

    it('should filter by a single tag', () => {
        const results = performSearch('', new Set(['iot']), mockSearchIndex);
        expect(results).to.have.lengthOf(1);
        expect(results[0].title).to.equal('Edge Tactic 1');
    });

    it('should filter by multiple tags', () => {
        const results = performSearch('', new Set(['cloud', 'aws']), mockSearchIndex);
        expect(results).to.have.lengthOf(2);
    });

    it('should filter by both text query and tags', () => {
        const results = performSearch('services', new Set(['cloud']), mockSearchIndex);
        expect(results).to.have.lengthOf(1);
        expect(results[0].title).to.equal('Cloud Tactic 2');
    });

    it('should be case-insensitive', () => {
        const results = performSearch('EDGE', new Set(), mockSearchIndex);
        expect(results).to.have.lengthOf(1);
        expect(results[0].title).to.equal('Edge Tactic 1');
    });

    it('should return no results for a non-matching query', () => {
        const results = performSearch('nonexistent', new Set(), mockSearchIndex);
        expect(results).to.be.an('array').that.is.empty;
    });

    it('should return no results for a non-matching tag', () => {
        const results = performSearch('', new Set(['nonexistent']), mockSearchIndex);
        expect(results).to.be.an('array').that.is.empty;
    });

    it('should match query in title, content, or tags', () => {
        const resultsWithTitleMatch = performSearch('Tactic 1', new Set(), mockSearchIndex);
        expect(resultsWithTitleMatch.length).to.be.greaterThan(0);

        const resultsWithContentMatch = performSearch('general topics', new Set(), mockSearchIndex);
        expect(resultsWithContentMatch).to.have.lengthOf(1);

        const resultsWithTagMatch = performSearch('s3', new Set(), mockSearchIndex);
        expect(resultsWithTagMatch).to.have.lengthOf(1);
    });
}); 