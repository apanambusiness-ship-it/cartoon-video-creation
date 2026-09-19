(()=>{
  // Legacy compatibility cleanup: this file used to create a second Text Settings panel.
  // Keep exactly one canonical panel (#apanamTextPanel) from editor-text-quick-tools.js.
  function cleanup(){
    document.querySelectorAll('#apanamTextQuick').forEach(el=>el.remove());
    const panels=[...document.querySelectorAll('#apanamTextPanel')];
    panels.slice(1).forEach(el=>el.remove());
    document.querySelectorAll('#apanamColorPanel').forEach(el=>el.remove());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanup);
  else cleanup();
  const observer=new MutationObserver(cleanup);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();