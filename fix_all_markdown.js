const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const schema = require('./tactic.field.json');

const POSTS_DIR = path.join(__dirname, 'docs', '_posts');

// Helper function to ensure array fields are properly formatted
function ensureArray(val) {
    if (Array.isArray(val)) {
        return val.map(item => item.trim()).filter(Boolean);
    }
    if (typeof val === 'string') {
        return val.split(/[, ]+/).map(item => item.trim()).filter(Boolean);
    }
    return [];
}

// Helper function to ensure string fields are properly formatted
function ensureString(val) {
    if (typeof val === 'string') {
        return val.trim();
    }
    return schema.properties[field].default;
}

function fixFrontMatter(data) {
    const fixed = {};
    
    // Process each field according to the schema
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (fieldSchema.type === 'array') {
            fixed[field] = ensureArray(data[field] || []);
        } else {
            fixed[field] = ensureString(data[field]);
        }
    }

    return fixed;
}

function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    // Fix the frontmatter
    const fixedData = fixFrontMatter(parsed.data);
    
    // Create new content with fixed frontmatter
    const newContent = matter.stringify(parsed.content.trim(), fixedData, {
        // Ensure consistent YAML formatting
        lineWidth: -1, // No line wrapping
        noRefs: true,  // No YAML references
        noCompatMode: true // No compatibility mode
    });

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return;
    }

    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
            processFile(fullPath);
        }
    });
}

// Run the fix
console.log('Starting to fix all markdown files...');
walkDir(POSTS_DIR);
console.log('Finished fixing all markdown files.'); 