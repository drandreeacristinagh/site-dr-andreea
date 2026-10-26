(async function(){
const d=await fetch('data/site.json',{cache:'no-store'}).then(r=>r.json());
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const add=(parent,tag,cls,txt)=>{const e=el(tag,cls,txt);parent.append(e);return e};
const container=id=>{const e=document.querySelector('[data-section-content="'+id+'"]');if(e)e.replaceChildren();return e};
const link=(parent,title,url)=>{if(!/^https:\/\//.test(url||''))return;const a=add(parent,'a','',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer'};
const prices=container('tarife');if(prices){add(prices,'h2','editable-title',d.pricing_title);add(prices,'p','editable-lede',d.pricing_intro);const grid=add(prices,'div','pricing-grid');for(const group of d.pricing_groups||[]){const card=add(grid,'article','pricing-card');add(card,'h3','',group.title);for(const item of group.items||[]){const line=add(card,'div','price-line');const left=add(line,'div');add(left,'h4','',item.name);add(left,'small','',item.duration);add(left,'p','',item.description);add(line,'strong','',item.price)}}add(prices,'h3','',d.packages_title);const pack=add(prices,'div','packages');for(const p of d.packages||[]){const card=add(pack,'article','package-card');add(card,'h3','',p.name);add(card,'p','big-price',p.price);add(card,'p','muted',p.comparison);add(card,'p','',p.description)}add(prices,'p','editable-disclaimer',d.pricing_note);add(prices,'p','muted',d.pricing_scope_note)}
const proc=container('colaborare');if(proc){add(proc,'h2','editable-title',d.process_title);add(proc,'p','editable-lede',d.process_intro);const grid=add(proc,'div','process-grid');for(const [i,s] of (d.process_steps||[]).entries()){const card=add(grid,'article','process-card');add(card,'span','step-number',String(i+1).padStart(2,'0'));add(card,'h3','',s.title);add(card,'p','',s.description)}}
const faq=container('faq');if(faq){add(faq,'h2','editable-title',d.faq_title);for(const item of d.faqs||[]){const details=add(faq,'details','faq-item');add(details,'summary','',item.question);add(details,'p','',item.answer)}}
const professional=document.querySelector('[data-section-content="parcurs"]');if(professional && d.publications?.length){const p=add(professional,'div','publications');add(p,'h3','',d.publications_title);for(const x of d.publications){const row=add(p,'p');add(row,'span','muted',x.year+' · '+x.journal+' · ');link(row,x.title,x.url)}}
for(const [key,value] of Object.entries(d.nav_labels||{})){const a=document.querySelector('[data-nav="'+key+'"]');if(a)a.textContent=value}
const order=['despre','parcurs','arii','ofer','tarife','colaborare','articole','resurse','faq','contact'];for(const [i,key] of order.entries()){const section=document.getElementById(key);const span=section?.querySelector('.section-label span');if(span)span.textContent=String(i+1).padStart(2,'0')+' / '+(d.section_labels?.[key]||key.toUpperCase())}
const hero=document.querySelector('.hero-photo');if(hero && /^\d{1,3}% \d{1,3}%$/.test(d.hero_image_position||''))hero.style.objectPosition=d.hero_image_position;
const target=document.getElementById('contact-form');if(!target)return;
const lab=d.form_labels||{}, form=add(target,'form','site-form');form.noValidate=false;
add(form,'h3','',d.form_title);add(form,'p','form-help',d.form_intro);add(form,'p','form-help',lab.required_note||'');
const make=(title,tag,required=false)=>{const label=add(form,'label','form-field');const caption=add(label,'span','',title+(required?' *':''));const input=add(label,tag,'');input.required=required;return input};
const option=(select,value,label)=>{const o=add(select,'option','',label);o.value=value;return o};
const service=make(lab.service||'Serviciu','select',true);option(service,'',lab.select_placeholder||'Selectează');
for(const x of d.form_services||[])option(service,x.value,x.label);
const topic=make(lab.topic||'Tema de interes','select',true);
const updateTopics=()=>{topic.replaceChildren();option(topic,'',lab.select_placeholder||'Selectează');const selected=(d.form_services||[]).find(x=>x.value===service.value);for(const x of selected?.topics||[])option(topic,x,x);topic.disabled=!selected};
service.addEventListener('change',updateTopics);updateTopics();
const recipient=make(lab.recipient||'Pentru cine','select',true);option(recipient,'',lab.select_placeholder||'Selectează');for(const x of lab.recipient_options||[])option(recipient,x,x);
const name=make(lab.name||'Nume','input',true);name.autocomplete='name';
const email=make(lab.email||'E-mail','input',true);email.type='email';email.autocomplete='email';
const phone=make(lab.phone||'Telefon (opțional)','input');phone.type='tel';phone.autocomplete='tel';
const message=make(lab.message||'Mesaj (opțional)','textarea');message.rows=5;
add(form,'p','form-help',lab.no_health||'');
const consent=add(form,'label','form-consent');const checkbox=add(consent,'input');checkbox.type='checkbox';checkbox.required=true;add(consent,'span','',lab.privacy||'Am citit politica de confidențialitate.');
const privacy=add(form,'a','text-link',lab.privacy_link||d.footer_privacy||'Confidențialitate');privacy.href='privacy.html';privacy.target='_blank';privacy.rel='noopener noreferrer';
add(form,'p','form-help',lab.submit_note||'');const send=add(form,'button','button button-dark',lab.send||'Deschide e-mailul');send.type='submit';

const status = add(form, 'p', 'form-help', '');
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  send.disabled = true;
  status.textContent = 'Mesajul se trimite...';

  const payload = {
    _subject: (d.form_email_subject || 'Solicitare – ') + service.value,
    serviciu: service.options[service.selectedIndex]?.text || service.value,
    tema: topic.value,
    pentru_cine: recipient.value,
    nume: name.value,
    email: email.value,
    telefon: phone.value,
    mesaj: message.value,
    acord_confidentialitate: checkbox.checked ? 'Da' : 'Nu'
  };

  try {
    const response = await fetch('https://formspree.io/f/mljjjoqr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Trimiterea a eșuat');

    form.reset();
    updateTopics();
    status.textContent = 'Mesajul a fost trimis cu succes! Îți voi răspunde cât mai curând.';
  } catch (error) {
    status.textContent = 'Mesajul nu a putut fi trimis. Te rog să încerci din nou sau să îmi scrii direct pe e-mail.';
  } finally {
    send.disabled = false;
  }
});
event.preventDefault();if(!form.reportValidity())return;
const subject=(d.form_email_subject||'Solicitare – ')+service.value;
const body=[[d.form_review_service||'Serviciu',service.options[service.selectedIndex]?.text||service.value],[d.form_review_topic||'Temă',topic.value],[d.form_review_recipient||'Pentru',recipient.value],[d.form_review_name||'Nume',name.value],[d.form_review_email||'E-mail',email.value],[d.form_review_phone||'Telefon',phone.value],[d.form_review_message||'Mesaj',message.value]].map(([key,value])=>key+': '+value).join('\n');
window.location.href='mailto:'+encodeURIComponent(d.contact_email||'')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
});
})().catch(e=>console.error('Eroare încărcare secțiuni',e));
