const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIRS = [
  path.join(__dirname, 'docs', '_posts'),
  path.join(__dirname, 'docs', '_new_posts')
];

// Define your required fields and their defaults
const requiredFields = {
  layout: 'tactic',
  title: '<Unavailable>',
  tags: [],
  't-sort': '<Unavailable>',
  't-type': '<Unavailable>',
  categories: [],
  't-description': '<Unavailable>',
  't-participant': '<Unavailable>',
  't-artifact': '<Unavailable>',
  't-context': '<Unavailable>',
  't-feature': '<Unavailable>',
  't-intent': '<Unavailable>',
  't-targetQA': '<Unavailable>',
  't-relatedQA': '<Unavailable>',
  't-measuredimpact': '<Unavailable>',
  't-source': '<Unavailable>',
  't-source-doi': '<Unavailable>',
  't-diagram': '<Unavailable>',
  't-intentmeasure': '<Unavailable>',
  't-countermeasure': '<Unavailable>',
};

function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') return [val];
  return [];
}

function fixFrontMatter(data) {
  const fixed = { ...data };
  // Ensure all required fields exist
  for (const [key, def] of Object.entries(requiredFields)) {
    if (!(key in fixed) || fixed[key] === undefined || fixed[key] === null || fixed[key] === '') {
      fixed[key] = def;
    }
  }
  // Ensure tags and categories are arrays
  fixed.tags = ensureArray(fixed.tags);
  fixed.categories = ensureArray(fixed.categories);
  return fixed;
}

function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.md', '.markdown'].includes(ext)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  const fixedData = fixFrontMatter(parsed.data);
  const newContent = matter.stringify(parsed.content.trim(), fixedData);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  });
}

// Run for all post directories
POSTS_DIRS.forEach(walkDir);

console.log('All markdown files fixed to match schema.');