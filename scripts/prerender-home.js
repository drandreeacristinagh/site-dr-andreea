/**
 * Pre-render the public home-page content from Pages CMS into dist/index.html.
 * Runs AFTER the existing scripts/build.js, using only Node's built-in modules.
 * The existing browser scripts remain responsible for forms and interactions.
 * No files under data/ or index.html in the repository are modified.
 */
const fs = require('node:fs');
const path = require('node:path');

const DIST = path.resolve(__dirname, '..', 'dist');
const HOME = path.join(DIST, 'index.html');
const SITE = path.join(DIST, 'data', 'site.json');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const cls = name => name ? ` class="${esc(name)}"` : '';
const node = (tag, name, text) => `<${tag}${cls(name)}>${esc(text)}</${tag}>`;
const p = (text, name = '') => text ? node('p', name, text) : '';
const h3 = text => text ? node('h3', 'editable-subtitle', text) : '';

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DIST, file), 'utf8'));
}

function cards(items) {
  return `<div class="editable-cards">${(items || []).map(item =>
    (item.title || item.description)
      ? `<article class="editable-card">${h3(item.title)}${p(item.description)}</article>`
      : ''
  ).join('')}</div>`;
}

function panelSection(title, html) {
  return `${title ? node('h2', 'editable-title', title) : ''}${html}`;
}

