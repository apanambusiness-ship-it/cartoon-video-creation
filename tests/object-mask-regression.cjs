const assert=require('node:assert/strict'),{isolate}=require('../object-mask-utils.js');
const w=40,h=30,m=new Uint8Array(w*h),rgba=new Uint8Array(w*h*4);for(let i=0;i<w*h;i++)rgba[i*4+3]=255;
for(let y=5;y<15;y++)for(let x=5;x<15;x++)m[y*w+x]=1;
for(let y=20;y<25;y++)for(let x=28;x<35;x++)m[y*w+x]=1;
m[0]=1;const a=isolate(m,w,h,[[8,8]],[1],rgba);assert.equal(a.count,100);assert.equal(a.mask[22*w+30],0);assert.equal(a.mask[0],0);const b=isolate(m,w,h,[[8,8],[30,22]],[1,1],rgba);assert.equal(b.count,35);assert.equal(b.mask[8*w+8],0);rgba[(5*w+5)*4+3]=0;assert.equal(isolate(m,w,h,[[8,8]],[1],rgba).count,99);assert.throws(()=>isolate(new Uint8Array(w*h).fill(1),w,h,[[8,8]],[1],rgba),/background/);assert.throws(()=>isolate(m,w,h,[[39,0]],[1],rgba),/साफ वस्तु/);console.log('PASS disconnected objects and speckles excluded; latest object seed retained; transparent pixels excluded; background selection rejected');
