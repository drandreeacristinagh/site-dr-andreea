const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰';
  }));
}
document.getElementById('year').textContent = new Date().getFullYear();
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.article-card')];
const search = document.getElementById('articleSearch');
const noResults = document.getElementById('noResults');
let activeFilter = 'Toate';
function updateArticles() {
  const term = (search?.value || '').trim().toLocaleLowerCase('ro');
  let shown = 0;
  cards.forEach(card => {
    const categoryMatch = activeFilter === 'Toate' || card.dataset.category === activeFilter;
    const textMatch = (card.dataset.title + ' ' + card.textContent).toLocaleLowerCase('ro').includes(term);
    card.hidden = !(categoryMatch && textMatch);
    if (!card.hidden) shown++;
  });
  noResults.hidden = shown > 0;
}
filters.forEach(btn => btn.addEventListener('click', () => {
  activeFilter = btn.dataset.filter;
  filters.forEach(b => b.classList.toggle('active', b === btn));
  updateArticles();
}));
search?.addEventListener('input', updateArticles);
// Conținut editabil prin Pages CMS, păstrat în data/site.json.
fetch('data/site.json', {cache: 'no-store'}).then(r => { if (!r.ok) throw Error('Nu se poate citi site.json'); return r.json(); }).then(data => {
  document.querySelectorAll('[data-cms]').forEach(el => {
    const key = el.dataset.cms;
    if (typeof data[key] !== 'string') return;
    // Păstrează formatarea inițială dacă textul nu a fost schimbat.
    if (el.textContent.replace(/\s+/g, ' ').trim() !== data[key].replace(/\s+/g, ' ').trim()) {
      el.textContent = data[key];
    }
  });
  document.querySelectorAll('[data-cms-image]').forEach(img => {
    const value = data[img.dataset.cmsImage];
    if (typeof value === 'string' && value.startsWith('/assets/')) img.src = value;
  });
  const email = document.getElementById('emailLink');
  if (email && data.contact_email) { email.textContent = data.contact_email; email.href = 'mailto:' + data.contact_email; }
  const wa = document.getElementById('whatsappLink');
  if (wa) {
    const digits = String(data.contact_whatsapp || '').replace(/[^0-9]/g, '');
    if (digits) { wa.textContent = 'Scrie-mi pe WhatsApp'; wa.href = 'https://wa.me/' + digits; }
    else { wa.textContent = 'WhatsApp indisponibil momentan'; wa.removeAttribute('href'); }
  }
  const insta = document.getElementById('instagramLink');
  if (insta && /^https:\/\/www\.instagram\.com\//.test(data.contact_instagram || '')) {
    insta.href = data.contact_instagram; insta.target = '_blank'; insta.rel = 'noopener noreferrer';
  }
}).catch(err => console.error('Conținutul site-ului nu s-a încărcat:', err));