function professional(d) {
  const groups = [
    ['Studii universitare', d.professional_group_studies],
    ['Experiență profesională', d.professional_group_experience],
    ['Formare complementară', d.professional_group_training]
  ];
  const entries = Array.isArray(d.professional_entries) ? d.professional_entries : [];
  const year = x => Number(String(x.period || '').match(/20\d{2}/)?.[0] || 0);
  const timelineItem = (x, other = false) => `<div class="timeline-item">${p(x.period, 'timeline-period')}${h3(x.title)}${p(x.institution, 'timeline-institution')}${other ? p(x.category, 'muted') : ''}${p(x.description)}</div>`;
  let content = p(d.professional_intro);
  let found = false;
  for (const [category, label] of groups) {
    const matching = entries.filter(x => x.category === category).sort((a, b) => year(b) - year(a));
    if (!matching.length) continue;
    found = true;
    content += h3(label) + `<div class="timeline">${matching.map(x => timelineItem(x)).join('')}</div>`;
  }
  const other = entries.filter(x => !groups.some(g => g[0] === x.category))
    .sort((a, b) => year(b) - year(a));
  if (other.length) {
    found = true;
    content += `<div class="timeline">${other.map(x => timelineItem(x, true)).join('')}</div>`;
  }
  if (!found) content += p(d.professional_empty, 'muted');
  if ((d.publications || []).length) {
    content += `<div class="publications">${node('h3', '', d.publications_title)}`;
    for (const x of d.publications) {
      const safe = typeof x.url === 'string' && /^https:\/\//.test(x.url);
      content += `<p>${node('span', 'muted', `${x.year} · ${x.journal} · `)}${safe ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a>` : ''}</p>`;
    }
    content += '</div>';
  }
  return panelSection(d.professional_title, content);
}

function focus(d) {
  return panelSection(d.focus_title,
    p(d.focus_intro) + ((d.focus_items || []).length
      ? cards(d.focus_items)
      : p(d.focus_empty || 'Domeniile de interes vor fi disponibile în curând.', 'muted')));
}

function offer(d) {
  const nut = `<div class="offer-panel">${h3(d.nutrition_title)}${p(d.nutrition_intro, 'editable-lede')}${(d.nutrition_areas || []).length ? `${h3(d.nutrition_areas_title)}${cards(d.nutrition_areas)}` : ''}${p(d.nutrition_disclaimer, 'editable-disclaimer')}</div>`;
  const psycho = `<div class="offer-panel">${h3(d.psycho_title)}${p(d.psycho_intro, 'editable-lede')}${p(d.psycho_description)}${(d.psycho_topics || []).length ? `${h3(d.psycho_topics_title)}${p(d.psycho_topics.join(' · '), 'topic-list')}` : ''}${p(d.psycho_disclaimer, 'editable-disclaimer')}<a class="button button-dark" href="#contact">${esc(d.nutrition_cta || 'Solicită informații')}</a>${p(d.nutrition_cta_note, 'muted')}</div>`;
  return panelSection(d.offer_title, p(d.offer_intro, 'editable-lede') + nut + psycho);
}

function articleCards(d, manifest, kind) {
  const isArticle = kind === 'articole';
  const title = isArticle ? d.articles_title : d.resources_title;
  const empty = isArticle ? d.articles_empty : d.resources_empty;
  const expression = isArticle ? /^\/articole\/[a-z0-9-]+\/$/ : /^\/resurse\/[a-z0-9-]+\/$/;
  const published = manifest.filter(x =>
    x && typeof x.title === 'string' && typeof x.url === 'string' && expression.test(x.url)
  );
  if (!published.length) return panelSection(title, p(empty || 'În curând.', 'muted'));
  const cardHtml = published.map(x => {
    const image = /^\/?assets\/[^?#]+$/.test(x.image || '')
      ? `<a href="${esc(x.url)}"><img src="${esc(x.image)}" alt="${esc(x.image_alt || x.title)}" loading="lazy" decoding="async"></a>` : '';
    let date = '';
    if (x.date && !Number.isNaN(new Date(x.date).getTime())) {
      date = p(new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(x.date)), 'muted');
    }
    return `<article class="editable-card">${image}${p(x.category, 'muted')}<h3 class="editable-subtitle"><a href="${esc(x.url)}" style="color: inherit; text-decoration: none;">${esc(x.title)}</a></h3>${date}${p(x.summary)}<a class="text-link" href="${esc(x.url)}">${isArticle ? 'Citește articolul →' : 'Vezi resursa →'}</a></article>`;
  }).join('');
  return panelSection(title, `<div class="editable-cards">${cardHtml}</div>`);
}

function pricing(d) {
  let content = node('h2', 'editable-title', d.pricing_title) + p(d.pricing_intro, 'editable-lede');
  content += '<div class="pricing-grid">';
  for (const group of d.pricing_groups || []) {
    content += `<article class="pricing-card">${node('h3', '', group.title)}`;
    for (const item of group.items || []) {
      content += `<div class="price-line"><div>${node('h4', '', item.name)}${node('small', '', item.duration)}${node('p', '', item.description)}</div>${node('strong', '', item.price)}</div>`;
    }
    content += '</article>';
  }
  content += '</div>' + node('h3', '', d.packages_title) + '<div class="packages">';
  for (const pack of d.packages || []) {
    content += `<article class="package-card">${node('h3', '', pack.name)}${p(pack.price, 'big-price')}${p(pack.comparison, 'muted')}${p(pack.description)}</article>`;
  }
  return content + '</div>' + p(d.pricing_note, 'editable-disclaimer') + p(d.pricing_scope_note, 'muted');
}

function process(d) {
  const steps = (d.process_steps || []).map((step, index) => `<article class="process-card">${node('span', 'step-number', String(index + 1).padStart(2, '0'))}${node('h3', '', step.title)}${p(step.description)}</article>`).join('');
  return node('h2', 'editable-title', d.process_title) + p(d.process_intro, 'editable-lede') + `<div class="process-grid">${steps}</div>`;
}

function faq(d) {
  return node('h2', 'editable-title', d.faq_title) + (d.faqs || []).map(x => `<details class="faq-item">${node('summary', '', x.question)}${p(x.answer)}</details>`).join('');
}

function replaceSection(html, name, content) {
  // Fail loudly if the actual template changes: don't publish an incomplete home page.
  const target = `<div class="editable-content" data-section-content="${name}"></div>`;
  if (!html.includes(target)) throw new Error(`Nu am găsit secțiunea din șablon: ${name}`);
  return html.replace(target, `<div class="editable-content" data-section-content="${name}">${content}</div>`);
}

function updateTextNodes(html, d) {
  // Text from Pages CMS; use the same text-only behavior as editor-render.js.
  html = html.replace(/<([a-z][\w-]*)\b([^>]*\bdata-cms="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attributes, key) => typeof d[key] === 'string'
      ? `<${tag}${attributes}>${esc(d[key])}</${tag}>`
      : match);

  // Branding appears in both the header and footer.
  html = html.replace(/(<span class="brand-text"><strong>)[\s\S]*?(<\/strong><small>)[\s\S]*?(<\/small><\/span>)/g,
    (match, a, b, c) => `${a}${esc(d.brand_name)}${b}${esc(d.brand_subtitle)}${c}`);

  // Section headings and menu labels are also editable in Pages CMS.
  html = html.replace(/(<section\b[^>]*\bid="([^"]+)"[^>]*>\s*<div class="section-label"><span>)[\s\S]*?(<\/span>)/g,
    (match, start, key, end) => {
      const names = ['despre', 'parcurs', 'arii', 'ofer', 'tarife', 'colaborare', 'articole', 'resurse', 'faq', 'contact'];
      const i = names.indexOf(key);
      return i === -1 ? match : `${start}${esc(`${String(i + 1).padStart(2, '0')} / ${(d.section_labels || {})[key] || key.toUpperCase()}`)}${end}`;
    });
  html = html.replace(/<a\b([^>]*\bdata-nav="([^"]+)"[^>]*)>[\s\S]*?<\/a>/g,
    (match, attributes, key) => typeof (d.nav_labels || {})[key] === 'string'
      ? `<a${attributes}>${esc(d.nav_labels[key])}</a>` : match);

  // Retain the original image attributes and accessibility labels.
  html = html.replace(/<[^>]*\bdata-cms-alt="([^"]+)"[^>]*>/g, (tag, key) =>
    typeof d[key] === 'string' ? tag.replace(/\balt="[^"]*"/, `alt="${esc(d[key])}"`) : tag);
  html = html.replace(/<[^>]*\bdata-cms-aria="([^"]+)"[^>]*>/g, (tag, key) =>
    typeof d[key] === 'string' ? tag.replace(/\baria-label="[^"]*"/, `aria-label="${esc(d[key])}"`) : tag);
  html = html.replace(/<img\b[^>]*\bdata-cms-image="([^"]+)"[^>]*>/g, (tag, key) => {
    const src = d[key];
    if (typeof src !== 'string' || !/^\/?assets\/[^?#]+$/.test(src)) return tag;
    return tag.replace(/\bsrc="[^"]*"/, `src="${esc(src)}"`);
  });
  // Preserve object positioning chosen in the CMS.
  if (/^\d{1,3}% \d{1,3}%$/.test(d.hero_image_position || '')) {
    html = html.replace(/(<img\b[^>]*class="hero-photo"[^>]*)(\/>|>)/,
      (match, prefix, end) => `${prefix} style="object-position: ${esc(d.hero_image_position)}"${end}`);
  }
  return html;
}

function main() {
  if (!fs.existsSync(HOME) || !fs.existsSync(SITE)) {
    throw new Error('Rulează mai întâi scripts/build.js; lipsesc fișiere în dist/.');
  }
  const d = readJson('data/site.json');
  const articles = readJson('data/articles.json');
  const resources = readJson('data/resources.json');
  if (!Array.isArray(articles) || !Array.isArray(resources)) {
    throw new Error('Manifestele articolelor și resurselor trebuie să fie liste JSON.');
  }
  let html = fs.readFileSync(HOME, 'utf8');
  const renderers = {
    parcurs: professional(d),
    arii: focus(d),
    ofer: offer(d),
    tarife: pricing(d),
    colaborare: process(d),
    articole: articleCards(d, articles, 'articole'),
    resurse: articleCards(d, resources, 'resurse'),
    faq: faq(d)
  };
  for (const [name, output] of Object.entries(renderers)) {
    html = replaceSection(html, name, output);
  }
  html = updateTextNodes(html, d);
  // The contact form remains an empty mount point: extra-render.js binds its
  // events only in the browser. Do NOT generate a second static form here.
  if (!html.includes('<div id="contact-form"></div>')) {
    throw new Error('Formularul original a fost modificat; publicarea este oprită preventiv.');
  }
  if (!html.includes(esc(d.hero_title)) || !html.includes(esc(d.pricing_title))) {
    throw new Error('Conținutul principal nu a fost inserat complet în HTML.');
  }
  fs.writeFileSync(HOME, html, 'utf8');
  console.log(`SEO prerender finalizat: 8 secțiuni în HTML, ${articles.length} articole, ${resources.length} resurse.`);
}

main();
