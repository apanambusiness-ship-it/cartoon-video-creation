(()=>{'use strict';
const CLOUD_WAIT=12000;
function go(){const next=location.pathname.split('/').pop()||'index.html';location.replace('membership.html?login_required=1&next='+encodeURIComponent(next+location.search+location.hash));}
async function check(){
 if(location.search.includes('preview=1'))return;
 const started=Date.now();
 while(!window.APANAM_CLOUD&&Date.now()-started<CLOUD_WAIT)await new Promise(r=>setTimeout(r,50));
 if(!window.APANAM_CLOUD){go();return;}
 try{await Promise.resolve(window.APANAM_CLOUD.authReady);}catch{}
 if(!window.APANAM_CLOUD.user())go();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
})();