const assert = require('node:assert/strict');
const { matches, normalize } = require('../studio-tool-search.js');

assert(matches('Font / रंग', 'फ़ॉन्ट'));
assert(matches('Font / रंग', 'font color'));
assert(matches('Photo / Effects', 'फोटो'));
assert(matches('Upload Image', 'तस्वीर अपलोड'));
assert(matches('Background Color', 'पृष्ठभूमि रंग'));
assert(matches('Price + MRP', 'कीमत'));
assert(matches('Certificate', 'प्रमाणपत्र'));
assert(matches('Align & Layers', 'लेयर'));
assert(matches('Save', 'सहेजें'));
assert(!matches('Download PNG', 'सहेजें'), 'Saving a project must remain distinct from downloading an image');
assert(!matches('Photo / Effects', 'फोटो Font'), 'Every query word must match');
assert(!matches('Photo / Effects', '<script>'));
assert(matches('Text', ''));
assert.equal(normalize('  FONT   Color  '), 'font color');
assert(matches('Font Size', 'ＦＯＮＴ'), 'Normalize full-width keyboard input');
console.log('PASS bilingual search, multiple terms, whitespace, Unicode and distinct save/download actions');
