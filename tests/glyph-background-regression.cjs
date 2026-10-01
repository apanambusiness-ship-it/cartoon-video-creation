const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../image-content-editor.js'),'utf8');
const width=140,height=110,pixels=new Uint8ClampedArray(width*height*4);
function fillBackground(gradient=false){for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;pixels.set(gradient?[255-x,255-x,255,255]:[230,224,210,255],i);}}
const document={createElement:()=>({getContext:()=>({drawImage(){},getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);for(let row=0;row<h;row++)for(let col=0;col<w;col++)data.set(pixels.subarray(((y+row)*width+x+col)*4,((y+row)*width+x+col)*4+4),(row*w+col)*4);return {data,width:w,height:h};}})})};
const context={document,Uint8Array,Float32Array,Math,Error,Map};vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  function glyphPatch('),source.indexOf('  const layersButton')),context);
fillBackground();
// An embossed H has bright edges outside the dark ink. Both must disappear.
const ink=(x,y)=>(x>=30&&x<=40||x>=72&&x<=82)&&y>=25&&y<=80||x>=30&&x<=82&&y>=48&&y<=58;
for(let y=22;y<84;y++)for(let x=27;x<86;x++){let rim=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)rim ||= ink(x+dx,y+dy);if(rim)pixels.set(ink(x,y)?[30,65,22,255]:[255,252,245,255],(y*width+x)*4);}
const original=pixels.slice(),bounds={x0:30,y0:25,x1:83,y1:81},state={img:{naturalWidth:width,naturalHeight:height}};
const patch=context.glyphPatch(state,bounds,'#e6e0d2','#1e4116');assert(patch.count>1000);
for(let y=0;y<patch.pixels.height;y++)for(let x=0;x<patch.pixels.width;x++){const i=y*patch.pixels.width+x,originalIndex=((y+patch.y0)*width+x+patch.x0)*4;if(patch.mask[i]){for(let k=0;k<3;k++)assert(Math.abs(patch.pixels.data[i*4+k]-[230,224,210][k])<=4,'Embossed highlights and dark ink must leave a clean background');}else for(let k=0;k<4;k++)assert.equal(patch.pixels.data[i*4+k],original[originalIndex+k],'Unselected photo pixels must stay identical');assert.equal(patch.pixels.data[i*4+3],255);}
fillBackground(true);assert.throws(()=>context.glyphPatch(state,bounds,'#ffffff','#111111'),/background/,'A strongly changing background must be rejected');
console.log('PASS embossed glyphs removed without a white silhouette; unselected pixels preserved; complex background rejected');
