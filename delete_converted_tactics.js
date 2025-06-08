const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'converted-tactics');

// Remove the directory and all its contents
if (fs.existsSync(dir)) {
  fs.rmdirSync(dir, { recursive: true });
  console.log('All contents of converted-tactics have been deleted.');
}

// Recreate the empty folder
fs.mkdirSync(dir);
console.log('converted-tactics folder recreated (empty).');