const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'cartoon-video.js'),'utf8');
const handlers=source.slice(source.indexOf("  $('recordVoice').onclick="),source.indexOf("  $('backupVideo').onclick="));
let resolveMic,rejectMic,requests=0,stops=0,latest,failConstruct=false;
const nodes=Object.fromEntries(['recordVoice','stopVoice','audioStatus','audioFile'].map(id=>[id,{disabled:id==='stopVoice',value:''}]));
class Recorder {constructor(){if(failConstruct)throw Error('unsupported');this.mimeType='audio/mp4';this.state='inactive';latest=this;}start(){this.state='recording';}stop(){this.state='inactive';this.ondataavailable({data:new Blob(['voice'],{type:this.mimeType})});this.onstop();}}
const ctx={Blob,File,MediaRecorder:Recorder,window:{MediaRecorder:Recorder},navigator:{mediaDevices:{getUserMedia:()=>{requests++;return new Promise((resolve,reject)=>{resolveMic=resolve;rejectMic=reject;});}}},$:id=>nodes[id],stopAudioPreview:()=>{}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'video-recording-formats.js'),'utf8'),ctx);ctx.window.APANAM_VIDEO_FORMATS=ctx.APANAM_VIDEO_FORMATS;
vm.runInContext('let voiceRecorder=null,voiceStream=null,voiceStarting=false,audioFile=null;'+handlers+';globalThis.currentFile=()=>audioFile;',ctx);
const stream=()=>({getTracks:()=>[{stop:()=>stops++}]});
(async()=>{
 const pending=nodes.recordVoice.onclick();await nodes.recordVoice.onclick();assert.equal(requests,1,'double click opens only one microphone request');assert(nodes.recordVoice.disabled);resolveMic(stream());await pending;assert.equal(latest.state,'recording');assert(!nodes.stopVoice.disabled);nodes.stopVoice.onclick();assert.equal(ctx.currentFile().name,'APANAM-recorded-voice.m4a');assert.equal(ctx.currentFile().type,'audio/mp4');assert.equal(stops,1);assert(!nodes.recordVoice.disabled);assert(nodes.stopVoice.disabled);
 let p=nodes.recordVoice.onclick();rejectMic(Error('denied'));await p;assert(!nodes.recordVoice.disabled,'permission denial allows retry');assert.equal(ctx.currentFile().name,'APANAM-recorded-voice.m4a','failed recording keeps previous audio');
 failConstruct=true;p=nodes.recordVoice.onclick();resolveMic(stream());await p;assert.equal(stops,2,'constructor failure closes microphone');assert(!nodes.recordVoice.disabled);failConstruct=false;
 p=nodes.recordVoice.onclick();resolveMic(stream());await p;latest.mimeType='audio/webm;codecs=opus';nodes.stopVoice.onclick();assert.equal(ctx.currentFile().name,'APANAM-recorded-voice.webm');assert.equal(ctx.currentFile().type,'audio/webm;codecs=opus');assert.equal(stops,3);
 const saved=ctx.currentFile();p=nodes.recordVoice.onclick();resolveMic(stream());await p;latest.onerror();assert.equal(ctx.currentFile(),saved,'recording error preserves previous audio');assert.equal(stops,4);assert(!nodes.recordVoice.disabled);assert(nodes.stopVoice.disabled);
 console.log('PASS voice: one pending microphone, M4A/WebM names, permission/constructor/error cleanup and previous audio preservation');
})().catch(e=>{console.error(e);process.exitCode=1;});
