const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const newPostsDir = './docs/_new_posts';
const tagsDir = './docs/tags';

// Get all existing tag names
const existingTags = new Set(
  fs.readdirSync(tagsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
);

// Collect all tags from new posts
const newTags = new Set();
fs.readdirSync(newPostsDir).forEach(file => {
  if (!file.endsWith('.md')) return;
  const content = fs.readFileSync(path.join(newPostsDir, file), 'utf8');
  const { data } = matter(content);
  let tags = data.tags;
  if (typeof tags === 'string') tags = tags.split(/[, ]+/).filter(Boolean);
  if (Array.isArray(tags)) tags.forEach(tag => newTags.add(tag));
});

// Create missing tag files
newTags.forEach(tag => {
  if (!existingTags.has(tag)) {
    const tagFile = path.join(tagsDir, `${tag}.md`);
    const tagContent = `---\ntag-name: ${tag}\n---\n`;
    fs.writeFileSync(tagFile, tagContent);
    console.log(`Created tag file: ${tagFile}`);
  }
});