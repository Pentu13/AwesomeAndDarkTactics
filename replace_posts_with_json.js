const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const postsDir = './docs/_posts';
const jsonDir = './converted-tactics';

// 1. Delete all .md and .markdown files in _posts (including subfolders)
function deleteMarkdownFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      deleteMarkdownFiles(fullPath);
    } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${fullPath}`);
    }
  });
}

// 2. Recursively process all JSON files in converted-tactics (including subfolders)
function processJsonDir(dir, relPath = '') {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processJsonDir(fullPath, path.join(relPath, file));
    } else if (file.endsWith('.json')) {
      const data = fs.readJSONSync(fullPath);

      // Prepare YAML front matter only (no diagram/body template)
      const yamlFrontMatter = yaml.dump(data, { lineWidth: -1 });
      const mdContent = `---\n${yamlFrontMatter}---\n`;

      // Preserve subfolder structure in _posts
      const baseName = path.basename(file, '.json');
      const outDir = path.join(postsDir, relPath);
      fs.ensureDirSync(outDir);

      // Use .markdown extension (change to .md if you prefer)
      const mdFile = path.join(outDir, `${baseName}.markdown`);
      fs.writeFileSync(mdFile, mdContent, 'utf8');
      console.log(`Created: ${mdFile}`);
    }
  });
}

// Run the steps
deleteMarkdownFiles(postsDir);
processJsonDir(jsonDir);
console.log('All posts replaced with schema-compliant Markdown from JSON.');