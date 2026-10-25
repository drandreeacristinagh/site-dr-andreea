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
// CONTACT SETUP: replace these example values before publishing.
const CONTACT_EMAIL = 'adresa-ta@example.com';
const WHATSAPP_NUMBER = ''; // international format, digits only, e.g. 407xxxxxxxx
const INSTAGRAM_URL = 'https://www.instagram.com/dr.andreeacristinagh/';
const emailLink = document.getElementById('emailLink');
emailLink.href = 'mailto:' + CONTACT_EMAIL;
emailLink.textContent = CONTACT_EMAIL;
const wa = document.getElementById('whatsappLink');
if (WHATSAPP_NUMBER) { wa.href = 'https://wa.me/' + WHATSAPP_NUMBER; wa.textContent = 'Scrie-mi pe WhatsApp'; }
else { wa.href = '#contact'; wa.addEventListener('click', e => { e.preventDefault(); alert('Adaugă numărul WhatsApp în assets/script.js înainte de publicare.'); }); }
const insta = document.getElementById('instagramLink');
insta.href = INSTAGRAM_URL; insta.target = '_blank'; insta.rel = 'noopener noreferrer';
