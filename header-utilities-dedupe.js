(()=>{
  const ids=['apanamInstallApp','apanamHelpButton','apanamSafetyButton','apanamLaunchButton'];
  function dedupe(){
    ids.forEach(id=>{
      const nodes=[...document.querySelectorAll('[id="'+id+'"]')];
      nodes.slice(1).forEach(node=>node.remove());
    });
  }
  const run=()=>dedupe();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  const observer=new MutationObserver(dedupe);
  observer.observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
