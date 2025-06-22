import fs from 'fs-extra';
import matter from 'gray-matter';
import Ajv from 'ajv';
import path from 'path';
import schema from './tactic.field.json' with { type: 'json' };

const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(schema);

const inputDir = './docs/_posts';
const outputDir = './converted-tactics';

function fixDataToSchema(data, schema) {
    const fixed = { ...data };

    // Tags preservation logic
    if (typeof fixed.tags === 'string') {
        fixed.tags = fixed.tags.split(/[, ]+/).map(tag => tag.trim()).filter(Boolean);
    } else if (!Array.isArray(fixed.tags)) {
        fixed.tags = [];
    }

    // Categories preservation logic
    if (typeof fixed.categories === 'string') {
        fixed.categories = [fixed.categories];
    } else if (!Array.isArray(fixed.categories)) {
        fixed.categories = [];
    }

    // Fill in missing fields with schema defaults
    for (const [key, prop] of Object.entries(schema.properties)) {
        if (!(key in fixed) || fixed[key] === undefined || fixed[key] === null || fixed[key] === '') {
            fixed[key] = prop.default;
        }
    }
    return fixed;
}

function processDir(dir, relPath = '') {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDir(fullPath, path.join(relPath, file));
        } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(content);

            const fixedData = fixDataToSchema(data, schema);

            // Validate (should always pass now)
            if (!validate(fixedData)) {
                console.warn(`Still invalid after fixing: ${file}`, validate.errors);
            }

            // Output JSON
            const outDir = path.join(outputDir, relPath);
            fs.ensureDirSync(outDir);
            const outFile = path.join(outDir, file.replace(/\.(md|markdown)$/, '.json'));
            fs.writeJSONSync(outFile, fixedData, { spaces: 2 });
            console.log(`Converted and fixed: ${fullPath} -> ${outFile}`);
        }
    });
}

fs.ensureDirSync(outputDir);
processDir(inputDir);
console.log('All Markdown converted to JSON.');