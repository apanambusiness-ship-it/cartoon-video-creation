(()=>{'use strict';const root=document.querySelector('.controls');if(!root||document.getElementById('videoWorkspaceNav'))return;
root.classList.add('simple-video-controls');document.body.classList.add('simple-video-workspace');
const quick=document.createElement('div');quick.className='video-frequent-actions';quick.setAttribute('aria-label','अक्सर इस्तेमाल होने वाले controls');
const heading=document.createElement('h2');heading.textContent='Video बनाएँ';quick.append(heading);
const actions=document.createElement('div');actions.className='video-frequent-grid';quick.append(actions);
for(const [id,label] of [['preview','▶ Preview'],['stop','■ रोकें'],['export','⬇ Video'],['saveVideoProject','💾 Save'],['backupFullVideo','⬇ पूरा Backup'],['openVideoGallery','🗂 Gallery']]){const el=document.getElementById(id);if(el){el.textContent=label;actions.append(el);}}
root.prepend(quick);
const nav=document.createElement('nav');nav.id='videoWorkspaceNav';nav.setAttribute('aria-label','Video editor विभाग');nav.className='video-workspace-nav';quick.after(nav);
const groups=[['scene','1 · Scenes'],['story','कहानी / Photos'],['voice','2 · आवाज़'],['design','Design'],['export','3 · Download'],['more','अन्य Tools']];const panels=new Map();
for(const [id,label] of groups){const panel=document.createElement('div');panel.id='video-workspace-'+id;panel.className='video-workspace-page';panel.setAttribute('role','region');panel.setAttribute('aria-label',label);panels.set(id,panel);root.append(panel);const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.workspace=id;b.setAttribute('aria-controls',panel.id);b.onclick=()=>show(id);nav.append(b);}
const baseIds={scene:['title','caption','duration','add','remove','duplicateScene','scenePng','scenes','scenePhoto','removeScenePhoto','photoFit'],voice:['speak','sceneAudioFile','sceneAudioStatus','removeSceneAudio','audioFile','listenAudio','audioVolume','loopAudio','recordVoice','stopVoice','audioStatus'],design:['background','character','motion','videoLogo','removeVideoLogo','useBrandLogo','useBrandColors','characterType','transition','titleColor','titleSize','captionColor','captionSize','captionPosition','videoFormat','videoFormatLabel','sceneSetting'],export:['videoTimeline','videoTime','videoFileFormat','downloadSubtitles','backupVideo','restoreVideo','status']};
const groupFor=el=>{for(const [group,ids] of Object.entries(baseIds))if(ids.some(id=>el.id===id||el.querySelector('#'+id)))return group;return 'more';};
for(const el of [...root.children]){if(el===quick||el===nav||el.classList.contains('video-workspace-page'))continue;if(el.classList.contains('video-tool-organizer')){el.hidden=true;continue;}if(el.tagName==='H1'){el.hidden=true;continue;}
let group=groupFor(el);if(el.tagName==='H2'&&el.textContent.trim()==='Scenes')group='scene';if(el.classList.contains('pair')&&!el.children.length){el.hidden=true;}if(el.tagName==='SECTION'){const name=(el.querySelector('h2')?.textContent||'').toLowerCase();if(/shubh|text से|audio|आवाज़|संगीत|music|teleprompter|voice/.test(name))group='voice';else if(/photo|कहानी|script|story|तैयार वीडियो|clip/.test(name))group='story';else if(/layer|लेयर|asset|पात्र/.test(name))group='design';else if(/export|download|publish|quality|completion|सबटाइटल|thumbnail|credits/.test(name))group='export';}
if(el.tagName==='P'&&el.textContent.includes('सारा काम')){el.hidden=true;group='more';}
panels.get(group).append(el);
}
// Export progress and the finished download stay visible in every workspace.
const status=document.getElementById('status');if(status){status.setAttribute('aria-live','polite');quick.append(status);const link=document.getElementById('videoDownloadLink');if(link)status.after(link);}
const note=document.createElement('p');note.className='video-workspace-hint';note.textContent='Scenes में कहानी / फोटो रखें → आवाज़ जोड़ें → Preview → Video डाउनलोड करें।';panels.get('scene').prepend(note);
function show(id){for(const [key,panel] of panels)panel.hidden=key!==id;for(const b of nav.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.workspace===id));root.scrollTop=0;}
// Keep the chosen natural voice immediately visible; other audio tools remain available below.
const shubh=document.getElementById('shubhStatus')?.closest('section');if(shubh){panels.get('voice').prepend(shubh);shubh.hidden=false;shubh.classList.remove('collapsed');shubh.querySelector('h2')?.setAttribute('aria-expanded','true');}
window.APANAM_VIDEO_WORKSPACE={show};show('scene');
function placeHeaderNavigation(){const header=document.querySelector('body>header');if(!header)return;const row=document.createElement('div');row.className='video-header-workspace-row';const files=[...header.querySelectorAll('button')].find(b=>/Files/.test(b.textContent));const share=document.getElementById('apanamSocialShare');for(const el of [files,share])if(el)row.append(el);row.append(nav);header.append(row);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',placeHeaderNavigation,{once:true});else placeHeaderNavigation();
})();
