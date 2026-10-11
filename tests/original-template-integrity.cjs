const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'studio-original-templates.json'), 'utf8'));
assert.equal(catalog.format, 'apanam-studio-catalog');
assert(Array.isArray(catalog.templates));

const counts = new Map();
const ids = new Set();
for (const template of catalog.templates) {
  assert(template.id && template.name && template.category, 'Template metadata is required');
  assert(!ids.has(template.id), 'Duplicate template ID: ' + template.id);
  ids.add(template.id);
  counts.set(template.category, (counts.get(template.category) || 0) + 1);

  const project = template.project;
  assert(project && project.width > 0 && project.height > 0, 'Invalid canvas: ' + template.id);
  assert(typeof project.html === 'string' && project.html.includes('element'), 'Missing editable layers: ' + template.id);
  assert(project.html.includes('data-text='), 'Missing editable text: ' + template.id);

  for (const match of project.html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const url = match[1];
    if (/^(?:data:|https?:|blob:)/i.test(url)) continue;
    const file = path.resolve(root, decodeURIComponent(url.split(/[?#]/)[0].replace(/^\.\//, '')));
    assert(file.startsWith(root + path.sep), 'Asset leaves repository: ' + template.id);
    assert(fs.existsSync(file), 'Missing asset for ' + template.id + ': ' + url);
  }
}

assert(counts.get('त्योहार · वर्षभर') >= 75, 'Year-round festival templates were lost');
const variantCategories = [
  'दैनिक शुभकामनाएँ', 'Product', 'Social', 'त्योहार', 'जयंती', 'पुण्यतिथि',
  'राजनीतिक', 'संस्था', 'Business', 'Wedding', 'Birthday', 'Education',
  'Healthcare', 'Restaurant', 'Real Estate', 'Travel'
];
for (const category of variantCategories) {
  assert(counts.get(category) >= 5, 'Editable variants were lost: ' + category);
}
assert(catalog.templates.length >= 155, 'Original template catalog shrank');
console.log('Original template integrity passed: ' + catalog.templates.length + ' designs, ' + counts.size + ' categories');
