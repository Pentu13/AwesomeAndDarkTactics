import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const newPostsDir = './docs/_new_posts';
const tagsDir = './docs/tags';

console.log('--- Generating new tags ---');

// Check if tagsDir exists, if not, create it
if (!fs.existsSync(tagsDir)) {
    fs.mkdirSync(tagsDir, { recursive: true });
    console.log(`Created tags directory at: ${tagsDir}`);
}

// Get all existing tag names
const existingTags = new Set(
  fs.readdirSync(tagsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
);

// Collect all tags from new posts
const newTags = new Set();

if (!fs.existsSync(newPostsDir)) {
    console.log(`Directory ${newPostsDir} does not exist. Skipping tag generation.`);
} else {
    const files = fs.readdirSync(newPostsDir);
    if (files.length === 0) {
        console.log(`Directory ${newPostsDir} is empty. No new tags to generate.`);
    } else {
        files.forEach(file => {
          if (!file.endsWith('.md')) return;
          const content = fs.readFileSync(path.join(newPostsDir, file), 'utf8');
          const { data } = matter(content);
          let tags = data.tags;
          if (typeof tags === 'string') tags = tags.split(/[, ]+/).filter(Boolean);
          if (Array.isArray(tags)) tags.forEach(tag => newTags.add(tag));
        });
    }
}

// Create missing tag files
if (newTags.size > 0) {
    console.log(`Found ${newTags.size} new tag(s) to process.`);
    newTags.forEach(tag => {
      if (!existingTags.has(tag)) {
        const tagFile = path.join(tagsDir, `${tag}.md`);
        const tagContent = `---\ntag-name: ${tag}\n---\n`;
        fs.writeFileSync(tagFile, tagContent);
        console.log(`Created tag file: ${tagFile}`);
      }
    });
} else {
    console.log('No new tags found to create pages for.');
}

console.log('--- Finished generating new tags ---');