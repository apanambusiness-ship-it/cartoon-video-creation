// AI controls become available only after the separate Cloudflare Worker is healthy.
(()=>{
  const endpoint='https://apanam-ai-poster-api.apanambusiness.workers.dev';
  const form=document.querySelector('.auto-template-form form');
  if(!form)return;
  const button=document.createElement('button');button.type='button';button.textContent='✨ AI से सुझाव और पोस्टर';button.hidden=true;
  const status=document.createElement('p');status.className='small';status.setAttribute('role','status');status.textContent='AI सुविधा Cloudflare से जुड़ने पर उपलब्ध होगी।';
  form.append(button,status);
  fetch(endpoint+'/health').then(r=>r.ok?r.json():null).then(data=>{if(data?.ready){button.hidden=false;status.textContent='AI सुझाव मुफ्त दैनिक सीमा के भीतर उपलब्ध हैं।'}}).catch(()=>{});
  button.addEventListener('click',async()=>{
    const product=form.elements.product.value.trim(),price=Number(form.elements.price.value);
    if(!product||!price){form.reportValidity();return}
    button.disabled=true;status.textContent='AI सुझाव बना रहा है…';
    try{
      const result=await fetch(endpoint+'/api/poster',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product,price,brand:form.elements.brand.value,category:form.elements.template.value})});
      const data=await result.json();if(!result.ok)throw new Error(data.error||'AI उपलब्ध नहीं है');
      form.elements.product.value=data.headline;
      form.elements.offer.value=data.offer||data.tagline;
      form.elements.template.value=data.template;
      const apply=()=>{const stage=document.querySelector('#stage');stage.style.backgroundColor=data.backgroundColor;document.querySelectorAll('#stage .element[data-text]').forEach(el=>{if(el.dataset.text===data.headline)el.style.color=data.primaryColor});form.removeEventListener('apanam:poster-ready',apply)};
      form.addEventListener('apanam:poster-ready',apply);
      form.requestSubmit();status.textContent='AI सुझाव लगा दिया है। पोस्टर के सभी हिस्से बदल सकते हैं।';
    }catch(error){status.textContent=error.message}finally{button.disabled=false}
  });
})();
