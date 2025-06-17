const fs = require('fs-extra');
const matter = require('gray-matter');
const Ajv = require('ajv');
const path = require('path');

const schema = require('./tactic.field.json');
const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

const inputDir = './docs/_new_posts';
const categoriesDir = './docs/categories';

let errors = [];

// Get all valid category names (without .md extension)
const existingCategories = fs.readdirSync(categoriesDir)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/\.md$/, ''));

// List of required fields (from your schema or business logic)
const requiredFields = [
  'title',
  't-sort',
  't-type',
  'categories',
  't-description',
  't-participant',
  't-artifact',
  't-context',
  't-feature',
  't-intent',
  't-intentmeasure',
  't-countermeasure',
  't-source',
  't-source-doi',
  't-diagram'
];

function isEmpty(val) {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && (val.trim() === '' || val.trim() === '<Unavailable>')) ||
    (Array.isArray(val) && val.length === 0)
  );
}

function processDir(dir) {
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

            // Check for required fields and non-empty values
            requiredFields.forEach(field => {
                if (!(field in data) || isEmpty(data[field])) {
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

            // Check for non-empty content after front matter
            if (!body || body.length === 0) {
                errors.push(`No content found after front matter in ${file}`);
            }
        }
    });
}

processDir(inputDir);

if (errors.length) {
    console.error("Validation errors found in new files:");
    errors.forEach(e => console.error(e));
    process.exit(1); // Fail the script
} else {
    console.log("All new files are valid!");
}