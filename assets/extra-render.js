
(async function(){
const d=await fetch('data/site.json',{cache:'no-store'}).then(r=>r.json());
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const add=(parent,tag,cls,txt)=>{const e=el(tag,cls,txt);parent.append(e);return e};
const container=id=>{const e=document.querySelector('[data-section-content="'+id+'"]');if(e)e.replaceChildren();return e};
const link=(parent,title,url)=>{if(!/^https:\/\//.test(url||''))return;const a=add(parent,'a','',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer'};

const prices=container('tarife');
if(prices){
  add(prices,'h2','editable-title',d.pricing_title);
  add(prices,'p','editable-lede',d.pricing_intro);
  const grid=add(prices,'div','pricing-grid');
  for(const group of d.pricing_groups||[]){
    const card=add(grid,'article','pricing-card');
    add(card,'h3','',group.title);
    for(const item of group.items||[]){
      const line=add(card,'div','price-line');
      const left=add(line,'div');
      add(left,'h4','',item.name);
      add(left,'small','',item.duration);
      add(left,'p','',item.description);
      add(line,'strong','',item.price);
    }
  }
  add(prices,'h3','',d.packages_title);
  const pack=add(prices,'div','packages');
  for(const p of d.packages||[]){
    const card=add(pack,'article','package-card');
    add(card,'h3','',p.name);
    add(card,'p','big-price',p.price);
    add(card,'p','muted',p.comparison);
    add(card,'p','',p.description);
  }
  add(prices,'p','editable-disclaimer',d.pricing_note);
  add(prices,'p','muted',d.pricing_scope_note);
}

const proc=container('colaborare');
if(proc){
  add(proc,'h2','editable-title',d.process_title);
  add(proc,'p','editable-lede',d.process_intro);
  const grid=add(proc,'div','process-grid');
  for(const [i,s] of (d.process_steps||[]).entries()){
    const card=add(grid,'article','process-card');
    add(card,'span','step-number',String(i+1).padStart(2,'0'));
    add(card,'h3','',s.title);
    add(card,'p','',s.description);
  }
}

const faq=container('faq');
if(faq){
  add(faq,'h2','editable-title',d.faq_title);
  for(const item of d.faqs||[]){
    const details=add(faq,'details','faq-item');
    add(details,'summary','',item.question);
    add(details,'p','',item.answer);
  }
}

const professional=document.querySelector('[data-section-content="parcurs"]');
if(professional && d.publications?.length){
  const p=add(professional,'div','publications');
  add(p,'h3','',d.publications_title);
  for(const x of d.publications){
    const row=add(p,'p');
    add(row,'span','muted',x.year+' · '+x.journal+' · ');
    link(row,x.title,x.url);
  }
}

for(const [key,value] of Object.entries(d.nav_labels||{})){
  const a=document.querySelector('[data-nav="'+key+'"]');
  if(a)a.textContent=value;
}

const order=['despre','parcurs','arii','ofer','tarife','colaborare','articole','resurse','faq','contact'];
for(const [i,key] of order.entries()){
  const section=document.getElementById(key);
  const span=section?.querySelector('.section-label span');
  if(span)span.textContent=String(i+1).padStart(2,'0')+' / '+(d.section_labels?.[key]||key.toUpperCase());
}

const hero=document.querySelector('.hero-photo');
if(hero && /^\d{1,3}% \d{1,3}%$/.test(d.hero_image_position||'')){
  hero.style.objectPosition=d.hero_image_position;
}

// FACEBOOK ȘI LINKEDIN ÎN SECȚIUNEA CONTACT
const instagramRow=document.querySelector('#instagramLink')?.closest('.contact-row');
if(instagramRow){
  const socialLinks=[
    {
      label:'FACEBOOK',
      icon:'f',
      url:'https://www.facebook.com/dr.andreeacristinaghpsihiatriepediatricanutritie',
      text:'Pagina profesională Facebook'
    },
    {
      label:'LINKEDIN',
      icon:'in',
      url:'https://www.linkedin.com/in/andreeacristinagheorghe/',
      text:'Profil profesional LinkedIn'
    }
  ];

  let previousRow=instagramRow;

  for(const social of socialLinks){
    const row=el('div','contact-row');
    const symbol=add(row,'span','contact-icon',social.icon);
    symbol.setAttribute('aria-hidden','true');

    const details=add(row,'div');
    add(details,'small','',social.label);

    const a=add(details,'a','',social.text);
    a.href=social.url;
    a.target='_blank';
    a.rel='noopener noreferrer';

    previousRow.insertAdjacentElement('afterend',row);
    previousRow=row;
  }
}

// BUTON WHATSAPP FLOTANT
const whatsappUrl='https://wa.me/message/UUF2B3FQUOS6E1';

if(!document.querySelector('#floating-whatsapp')){
  const wa=add(document.body,'a','floating-whatsapp');
  wa.id='floating-whatsapp';
  wa.href=whatsappUrl;
  wa.target='_blank';
  wa.rel='noopener noreferrer';
  wa.setAttribute('aria-label','Contactează-mă pe WhatsApp');
  wa.title='Scrie-mi pe WhatsApp';

  wa.innerHTML=`
    <svg viewBox="0 0 32 32" width="31" height="31"
         aria-hidden="true" focusable="false"
         xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor"
        d="M16.02 2.67A13.3 13.3 0 0 0 4.53 22.7L2.67 29.33l6.8-1.78A13.33 13.33 0 1 0 16.02 2.67Zm0 24.22a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-4.03 1.05 1.08-3.92-.26-.41a10.86 10.86 0 1 1 9.11 5.02Zm5.96-8.1c-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.4-.52-2.67-1.65-.99-.88-1.66-1.97-1.85-2.3-.19-.33-.02-.51.14-.67.15-.15.33-.39.5-.58.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.58-.08-.16-.74-1.79-1.01-2.45-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.58.08-.88.41-.3.33-1.15 1.13-1.15 2.75s1.18 3.19 1.35 3.41c.16.22 2.32 3.54 5.62 4.97.79.34 1.41.54 1.9.69.8.25 1.53.21 2.1.13.64-.1 1.95-.8 2.23-1.57.28-.77.28-1.43.19-1.57-.08-.14-.3-.22-.63-.39Z"/>
    </svg>
  `;
}

// STILURI PENTRU BUTONUL FLOTANT
if(!document.querySelector('#floating-whatsapp-styles')){
  const style=add(document.head,'style');
  style.id='floating-whatsapp-styles';
  style.textContent=`
    .floating-whatsapp {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 9999;
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #25D366;
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(0,0,0,.20);
      text-decoration: none;
      transition: transform .2s ease, box-shadow .2s ease;
    }

    .floating-whatsapp:hover {
      transform: translateY(-3px);
      box-shadow: 0 7px 20px rgba(0,0,0,.25);
    }

    .floating-whatsapp:focus-visible {
      outline: 3px solid #1c6b46;
      outline-offset: 4px;
    }

    .floating-whatsapp svg {
      display: block;
      width: 31px;
      height: 31px;
    }

    @media (max-width: 600px) {
      .floating-whatsapp {
        right: 16px;
        bottom: 16px;
        width: 54px;
        height: 54px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .floating-whatsapp {
        transition: none;
      }
    }
  `;
}

// FORMULARUL ORIGINAL - PĂSTRAT
const target=document.getElementById('contact-form');
if(!target)return;

const lab=d.form_labels||{}, form=add(target,'form','site-form');
form.noValidate=false;

add(form,'h3','',d.form_title);
add(form,'p','form-help',d.form_intro);
add(form,'p','form-help',lab.required_note||'');

const make=(title,tag,required=false)=>{
  const label=add(form,'label','form-field');
  add(label,'span','',title+(required?' *':''));
  const input=add(label,tag,'');
  input.required=required;
  return input;
};

const option=(select,value,label)=>{
  const o=add(select,'option','',label);
  o.value=value;
  return o;
};

const service=make(lab.service||'Serviciu','select',true);
option(service,'',lab.select_placeholder||'Selectează');

for(const x of d.form_services||[]){
  option(service,x.value,x.label);
}

const topic=make(lab.topic||'Tema de interes','select',true);

const updateTopics=()=>{
  topic.replaceChildren();
  option(topic,'',lab.select_placeholder||'Selectează');
  const selected=(d.form_services||[]).find(x=>x.value===service.value);
  for(const x of selected?.topics||[]){
    option(topic,x,x);
  }
  topic.disabled=!selected;
};

service.addEventListener('change',updateTopics);
updateTopics();

const recipient=make(lab.recipient||'Pentru cine','select',true);
option(recipient,'',lab.select_placeholder||'Selectează');

for(const x of lab.recipient_options||[]){
  option(recipient,x,x);
}

const name=make(lab.name||'Nume','input',true);
name.autocomplete='name';

const email=make(lab.email||'E-mail','input',true);
email.type='email';
email.autocomplete='email';

const phone=make(lab.phone||'Telefon (opțional)','input');
phone.type='tel';
phone.autocomplete='tel';

const message=make(lab.message||'Mesaj (opțional)','textarea');
message.rows=5;

add(form,'p','form-help',lab.no_health||'');

const consent=add(form,'label','form-consent');
const checkbox=add(consent,'input');
checkbox.type='checkbox';
checkbox.required=true;
add(consent,'span','',lab.privacy||'Am citit politica de confidențialitate.');

const privacy=add(form,'a','text-link',lab.privacy_link||d.footer_privacy||'Confidențialitate');
privacy.href='privacy.html';
privacy.target='_blank';
privacy.rel='noopener noreferrer';

add(form,'p','form-help','Solicitarea ta va fi transmisă direct prin formularul online. După trimitere, vei primi o confirmare pe această pagină.');

const send=add(form,'button','button button-dark','Trimite mesajul');
send.type='submit';

const status=add(form,'p','form-help','');
status.setAttribute('role','status');
status.setAttribute('aria-live','polite');

form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;

  send.disabled=true;
  status.textContent='Mesajul se trimite...';

  const payload={
    _subject:(d.form_email_subject||'Solicitare – ')+service.value,
    serviciu:service.options[service.selectedIndex]?.text||service.value,
    tema:topic.value,
    pentru_cine:recipient.value,
    nume:name.value,
    email:email.value,
    telefon:phone.value,
    mesaj:message.value,
    acord_confidentialitate:checkbox.checked?'Da':'Nu'
  };

  try{
    const response=await fetch('https://formspree.io/f/mljjjoqr',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify(payload)
    });

    if(!response.ok){
      throw new Error('Formspree HTTP '+response.status);
    }

    form.reset();
    updateTopics();
    status.textContent='Mesajul a fost trimis cu succes! Îți voi răspunde cât mai curând.';
  }catch(error){
    console.error('Eroare trimitere formular',error);
    status.textContent='Mesajul nu a putut fi trimis. Te rog să încerci din nou sau să îmi scrii direct pe e-mail.';
  }finally{
    send.disabled=false;
  }
});

})().catch(e=>console.error('Eroare încărcare secțiuni',e));
