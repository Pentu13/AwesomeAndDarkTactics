const fs = require('fs-extra');
const matter = require('gray-matter');
const Ajv = require('ajv');
const path = require('path');

const schema = require('./tactic.field.json');
const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

const inputDir = './docs/_new_posts';

let errors = [];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(content);

            // DO NOT normalize types before validation!
            // Only do minimal pre-processing if absolutely necessary (e.g., YAML quirks)
            // For tags, if you want to allow both array and space-separated string in YAML:
            // But for strict validation, comment out the following block:
            
            if (Array.isArray(data.tags)) {
                // ok
            } else if (typeof data.tags === 'string') {
                data.tags = data.tags.split(' ').filter(Boolean);
            } else {
                data.tags = [];
            }
            

            // Validate the raw data as parsed from YAML
            const valid = validate(data);
            if (!valid) {
                errors.push(`Validation failed in ${file}: ${JSON.stringify(validate.errors)}`);
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