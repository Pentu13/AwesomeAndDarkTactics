import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { validateAllPosts, isEmpty, isEmptyStrict } from '../validator.js';

describe('Validator', () => {
    const testDir = path.join('AwesomeAndDarkTactics', 'test', 'test-data');
    const postsDir = path.join(testDir, 'docs', '_posts');
    const newPostsDir = path.join(testDir, 'docs', '_new_posts');
    const categoriesDir = path.join(testDir, 'docs', 'categories');

    before(() => {
        // Create test directories
        fs.ensureDirSync(postsDir);
        fs.ensureDirSync(newPostsDir);
        fs.ensureDirSync(categoriesDir);

        // Create a dummy category file
        fs.writeFileSync(path.join(categoriesDir, 'cloud-computing.md'), '---\n---\n');
    });

    after(() => {
        // Clean up test directories
        fs.removeSync(testDir);
    });

    afterEach(() => {
        // Clear posts directories after each test
        fs.emptyDirSync(postsDir);
        fs.emptyDirSync(newPostsDir);
    });

    describe('isEmpty and isEmptyStrict', () => {
        it('isEmpty should return true for empty values', () => {
            expect(isEmpty(undefined)).to.be.true;
            expect(isEmpty(null)).to.be.true;
            expect(isEmpty('')).to.be.true;
            expect(isEmpty('  ')).to.be.true;
            expect(isEmpty([])).to.be.true;
        });

        it('isEmpty should return false for non-empty values', () => {
            expect(isEmpty('a')).to.be.false;
            expect(isEmpty(['a'])).to.be.false;
            expect(isEmpty(0)).to.be.false;
        });

        it('isEmptyStrict should return true for empty or <Unavailable> values', () => {
            expect(isEmptyStrict('<Unavailable>')).to.be.true;
            expect(isEmptyStrict('  <Unavailable>  ')).to.be.true;
        });
    });

    describe('File Validation Logic', () => {
        it('should return no errors for a valid awesome tactic file', () => {
            const validPostPath = path.join(newPostsDir, '2022-01-01-valid-awesome-tactic.md');
            const validPostContent = `---
title: Valid Awesome Tactic
t-sort: awesome
t-type: "Tactic"
categories: ["cloud-computing"]
t-description: "A valid description."
t-participant: "Developer"
t-artifact: "Code"
t-context: "Development"
t-feature: "Performance"
t-intent: "To be valid."
t-source: "A book"
---
Body content`;
            fs.writeFileSync(validPostPath, validPostContent);
            const errors = validateAllPosts([newPostsDir], categoriesDir);
            expect(errors).to.be.an('array').that.is.empty;
        });

        it('should return an error for invalid file naming convention', () => {
            const invalidPostPath = path.join(postsDir, 'invalid-name.md');
            fs.writeFileSync(invalidPostPath, 'DUMMY CONTENT');
            const errors = validateAllPosts([postsDir], categoriesDir);
            expect(errors).to.not.be.empty;
            expect(errors[0]).to.include("does not follow the naming convention");
        });

        it('should return an error for a missing required field', () => {
            const invalidPostPath = path.join(newPostsDir, '2022-01-01-missing-field.md');
            const invalidPostContent = `---
title: Missing Field
t-sort: dark
t-type: "Tactic"
categories: ["cloud-computing"]
# t-description is missing
t-participant: ["User"]
t-artifact: ["UI"]
t-context: ["Production"]
t-feature: ["Usability"]
t-intent: "To be invalid."
t-source: ["A paper"]
---
Body content`;
            fs.writeFileSync(invalidPostPath, invalidPostContent);
            const errors = validateAllPosts([newPostsDir], categoriesDir);
            expect(errors).to.not.be.empty;
            expect(errors[0]).to.include('Missing or empty required field: "t-description"');
        });

        it('should return an error for a non-existing category', () => {
            const invalidPostPath = path.join(postsDir, '2022-01-01-invalid-category.md');
            const invalidPostContent = `---
title: Invalid Category
t-sort: awesome
t-type: "Tactic"
categories: ["non-existing-category"]
t-description: "A description"
t-intent: "To be invalid."
t-source: ["A website"]
---
Body content`;
            fs.writeFileSync(invalidPostPath, invalidPostContent);
            const errors = validateAllPosts([postsDir], categoriesDir);
            expect(errors).to.not.be.empty;
            expect(errors[0]).to.include('Category "non-existing-category" does not exist');
        });

        it('should return a schema validation error for an invalid field type', () => {
            const invalidPostPath = path.join(postsDir, '2022-01-01-schema-error.md');
            const invalidPostContent = `---
title: Schema Error
t-sort: awesome
t-type: "Tactic"
categories: ["cloud-computing"]
t-description: "A description"
t-intent: "To be invalid."
t-source: "A website"
t-smell: "This is an extra field"
---
Body content`;
            fs.writeFileSync(invalidPostPath, invalidPostContent);
            const errors = validateAllPosts([postsDir], categoriesDir);
            expect(errors.some(e => e.includes("must NOT have additional properties"))).to.be.true;
        });
    });
}); 