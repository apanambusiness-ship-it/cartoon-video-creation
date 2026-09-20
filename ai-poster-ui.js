// AI controls become available only after the separate Cloudflare Worker is healthy.
(()=>{
  const endpoint='https://apanam-ai-poster-api.apanambusiness.workers.dev';
  const form=document.querySelector('.auto-template-form form');
  if(!form)return;
  const button=document.createElement('button');button.type='button';button.textContent='✨ AI से सुझाव और पोस्टर';button.hidden=true;
  const status=document.createElement('p');status.className='small';status.setAttribute('role','status');status.textContent='AI सुविधा Cloudflare से जुड़ने पर उपलब्ध होगी।';
  form.append(button,status);
  const quotaKey='apanam-ai-quota-paused-utc';
  const today=()=>new Date().toISOString().slice(0,10);
  const showLimit=()=>{button.disabled=true;status.textContent='आज की 3 मुफ्त AI कोशिशें पूरी हैं। अगली कोशिश सुबह 5:30 बजे (भारतीय समय) करें। मैनुअल पोस्टर अभी बना सकते हैं।'};
  fetch(endpoint+'/health').then(r=>r.ok?r.json():null).then(data=>{if(data?.ready){button.hidden=false;if(localStorage.getItem(quotaKey)===today())showLimit();else status.textContent='AI सुझाव: रोज़ अधिकतम 3 कोशिशें। मैनुअल पोस्टर हमेशा उपलब्ध है।'}}).catch(()=>{status.textContent='AI सेवा से संपर्क नहीं हो पा रहा। मैनुअल पोस्टर बना सकते हैं।'});
  button.addEventListener('click',async()=>{
    const product=form.elements.product.value.trim(),price=Number(form.elements.price.value);
    if(!product||!Number.isSafeInteger(price)||price<1){status.textContent='पहले Product name और सही कीमत भरें।';form.reportValidity();return}
    button.disabled=true;status.textContent='AI से सुझाव लिए जा रहे हैं…';
    try{
      const result=await fetch(endpoint+'/api/poster',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product,price,brand:form.elements.brand.value,category:form.elements.template.value})});
      const data=await result.json();if(!result.ok){if(result.status===429&&String(data.error||'').includes('आपकी 3 AI')){localStorage.setItem(quotaKey,today());showLimit();return}throw new Error(data.error||'AI उपलब्ध नहीं है')}
      form.elements.product.value=data.headline;
      form.elements.offer.value=data.offer||data.tagline;
      form.elements.template.value=data.template;
      const apply=()=>{const stage=document.querySelector('#stage');stage.style.backgroundColor=data.backgroundColor;document.querySelectorAll('#stage .element[data-text]').forEach(el=>{if(el.dataset.text===data.headline)el.style.color=data.primaryColor});form.removeEventListener('apanam:poster-ready',apply)};
      form.addEventListener('apanam:poster-ready',apply);
      status.textContent='AI सुझाव मिल गए हैं। नया पोस्टर बनाने की पुष्टि करें।';
      form.addEventListener('apanam:poster-ready',()=>{status.textContent='AI सुझाव से पोस्टर तैयार है।'},{once:true});
      form.addEventListener('apanam:poster-cancelled',()=>{form.removeEventListener('apanam:poster-ready',apply);status.textContent='नया पोस्टर बनाना रद्द हुआ। पुराना पोस्टर सुरक्षित है।'},{once:true});
      form.requestSubmit();
    }catch(error){status.textContent=error.message}finally{if(localStorage.getItem(quotaKey)!==today())button.disabled=false}
  });
})();
