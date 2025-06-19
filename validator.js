const fs = require('fs-extra');
const matter = require('gray-matter');
const Ajv = require('ajv');
const path = require('path');

const schema = require('./tactic.field.json');
const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

// Use command-line argument for directory, or default to './docs/_new_posts'
const inputDir = process.argv[2] || './docs/_new_posts';
const categoriesDir = './docs/categories';

let errors = [];

// Get all valid category names (without .md extension)
const existingCategories = fs.readdirSync(categoriesDir)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/\.md$/, ''));

// List of required fields for each tactic type (strict for new posts)
const requiredFieldsAwesome = [
  'title', 't-sort', 't-type', 'categories', 't-description',
  't-participant', 't-artifact', 't-context', 't-feature', 't-intent', 't-source'
];

const requiredFieldsDark = [
  'title', 't-sort', 't-type', 'categories', 't-description',
  't-participant', 't-artifact', 't-context', 't-feature', 't-intent', 't-source'
];

// More lenient required fields for existing posts
const lenientRequiredFields = [
  'title', 't-sort', 't-type', 'categories', 't-description', 't-intent', 't-source'
];

function isEmpty(val) {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && val.trim() === '') ||
    (Array.isArray(val) && val.length === 0)
  );
}

function isEmptyStrict(val) {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && (val.trim() === '' || val.trim() === '<Unavailable>')) ||
    (Array.isArray(val) && val.length === 0)
  );
}

function processDir(dir) {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
        console.log(`Directory ${dir} does not exist, skipping validation.`);
        return;
    }

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const parsed = matter(content);
            const data = parsed.data;
            const body = parsed.content.trim();

            // Naming convention check
            const validNamePattern = /^\d{4}-\d{2}-\d{2}-.+\.(md|markdown)$/;
            if (!validNamePattern.test(file)) {
              errors.push(`File "${file}" does not follow the naming convention 'YYYY-MM-DD-title.md' as described in the README.`);
            }

            // Choose required fields based on whether this is a new post or existing post
            const isNewPost = dir.includes('_new_posts');
            const tSort = (data['t-sort'] || '').toLowerCase();
            
            let requiredFields;
            let isEmptyFunction;
            
            if (isNewPost) {
                // Strict validation for new posts
                requiredFields = tSort.includes('awesome') ? requiredFieldsAwesome : requiredFieldsDark;
                isEmptyFunction = isEmptyStrict;
            } else {
                // Lenient validation for existing posts
                requiredFields = lenientRequiredFields;
                isEmptyFunction = isEmpty;
            }

            requiredFields.forEach(field => {
                if (!(field in data) || isEmptyFunction(data[field])) {
                    errors.push(`Missing or empty required field "${field}" in ${file}`);
                }
            });

            // CATEGORY EXISTENCE CHECK
            if (data.categories) {
                let cats = data.categories;
                if (typeof cats === 'string') cats = [cats];
                if (Array.isArray(cats)) {
                    cats.forEach(cat => {
                        if (!existingCategories.includes(cat)) {
                            errors.push(`Category "${cat}" in ${file} does not exist in docs/categories/`);
                        }
                    });
                } else {
                    errors.push(`Categories field in ${file} is not a string or array`);
                }
            } else {
                errors.push(`No categories field found in ${file}`);
            }

            // Validate the raw data as parsed from YAML
            const valid = validate(data);
            if (!valid) {
                errors.push(`Schema validation failed in ${file}: ${JSON.stringify(validate.errors)}`);
            }
        }
    });
}

processDir(inputDir);

if (errors.length) {
    console.error(`Validation errors found in ${inputDir}:`);
    errors.forEach(e => console.error(e));
    process.exit(1); // Fail the script
} else {
    console.log(`All files in ${inputDir} are valid!`);
} 