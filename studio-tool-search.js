/* Shared, offline search for editor tools. No artwork or account data is searched. */
(function (root, factory) {
  const search = factory();
  if (typeof module === 'object' && module.exports) module.exports = search;
  else root.APANAM_TOOL_SEARCH = search;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const aliases = [
    ['text', 'टेक्स्ट', 'अक्षर', 'लिखना'],
    ['font', 'फ़ॉन्ट', 'फॉन्ट'],
    ['typing', 'टाइपिंग', 'लिखें'],
    ['hindi', 'हिंदी', 'हिन्दी'],
    ['photo', 'image', 'फोटो', 'तस्वीर', 'चित्र'],
    ['upload', 'अपलोड'],
    ['color', 'colour', 'रंग'],
    ['layer', 'layers', 'लेयर', 'परत'],
    ['arrange', 'alignment', 'align', 'व्यवस्थित', 'संरेखण'],
    ['template', 'templates', 'टेम्पलेट'],
    ['design', 'डिजाइन', 'डिज़ाइन'],
    ['background', 'पृष्ठभूमि', 'बैकग्राउंड'],
    ['brand', 'ब्रांड'],
    ['logo', 'लोगो'],
    ['product', 'प्रोडक्ट', 'उत्पाद'],
    ['price', 'pricing', 'कीमत', 'दाम'],
    ['crop', 'क्रॉप', 'काटें'],
    ['rotate', 'घुमाएँ', 'घुमाएं'],
    ['download', 'डाउनलोड'],
    ['export', 'निर्यात'],
    ['save', 'सहेजें', 'सुरक्षित'],
    ['undo', 'पूर्ववत'],
    ['redo', 'दोहराएँ'],
    ['certificate', 'प्रमाणपत्र'],
    ['help', 'support', 'मदद', 'सहायता'],
    ['video', 'वीडियो'],
    ['cartoon', 'कार्टून'],
    ['effects', 'effect', 'इफेक्ट'],
    ['elements', 'element', 'आकृतियाँ', 'आकृति'],
    ['size', 'आकार']
  ];
  function normalize(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  }
  const lookup = new Map();
  for (const group of aliases) for (const word of group) lookup.set(normalize(word), group.map(normalize));
  function matches(text, query) {
    const haystack = normalize(text);
    return normalize(query).split(' ').filter(Boolean).every(word =>
      (lookup.get(word) || [word]).some(alias => haystack.includes(alias))
    );
  }
  return Object.freeze({ normalize, matches });
});
