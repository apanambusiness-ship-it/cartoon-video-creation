/* Free, browser-only template filling. Keep the existing editable editor layers. */
(()=>{
  const panel=document.querySelector('.organizer-panel[data-group="Templates"]');
  const templates=window.APANAM_TEMPLATES;
  const stage=document.querySelector('#stage');
  if(!panel||!templates||!stage)return;
  const box=document.createElement('details');
  box.className='organizer-section auto-template-form';
  box.open=true;
  const title=document.createElement('summary');title.textContent='जानकारी भरें · पोस्टर बनाएँ';
  const form=document.createElement('form');
  form.innerHTML=`<label>Template<select name="template"><option value="listing">Product Listing</option><option value="sale">Sale Offer</option><option value="beauty">Beauty</option><option value="home">Home & Kitchen</option><option value="handmade">Handmade</option><option value="festival">Festival</option></select></label>
    <label>Product name<input name="product" required maxlength="55" placeholder="उदाहरण: हैंडमेड बैग"></label>
    <div class="row"><label>कीमत ₹<input name="price" type="number" min="1" max="99999999" required placeholder="699"></label><label>MRP ₹ (वैकल्पिक)<input name="mrp" type="number" min="1" max="99999999" placeholder="999"></label></div>
    <label>Offer / संदेश<input name="offer" maxlength="70" placeholder="उदाहरण: मुफ़्त डिलीवरी"></label>
    <label>Brand<input name="brand" maxlength="40" placeholder="APANAM"></label>
    <label>Product photo (वैकल्पिक)<input name="photo" type="file" accept="image/png,image/jpeg,image/webp"></label>
    <button type="submit">✨ पोस्टर बनाएँ</button><p class="small" role="status">पोस्टर के सभी text और photo को बाद में बदल सकते हैं।</p>`;
  box.append(title,form);panel.prepend(box);
  const setText=(el,value)=>{if(!el||!value)return;el.dataset.text=value;el.firstChild.nodeValue=value};
  function readPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Photo पढ़ी नहीं जा सकी'));reader.readAsDataURL(file)})}
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const data=new FormData(form), kind=data.get('template');
    if(typeof templates[kind]!=='function')return;
    const name=String(data.get('product')||'').trim();
    const price=Number(data.get('price')),mrp=Number(data.get('mrp'));
    if(!name||!Number.isSafeInteger(price)||price<1||price>99999999){form.reportValidity();return}
    if(mrp&&(!Number.isSafeInteger(mrp)||mrp<1||mrp>99999999)){form.reportValidity();return}
    const file=data.get('photo');let photo;
    try{if(file instanceof File&&file.size){if(file.size>10*1024*1024)throw new Error('Photo 10 MB से छोटी रखें');photo=await readPhoto(file)}}catch(error){form.querySelector('[role="status"]').textContent=error.message;return}
    if(stage.querySelector('.element')&&!confirm('नया template लगाने से अभी खुला poster बदल जाएगा। पहले Save करें। आगे बढ़ें?'))return;
    templates[kind]();
    const texts=[...stage.querySelectorAll('.element[data-text]')];
    const find=(pattern)=>texts.find(el=>pattern.test(el.dataset.text||''));
    const brand=String(data.get('brand')||'').trim();
    const offer=String(data.get('offer')||'').trim();
    const heading=find(/PRODUCT NAME|BEAUTY|HOME & KITCHEN|HANDMADE|त्योहार की|MEGA SALE/);
    setText(heading,name);
    setText(find(/^₹\d+/),`₹${price.toLocaleString('en-IN')}${mrp&&mrp>price?'  MRP ₹'+mrp.toLocaleString('en-IN'):''}`);
    if(!find(/^₹\d+/)){
      const priceNode=find(/Glow •|BEST SELLER|Support Local Makers|आज ही खरीदें|Limited Time Offer|UP TO 50% OFF/);
      setText(priceNode,`₹${price.toLocaleString('en-IN')}${mrp&&mrp>price?'  MRP ₹'+mrp.toLocaleString('en-IN'):''}`);
    }
    if(offer){const offerNode=find(/FREE DELIVERY|UP TO 50% OFF|Smart choices|LOCAL •|आज ही खरीदें|Glow •|Limited Time Offer/);setText(offerNode,offer)}
    if(brand){const brandNode=find(/^APANAM$/);if(brandNode)setText(brandNode,brand);else {const input=document.querySelector('#brandName');if(input)input.value=brand}}
    if(photo){const slot=[...stage.querySelectorAll('.element')].find(el=>el.dataset.name==='Product Photo Area');const placeholder=find(/अपना PRODUCT PHOTO/);slot?.remove();placeholder?.remove();const upload=document.querySelector('#imageUpload');const transfer=new DataTransfer();transfer.items.add(file);upload.files=transfer.files;upload.dispatchEvent(new Event('change',{bubbles:true}));}
    form.querySelector('[role="status"]').textContent='पोस्टर तैयार है। Text, photo और रंग बदलकर Save या Download PNG करें।';
    document.querySelector('#layers')?.dispatchEvent(new Event('change'));
  });
})();
