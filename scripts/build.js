
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ARTICLES = path.join(ROOT, 'content', 'articole');
const RESOURCES = path.join(ROOT, 'content', 'resurse');
const DOMAIN = 'https://drandreeacristinagheorghe.ro';

const escapeHtml = value =>
  String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));

function assetPath(value) {
  if (typeof value !== 'string') return '';

  const src = value.trim();

  if (/^\/assets\/[^?#]+$/i.test(src)) return src;
  if (/^assets\/[^?#]+$/i.test(src)) return '/' + src;

  return '';
}

function safeExternalUrl(value) {
  if (typeof value !== 'string') return '';

  const url = value.trim();

  try {
    const parsed = new URL(url);

    if (['https:', 'http:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (error) {
    return '';
  }

  return '';
}

function dateText(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function htmlFromMarkdown(source) {
  const raw = marked.parse(
    String(source || ''),
    { gfm: true, breaks: false }
  );

  const safe = sanitizeHtml(raw, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'figure',
      'figcaption'
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'title', 'target', 'rel'],
      img: [
        'src',
        'alt',
        'title',
        'loading',
        'width',
        'height'
      ]
    },
    allowedSchemes: [
      'http',
      'https',
      'mailto'
    ],
    allowedSchemesAppliedToAttributes: [
      'href',
      'src'
    ]
  });

  return safe.replace(
    /(<img\b[^>]*\bsrc=")assets\//g,
    '$1/assets/'
  );
}

function copySiteFiles() {
  const ignored = new Set([
    '.git',
    '.github',
    'node_modules',
    'dist',
    'scripts',
    'content'
  ]);

  for (const entry of fs.readdirSync(ROOT, {
    withFileTypes: true
  })) {
    if (ignored.has(entry.name)) continue;

    fs.cpSync(
      path.join(ROOT, entry.name),
      path.join(DIST, entry.name),
      {
        recursive: true,
        force: true
      }
    );
  }
}

function addArticleCardStyles() {
  const css = `
/* Carduri articole: desktop 3, tabletă 2, telefon 1 */
#articole .editable-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 26px;
}
#articole .editable-card {
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 0 22px;
  background: #fffefa;
  border: 1px solid #e3e4dc;
  border-radius: 9px;
  box-shadow: 0 4px 18px rgba(37, 40, 32, .035);
}
#articole .editable-card > a:has(img) {
  display: block;
  width: 100%;
  overflow: hidden;
}
#articole .editable-card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0;
  margin: 0;
}
#articole .editable-card > h3,
#articole .editable-card > p,
#articole .editable-card > a.text-link {
  margin-left: 22px;
  margin-right: 22px;
}
#articole .editable-card > p.muted {
  margin-top: 19px;
  margin-bottom: 8px;
  font-size: 11px;
  letter-spacing: .06em;
  color: #647861;
}
#articole .editable-card > h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(20px, 2vw, 25px);
  line-height: 1.35;
  font-weight: 500;
}
#articole .editable-card > p:not(.muted) {
  font-size: 13px;
  line-height: 1.75;
  color: #60685f;
  margin-top: 0;
  margin-bottom: 18px;
}
#articole .editable-card > a.text-link {
  display: inline-block;
  align-self: flex-start;
  margin-top: auto;
  font-weight: 600;
  color: #455f48;
}
#articole .editable-card a:focus-visible {
  outline: 2px solid #617c65;
  outline-offset: 4px;
}
@media (max-width: 950px) {
  #articole .editable-cards {
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 18px;
  }
}
@media (max-width: 620px) {
  #articole .editable-cards {
    grid-template-columns: minmax(0,1fr);
    gap: 22px;
  }
}
`;

  // Resursele vor avea același design ca articolele.
  const resourceCss = css.replaceAll(
    '#articole',
    '#resurse'
  );

  const cssPath = path.join(
    DIST,
    'assets',
    'styles.css'
  );

  if (!fs.existsSync(cssPath)) {
    throw new Error('Lipsește assets/styles.css');
  }

  fs.appendFileSync(
    cssPath,
    '\n' + css + '\n' + resourceCss,
    'utf8'
  );
}

function pageStyles() {
  return `
body {
  margin: 0;
  background: #f7f5f0;
  color: #303c33;
}
.article-top {
  max-width: 820px;
  margin: auto;
  padding: 30px 24px 0;
}
.article-top a {
  color: #506a56;
  font-size: 13px;
  text-decoration: none;
}
.article-layout {
  max-width: 820px;
  margin: auto;
  padding: 45px 24px 90px;
}
.article-layout .article-category {
  margin: 0 0 17px;
  color: #617c65;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .13em;
}
.article-layout h1 {
  margin: 0 0 18px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(34px, 5vw, 59px);
  font-weight: 500;
  line-height: 1.16;
  letter-spacing: -.035em;
}
.article-layout .article-meta {
  display: block;
  margin: 0 0 23px;
  font-size: 13px;
  color: #617067;
}
.article-layout .article-summary {
  margin: 0 0 30px;
  font-size: 18px;
  line-height: 1.8;
  color: #526157;
}
.article-cover {
  margin: 0 0 43px;
  text-align: center;
}
.article-cover img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
  aspect-ratio: auto;
  object-fit: contain;
  border-radius: 8px;
}
.article-layout .article-body {
  margin-top: 0;
  font-size: 16px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
.article-body img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px auto;
}
.article-body h2,
.bibliography h2,
.resource-materials h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 500;
  font-size: 29px;
  margin: 1.7em 0 .6em;
}
.article-body h3 {
  margin-top: 1.5em;
}
.article-body p,
.article-body ul,
.article-body ol {
  margin-bottom: 1.3em;
}
.article-body a,
.bibliography a,
.resource-materials a {
  color: #416b50;
  text-decoration: underline;
  overflow-wrap: anywhere;
}
.article-body table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}
.article-body td,
.article-body th {
  border: 1px solid #cbd5cb;
  padding: 10px;
}
.article-body blockquote {
  margin-left: 0;
  padding-left: 20px;
  border-left: 3px solid #819983;
}
.bibliography,
.resource-materials {
  border-top: 1px solid #d6dcd3;
  margin-top: 55px;
  padding-top: 20px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.bibliography ol,
.bibliography ul {
  padding-left: 22px;
}
.resource-document {
  padding: 18px 0;
  border-bottom: 1px solid #e0e4dc;
}
.resource-document h3 {
  margin: 0 0 7px;
  font-size: 17px;
  font-weight: 600;
}
.resource-document p {
  margin: 0 0 12px;
  color: #617067;
  font-size: 14px;
}
.resource-document a,
.resource-link a {
  display: inline-block;
  font-weight: 600;
}
.resource-link {
  margin: 12px 0;
}
.article-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 35px 20px 42px;
  text-align: center;
  border-top: 1px solid #d7ddd3;
}
.article-footer p {
  font-size: 12px;
  color: #666e65;
  margin: 0 0 5px;
}
.article-footer a {
  color: #506a56;
}
.article-footer .footer-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
}
.article-footer .footer-legal {
  font-size: 12px;
}
@media (max-width: 600px) {
  .article-layout {
    padding-top: 35px;
    padding-bottom: 60px;
  }
  .article-layout .article-summary {
    font-size: 16px;
  }
}
`;
}

function footerHtml() {
  return `
<footer class="article-footer">
<p>Material informativ și educațional. Nu înlocuiește evaluarea medicală individuală.</p>
<a class="footer-name" href="/">Dr. Andreea-Cristina Gheorghe</a>
<div class="footer-legal"><a href="/privacy.html">Confidențialitate</a> · <a href="/terms.html">Termeni și condiții</a></div>
</footer>`;
}

function pageHtml({
  title,
  summary,
  seoDescription,
  canonical,
  category,
  author,
  date,
  image,
  imageAlt,
  body,
  extraHtml,
  pageType,
  backLink,
  backText,
  jsonld
}) {
  const cover = assetPath(image);

  const coverHtml = cover
    ? `<figure class="article-cover"><img src="${escapeHtml(cover)}" alt="${escapeHtml(imageAlt || title)}" loading="eager"></figure>`
    : '';

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Dr. Andreea-Cristina Gheorghe</title>
<meta name="description" content="${escapeHtml(seoDescription || summary)}">
<meta name="theme-color" content="#f7f5f0">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="${escapeHtml(pageType)}">
<meta property="og:locale" content="ro_RO">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(summary)}">
<link rel="icon" type="image/png" href="/assets/favicon-logo.png">
<link rel="stylesheet" href="/assets/styles.css">
<style>${pageStyles()}</style>
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header class="article-top"><a href="${escapeHtml(backLink)}">← ${escapeHtml(backText)}</a></header>
<main class="article-layout">
<article>
<p class="article-category">${escapeHtml(category || 'Material educațional')}</p>
<h1>${escapeHtml(title)}</h1>
<p class="article-meta">${escapeHtml(author || '')}${date ? ' · ' + escapeHtml(dateText(date)) : ''}</p>
<p class="article-summary">${escapeHtml(summary)}</p>
${coverHtml}
<div class="article-body">${htmlFromMarkdown(body)}</div>
${extraHtml || ''}
</article>
</main>
${footerHtml()}
</body>
</html>`;
}

function renderArticle(article) {
  const canonical =
    `${DOMAIN}/articole/${article.slug}/`;

  const bibliographyHtml = article.bibliography
    ? `<section class="bibliography"><h2>Bibliografie</h2>${htmlFromMarkdown(article.bibliography)}</section>`
    : '';

  const cover = assetPath(article.image);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Person',
      '@id': `${DOMAIN}/#person`,
      name:
        article.author ||
        'Dr. Andreea-Cristina Gheorghe'
    },
    publisher: {
      '@type': 'Person',
      '@id': `${DOMAIN}/#person`,
      name: 'Dr. Andreea-Cristina Gheorghe'
    },
    ...(
      article.date &&
      !Number.isNaN(new Date(article.date).getTime())
        ? {
            datePublished:
              new Date(article.date).toISOString()
          }
        : {}
    ),
    ...(cover
      ? { image: `${DOMAIN}${cover}` }
      : {})
  };

  return pageHtml({
    title: article.title,
    summary: article.summary,
    seoDescription: article.seo_description,
    canonical,
    category: article.category,
    author:
      article.author ||
      'Dr. Andreea-Cristina Gheorghe',
    date: article.date,
    image: article.image,
    imageAlt: article.image_alt,
    body: article.body,
    extraHtml: bibliographyHtml,
    pageType: 'article',
    backLink: '/#articole',
    backText: 'Înapoi la articole',
    jsonld
  });
}

function renderResource(resource) {
  const canonical =
    `${DOMAIN}/resurse/${resource.slug}/`;

  const documents = Array.isArray(resource.documents)
    ? resource.documents
    : [];

  const links = Array.isArray(resource.links)
    ? resource.links
    : [];

  const validDocuments = documents
    .filter(x =>
      x &&
      assetPath(x.file) &&
      /\.pdf$/i.test(assetPath(x.file))
    );

  const validLinks = links
    .filter(x => x && safeExternalUrl(x.url));

  let materials = '';

  if (validDocuments.length || validLinks.length) {
    materials += `
<section class="resource-materials">
<h2>Materiale și documente</h2>`;

    for (const document of validDocuments) {
      const url = assetPath(document.file);

      materials += `
<div class="resource-document">
<h3>${escapeHtml(document.title || 'Document PDF')}</h3>
${document.description
  ? `<p>${escapeHtml(document.description)}</p>`
  : ''}
<a href="${escapeHtml(url)}" download>Descarcă PDF ↓</a>
</div>`;
    }

    if (validLinks.length) {
      materials += '<h2>Linkuri utile</h2>';

      for (const link of validLinks) {
        materials += `
<p class="resource-link">
<a href="${escapeHtml(safeExternalUrl(link.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title || 'Accesează resursa')} ↗</a>
</p>`;
      }
    }

    materials += '</section>';
  }

  const cover = assetPath(resource.image);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: resource.title,
    description: resource.summary,
    url: canonical,
    ...(resource.source
      ? {
          creator: {
            '@type': 'Organization',
            name: resource.source
          }
        }
      : {}),
    ...(
      resource.date &&
      !Number.isNaN(new Date(resource.date).getTime())
        ? {
            datePublished:
              new Date(resource.date).toISOString()
          }
        : {}
    ),
    ...(cover
      ? { image: `${DOMAIN}${cover}` }
      : {})
  };

  return pageHtml({
    title: resource.title,
    summary: resource.summary,
    seoDescription: resource.seo_description,
    canonical,
    category: resource.category,
    author: resource.source || '',
    date: resource.date,
    image: resource.image,
    imageAlt: resource.image_alt,
    body: resource.body,
    extraHtml: materials,
    pageType: 'website',
    backLink: '/#resurse',
    backText: 'Înapoi la resurse',
    jsonld
  });
}

function buildCollection({
  sourceDirectory,
  outputDirectory,
  render,
  label
}) {
  const published = [];

  if (!fs.existsSync(sourceDirectory)) {
    console.log(
      `Nu există încă ${label}. Continuăm.`
    );
    return published;
  }

  const files = fs.readdirSync(sourceDirectory)
    .filter(file => file.endsWith('.md'));

  for (const file of files) {
    const parsed = matter(
      fs.readFileSync(
        path.join(sourceDirectory, file),
        'utf8'
      )
    );

    const data = parsed.data;

    if (data.published !== true) continue;

    const slug = path.basename(file, '.md');

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        `Nume de fișier invalid: ${file}`
      );
    }

    if (!data.title || !data.summary) {
      throw new Error(
        `${file} nu are titlu sau rezumat.`
      );
    }

    const item = {
      ...data,
      slug,
      body: parsed.content || data.body || ''
    };

    const directory = path.join(
      DIST,
      outputDirectory,
      slug
    );

    fs.mkdirSync(directory, {
      recursive: true
    });

    fs.writeFileSync(
      path.join(directory, 'index.html'),
      render(item),
      'utf8'
    );

    published.push({
      slug,
      title: item.title,
      summary: item.summary,
      category: item.category || '',
      date: item.date || '',
      image: assetPath(item.image),
      image_alt: item.image_alt || item.title,
      url: `/${outputDirectory}/${slug}/`
    });
  }

  published.sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  return published;
}

