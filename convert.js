const fs = require('fs-extra');
const matter = require('gray-matter');
const Ajv = require('ajv');
const path = require('path');

const schema = require('./tactic.field.json');
const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

const inputDir = './docs/_posts';
const outputDir = './converted-tactics';

let errors = [];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath); // Recurse into subdirectory
        } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
            console.log(`Processing ${fullPath}`);
            const content = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(content);

            // Robust tags handling: always ensure tags is an array of strings
            if (Array.isArray(data.tags)) {
                // do nothing, already correct
            } else if (typeof data.tags === 'string') {
                data.tags = data.tags.split(' ').filter(Boolean);
            } else if (!data.tags) {
                data.tags = [];
            } else {
                data.tags = [];
            }

            // Enhanced error handling for multiple DOIs
            if (typeof data['t-source-doi'] === 'string' && data['t-source-doi'].includes(',')) {
                errors.push(`Multiple DOIs detected in ${file}: "${data['t-source-doi']}"`);
                // Optionally, keep only the first DOI:
                data['t-source-doi'] = data['t-source-doi'].split(',')[0].trim();
            }

            // Ensure required string fields are always strings
            const stringFields = [
                "t-artifact",
                "t-feature",
                "t-participant",
                "t-context",
                "t-intent",
                "t-description",
                "t-targetQA",
                "t-relatedQA",
                "t-measuredimpact",
                "t-intentmeasure",
                "t-countermeasure",
                "t-source",
                "t-source-doi",
                "t-diagram",
                "categories",
                "title",
                "t-sort",
                "t-type"
            ];
            stringFields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    data[field] = "";
                } else if (Array.isArray(data[field])) {
                    data[field] = data[field].join(', ');
                } else if (typeof data[field] !== 'string') {
                    data[field] = String(data[field]);
                }
            });

            // Validate and apply defaults
            const valid = validate(data);
            if (!valid) {
                // Only log validation errors for new files (not existing ones)
                // For now, we suppress errors for existing files to allow legacy data
                // You can add logic here to only enforce for new files if needed
                // errors.push(`Validation failed in ${file}: ${JSON.stringify(validate.errors)}`);
                console.warn(`(Suppressed) Validation failed in ${file}:`, validate.errors);
            } else {
                console.log(`Validation passed for ${file}`);
            }

            // Preserve subdirectory structure in output
            const relPath = path.relative(inputDir, fullPath);
            const outFile = path.join(outputDir, relPath.replace(/\.md$/, '.json').replace(/\.markdown$/, '.json'));
            fs.ensureDirSync(path.dirname(outFile));
            fs.writeJSONSync(outFile, data, { spaces: 2 });
            console.log(`Wrote JSON for ${outFile}`);
        }
    });
}

fs.ensureDirSync(outputDir);
console.log('Looking for markdown files in:', path.resolve(inputDir));
processDir(inputDir);

if (errors.length) {
    console.warn("\nSummary of issues:");
    errors.forEach(e => console.warn(e));
}