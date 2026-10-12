/* Mount only on a page whose entire UI has annotated, complete translations. */
(function(global){
  'use strict';
  function mount({container,root=document,catalogs}){
    const language=global.APANAM_UI_LANG;
    if(!language||!container||!Array.isArray(catalogs)||!catalogs.length)return false;
    if(catalogs.some(catalog=>!language.complete(catalog)))return false;
    const catalog=Object.assign({},...catalogs);
    const nodes=[...root.querySelectorAll('[data-ui-key]')];
    // Translate only leaf labels; replacing a parent would erase icons or form controls.
    if(!nodes.length||nodes.some(node=>node.childElementCount>0||!Object.hasOwn(catalog,node.dataset.uiKey)))return false;
    const select=document.createElement('select');
    select.setAttribute('aria-label','Interface language');
    select.className='apanam-language-select';
    for(const [code,name] of language.languages){
      const option=document.createElement('option');option.value=code;option.textContent=name;select.append(option);
    }
    function apply(code){
      // Validate every translation before changing any text or saving preference.
      const values=nodes.map(node=>language.translate(catalog,node.dataset.uiKey,code));
      nodes.forEach((node,index)=>{node.textContent=values[index];node.dir=code==='ur'?'rtl':'ltr'});
      language.set(code);
      select.value=code;
      select.dir=code==='ur'?'rtl':'ltr';
    }
    try{apply(language.get())}catch{return false}
    select.addEventListener('change',()=>{
      try{apply(select.value)}catch{select.value=language.get()}
    });
    container.append(select);
    return true;
  }
  global.APANAM_UI_SWITCHER=Object.freeze({mount});
})(window);