function updateSitemap(items) {
  const file = path.join(
    DIST,
    'sitemap.xml'
  );

  if (!fs.existsSync(file)) return;

  let xml = fs.readFileSync(file, 'utf8');

  const existing = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map(match => match[1])
  );

  const additional = items
    .map(item => `${DOMAIN}${item.url}`)
    .filter(url => !existing.has(url))
    .map(url =>
      `  <url><loc>${escapeHtml(url)}</loc></url>`
    )
    .join('\n');

  xml = xml.replace(
    '</urlset>',
    `${additional ? additional + '\n' : ''}</urlset>`
  );

  fs.writeFileSync(file, xml, 'utf8');
}

function main() {
  fs.rmSync(DIST, {
    recursive: true,
    force: true
  });

  fs.mkdirSync(DIST, {
    recursive: true
  });

  copySiteFiles();
  addArticleCardStyles();

  // ARTICOLE INDIVIDUALE
  const articles = buildCollection({
    sourceDirectory: ARTICLES,
    outputDirectory: 'articole',
    render: renderArticle,
    label: 'articole'
  });

  // RESURSE INDIVIDUALE
  const resources = buildCollection({
    sourceDirectory: RESOURCES,
    outputDirectory: 'resurse',
    render: renderResource,
    label: 'resurse'
  });

  const manifestDir = path.join(
    DIST,
    'data'
  );

  fs.mkdirSync(manifestDir, {
    recursive: true
  });

  fs.writeFileSync(
    path.join(manifestDir, 'articles.json'),
    JSON.stringify(articles, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(manifestDir, 'resources.json'),
    JSON.stringify(resources, null, 2),
    'utf8'
  );

  updateSitemap([
    ...articles,
    ...resources
  ]);

  console.log(
    `Build finalizat: ${articles.length} articole și ${resources.length} resurse publicate.`
  );
}

main();
