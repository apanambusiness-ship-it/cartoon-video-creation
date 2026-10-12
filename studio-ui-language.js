/* APANAMai UI localization foundation. Do not load until page dictionaries are complete. */
(function(global){
  'use strict';
  const languages=Object.freeze([
    ['hi','हिन्दी'],['en','English'],['bn','বাংলা'],['mr','मराठी'],
    ['gu','ગુજરાતી'],['ta','தமிழ்'],['te','తెలుగు'],['kn','ಕನ್ನಡ'],
    ['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['or','ଓଡ଼ିଆ'],['as','অসমীয়া'],
    ['ur','اردو'],['ne','नेपाली']
  ]);
  const storageKey='apanamai-ui-language';
  const valid=new Set(languages.map(item=>item[0]));
  function get(){
    try{const value=localStorage.getItem(storageKey);return valid.has(value)?value:'hi'}
    catch{return 'hi'}
  }
  function set(code){
    if(!valid.has(code))throw new RangeError('Unsupported UI language');
    try{localStorage.setItem(storageKey,code)}catch{}
    document.documentElement.lang=code;
    document.documentElement.dir=code==='ur'?'rtl':'ltr';
    global.dispatchEvent(new CustomEvent('apanamai-language-change',{detail:{language:code}}));
  }
  // Every user-visible string requires an approved translation in every language.
  // A page must register its complete catalog before it exposes its language switch.
  function complete(catalog){
    if(!catalog||typeof catalog!=='object')return false;
    return Object.values(catalog).every(row=>valid.size===Object.keys(row).filter(code=>valid.has(code)&&typeof row[code]==='string'&&row[code].trim()).length);
  }
  function translate(catalog,key,code=get()){
    const row=catalog[key];
    if(!row||!row[code])throw new Error('Missing UI translation: '+key+' / '+code);
    return row[code];
  }
  global.APANAM_UI_LANG=Object.freeze({languages,storageKey,get,set,complete,translate});
})(window);
