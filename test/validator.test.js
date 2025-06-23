import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { validateAllPosts, isEmpty, isEmptyStrict } from '../validator.js';

describe('Validator Logic', () => {
    const testDir = path.resolve(process.cwd(), 'test-temp-docs');
    const postsDir = path.join(testDir, '_posts');
    const newPostsDir = path.join(testDir, '_new_posts');
    const categoriesDir = path.join(testDir, 'categories');

    beforeAll(() => {
        // Ensure clean state before tests
        fs.removeSync(testDir);
        fs.ensureDirSync(postsDir);
        fs.ensureDirSync(newPostsDir);
        fs.ensureDirSync(categoriesDir);

        // Create valid category files
        fs.writeFileSync(path.join(categoriesDir, 'cat1.md'), 'Category 1');
        fs.writeFileSync(path.join(categoriesDir, 'cat2.md'), 'Category 2');

        // Create valid post files
        const awesomePostContent = `---
title: Awesome Tactic 1
t-sort: Awesome
t-type: Awesome
categories: [cat1]
tags: [tag1]
t-description: "A description"
t-participant: "A participant"
t-artifact: "An artifact"
t-context: "A context"
t-feature: "A feature"
t-intent: "An intent"
t-source: "A source"
---
Content`;
        fs.writeFileSync(path.join(postsDir, '2022-01-01-awesome-tactic.md'), awesomePostContent);

        const darkPostContent = `---
title: Dark Tactic 1
t-sort: Dark
t-type: Dark
categories: [cat2]
tags: [tag2]
t-description: "A description"
t-participant: "A participant"
t-artifact: "An artifact"
t-context: "A context"
t-feature: "A feature"
t-intent: "An intent"
t-source: "A source"
---
Content`;
        fs.writeFileSync(path.join(newPostsDir, '2022-01-02-dark-tactic.md'), darkPostContent);
    });

    afterAll(() => {
        fs.removeSync(testDir);
    });

    it('should validate all correct tactic files without errors', () => {
        const errors = validateAllPosts([postsDir, newPostsDir], categoriesDir);
        expect(errors).toEqual([]);
    });

    // Tests for isEmpty
    it('isEmpty should return true for null or undefined', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
    });

    it('isEmpty should return true for empty strings or arrays', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('   ')).toBe(true);
        expect(isEmpty([])).toBe(true);
    });

    it('isEmpty should return false for non-empty strings or arrays', () => {
        expect(isEmpty('hello')).toBe(false);
        expect(isEmpty([1])).toBe(false);
    });

    // Tests for isEmptyStrict
    it('isEmptyStrict should return true for null or undefined', () => {
        expect(isEmptyStrict(null)).toBe(true);
        expect(isEmptyStrict(undefined)).toBe(true);
    });

    it('isEmptyStrict should return true for empty strings, arrays, or <Unavailable>', () => {
        expect(isEmptyStrict('')).toBe(true);
        expect(isEmptyStrict('   ')).toBe(true);
        expect(isEmptyStrict([])).toBe(true);
        expect(isEmptyStrict('<Unavailable>')).toBe(true);
    });
    
    it('isEmptyStrict should return false for non-empty strings or arrays', () => {
        expect(isEmptyStrict('hello')).toBe(false);
        expect(isEmptyStrict([1])).toBe(false);
        expect(isEmptyStrict([null])).toBe(false); // An array with null is not empty
    });
}); 