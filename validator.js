// Minor change to trigger workflow
// Adding another line to test the workflow trigger.

import fs from 'fs-extra';
import matter from 'gray-matter';
import Ajv from 'ajv';
import path from 'path';
import schema from './tactic.field.json' with { type: 'json' };

const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

const postDirs = ['./docs/_posts', './docs/_new_posts'];
const categoriesDir = './docs/categories';

// Required fields definitions
const requiredFieldsAwesome = [
  'title', 't-sort', 't-type', 'categories', 't-description',
  't-participant', 't-artifact', 't-context', 't-feature', 't-intent', 't-source'
];
const requiredFieldsDark = [
  'title', 't-sort', 't-type', 'categories', 't-description',
  't-participant', 't-artifact', 't-context', 't-feature', 't-intent', 't-source'
];
const lenientRequiredFields = [
  'title', 't-sort', 't-type', 'categories', 't-description', 't-intent', 't-source'
];

export function isEmpty(val) {
  return val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
}

export function isEmptyStrict(val) {
  return val === undefined || val === null || (typeof val === 'string' && (val.trim() === '' || val.trim() === '<Unavailable>')) || (Array.isArray(val) && val.length === 0);
}

export function validateFile(fullPath, existingCategories, errors = []) {
    const file = path.basename(fullPath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`File ${fullPath} does not exist, skipping.`);
        return errors;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data;

    const validNamePattern = /^\d{4}-\d{2}-\d{2}-.+\.(md|markdown)$/;
    if (!validNamePattern.test(file)) {
      errors.push(`[${file}] File does not follow the naming convention 'YYYY-MM-DD-title.md'.`);
    }

    const isNewPost = fullPath.includes('docs/_new_posts');
    const tSort = (data['t-sort'] || '').toLowerCase();
    
    let requiredFields = isNewPost ? (tSort.includes('awesome') ? requiredFieldsAwesome : requiredFieldsDark) : lenientRequiredFields;
    let isEmptyFunction = isNewPost ? isEmptyStrict : isEmpty;

    requiredFields.forEach(field => {
        if (!(field in data) || isEmptyFunction(data[field])) {
            errors.push(`[${file}] Missing or empty required field: "${field}".`);
        }
    });

    if (data.categories) {
        let cats = Array.isArray(data.categories) ? data.categories : [data.categories];
        cats.forEach(cat => {
            if (!existingCategories.includes(cat)) {
                errors.push(`[${file}] Category "${cat}" does not exist in docs/categories/.`);
            }
        });
    } else {
        errors.push(`[${file}] No categories field found.`);
    }

    const valid = validate(data);
    if (!valid) {
        errors.push(`[${file}] Schema validation failed: ${ajv.errorsText(validate.errors)}`);
    }
    return errors;
}

function processDir(dir, existingCategories, errors) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory ${dir} does not exist, skipping validation.`);
        return;
    }
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath, existingCategories, errors);
        } else if (fullPath.endsWith('.md') || fullPath.endsWith('.markdown')) {
            validateFile(fullPath, existingCategories, errors);
        }
    });
}

export function validateAllPosts(dirs, catDir) {
    const errors = [];
    const existingCategories = fs.readdirSync(catDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace(/\.md$/, ''));

    dirs.forEach(dir => processDir(dir, existingCategories, errors));
    return errors;
}

// --- Main Logic ---
if (process.argv[1] === new URL(import.meta.url).pathname) {
    console.log("Validating all posts in 'docs/_posts' and 'docs/_new_posts'...");
    const errors = validateAllPosts(postDirs, categoriesDir);

    if (errors.length) {
        console.error("\nValidation failed. Please fix the following errors:");
        errors.forEach(e => console.error(`- ${e}`));
        process.exit(1);
    } else {
        console.log("\nValidation successful!");
    }
} 