/* Keep the contiguous object under the last positive click, excluding transparent pixels. */
(function(root){
function isolate(input,width,height,points,labels,rgba){
 const size=width*height;if(rgba&&rgba.length!==size*4)throw Error('Selection के लिए मूल RGBA pixels चाहिए।');if(input.length!==size)throw Error('Selection आकार गलत है।');let point;for(let i=points.length-1;i>=0;i--)if(labels[i]===1){point=points[i];break;}if(!point)throw Error('पहले वस्तु के बीच click करें।');
 const good=i=>i>=0&&i<size&&input[i]>0&&(!rgba||rgba[i*4+3]>=128);const px=Math.max(0,Math.min(width-1,Math.round(point[0]))),py=Math.max(0,Math.min(height-1,Math.round(point[1])));let seed=py*width+px;
 if(!good(seed)){seed=-1;let distance=Infinity;for(let y=Math.max(0,py-8);y<=Math.min(height-1,py+8);y++)for(let x=Math.max(0,px-8);x<=Math.min(width-1,px+8);x++){const i=y*width+x,d=(x-px)**2+(y-py)**2;if(good(i)&&d<distance){seed=i;distance=d;}}}if(seed<0)throw Error('इस click पर साफ वस्तु नहीं मिली। वस्तु के बीच फिर click करें।');
 const mask=new Uint8Array(size),queue=new Int32Array(size);let head=0,tail=1,edges=0;queue[0]=seed;mask[seed]=1;
 const visit=i=>{if(!mask[i]&&good(i)){mask[i]=1;queue[tail++]=i;}};
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);if(x===0||x===width-1||y===0||y===height-1)edges++;if(x>0)visit(i-1);if(x<width-1)visit(i+1);if(y>0)visit(i-width);if(y<height-1)visit(i+width);}
 const fraction=tail/size,edgeFraction=edges/Math.max(1,2*width+2*height-4);if(fraction>.85||(fraction>.35&&edgeFraction>.7))throw Error('वस्तु के बजाय बड़ा background चुना गया। बदलाव नहीं किया; वस्तु के बीच click करें या Brush से चुनें।');
 return {mask,count:tail,fraction};
}
root.APANAM_MASK_UTILS={isolate};if(typeof module!=='undefined')module.exports=root.APANAM_MASK_UTILS;
})(typeof self!=='undefined'?self:globalThis);
