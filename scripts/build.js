
const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ARTICLES = path.join(ROOT, "content", "articole");
const DOMAIN = "https://drandreeacristinagheorghe.ro";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

const assetPath = (value) => {
  if (typeof value !== "string") return "";
  const src = value.trim();

  if (src.startsWith("/assets/")) return src;
  if (src.startsWith("assets/")) return "/" + src;

  return "";
};

const dateText = (value) => {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
};

const htmlFromMarkdown = (source) => {
  const raw = marked.parse(String(source || ""), {
    gfm: true,
    breaks: false
  });

  const safe = sanitizeHtml(raw, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption"
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "loading", "width", "height"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src"]
  });

  return safe.replace(
    /(<img\b[^>]*\bsrc=")assets\//g,
    '$1/assets/'
  );
};

function copySiteFiles() {
  const ignored = new Set([
    ".git",
    ".github",
    "node_modules",
    "dist",
    "scripts",
    "content"
  ]);

  for (const entry of fs.readdirSync(ROOT, {
    withFileTypes: true
  })) {
    if (ignored.has(entry.name)) continue;

    const source = path.join(ROOT, entry.name);
    const destination = path.join(DIST, entry.name);

    fs.cpSync(source, destination, {
      recursive: true,
      force: true
    });
  }
}

function renderArticle(article) {
  const title = escapeHtml(article.title);
  const summary = escapeHtml(article.summary);
  const category = escapeHtml(article.category);
  const author = escapeHtml(
    article.author || "Dr. Andreea-Cristina Gheorghe"
  );
  const date = escapeHtml(dateText(article.date));
  const canonical = `${DOMAIN}/articole/${article.slug}/`;
  const cover = assetPath(article.image);
  const coverAlt = escapeHtml(
    article.image_alt || article.title
  );

  const coverHtml = cover
    ? `<figure class="article-cover">
         <img src="${escapeHtml(cover)}"
              alt="${coverAlt}"
              loading="eager"/>
       </figure>`
    : "";

  const bibliographyHtml = article.bibliography
    ? `<section class="bibliography">
         <h2>Bibliografie</h2>
         ${htmlFromMarkdown(article.bibliography)}
       </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} | Dr. Andreea-Cristina Gheorghe</title>
<meta name="description" content="${escapeHtml(
  article.seo_description || article.summary
)}"/>
<link rel="canonical" href="${canonical}"/>
<meta name="theme-color" content="#f7f5f0"/>
<meta property="og:type" content="article"/>
<meta property="og:locale" content="ro_RO"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${summary}"/>
<link rel="icon" href="/assets/favicon-logo.png" type="image/png"/>
<link rel="stylesheet" href="/assets/styles.css"/>

<style>
body {
  margin: 0;
  background: #f7f5f0;
  color: #303c33;
}
.article-top {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 24px;
}
.article-top a {
  color: #506a56;
  text-decoration: none;
}
.article-layout {
  max-width: 790px;
  margin: 0 auto;
  padding: 48px 24px 100px;
}
.article-category {
  color: #617c65;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .12em;
}
.article-layout h1 {
  font-size: clamp(2rem, 5vw, 3.8rem);
  line-height: 1.16;
  margin: 20px 0;
}
.article-summary {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #526157;
}
.article-meta {
  font-size: .9rem;
  color: #617067;
  margin: 24px 0 38px;
}
.article-cover {
  margin: 30px 0 45px;
}
.article-cover img,
.article-body img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 14px;
}
.article-body {
  font-size: 1.05rem;
  line-height: 1.85;
  overflow-wrap: anywhere;
}
.article-body h2,
.bibliography h2 {
  margin-top: 2em;
}
.article-body h3 {
  margin-top: 1.6em;
}
.article-body p,
.article-body ul,
.article-body ol {
  margin-bottom: 1.3em;
}
.article-body a,
.bibliography a {
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
.article-body th,
.article-body td {
  border: 1px solid #cbd5cb;
  padding: 10px;
}
.article-body blockquote {
  border-left: 3px solid #819983;
  margin-left: 0;
  padding-left: 22px;
}
.bibliography {
  border-top: 1px solid #cbd5cb;
  margin-top: 60px;
  padding-top: 16px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.article-footer {
  text-align: center;
  padding: 30px 20px;
  border-top: 1px solid #d7ddd3;
}
.article-footer a {
  color: #506a56;
}
</style>

<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.summary,
  mainEntityOfPage: canonical,
  author: {
    "@type": "Person",
    "@id": `${DOMAIN}/#person`,
    name: article.author || "Dr. Andreea-Cristina Gheorghe"
  },
  publisher: {
    "@type": "Person",
    "@id": `${DOMAIN}/#person`,
    name: "Dr. Andreea-Cristina Gheorghe"
  },
  ...(article.date && !Number.isNaN(
    new Date(article.date).getTime()
  ) ? {
    datePublished: new Date(article.date).toISOString()
  } : {}),
  ...(cover ? { image: `${DOMAIN}${cover}` } : {})
}).replace(/</g, "\\u003c")}
</script>
</head>

<body>
<header class="article-top">
  <a href="/#articole">← Înapoi la articole</a>
</header>

<main class="article-layout">
  <article>
    <p class="article-category">${category}</p>
    <h1>${title}</h1>
    <p class="article-summary">${summary}</p>
    <p class="article-meta">${author}${date ? " · " + date : ""}</p>
    ${coverHtml}
    <div class="article-body">
      ${htmlFromMarkdown(article.body)}
    </div>
    ${bibliographyHtml}
  </article>
</main>

<footer class="article-footer">
  <a href="/">Dr. Andreea-Cristina Gheorghe</a>
  <p>Material informativ și educațional.
  Nu înlocuiește evaluarea medicală individuală.</p>
  <a href="/privacy.html">Confidențialitate</a>
  ·
  <a href="/terms.html">Termeni și condiții</a>
</footer>
</body>
</html>`;
}

function buildArticles() {
  const published = [];

  if (!fs.existsSync(ARTICLES)) {
    console.log("Nu există încă articole. Continuăm.");
    return published;
  }

  const files = fs.readdirSync(ARTICLES)
    .filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const source = fs.readFileSync(
      path.join(ARTICLES, file),
      "utf8"
    );

    const parsed = matter(source);
    const data = parsed.data;

    if (data.published !== true) continue;

    const slug = path.basename(file, ".md");

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        `Nume de fișier invalid pentru articol: ${file}`
      );
    }

    if (!data.title || !data.summary) {
      throw new Error(
        `Articolul ${file} nu are titlu sau rezumat.`
      );
    }

    const article = {
      ...data,
      slug,
      body: parsed.content || data.body || "",
      bibliography: data.bibliography || ""
    };

    const directory = path.join(
      DIST,
      "articole",
      slug
    );

    fs.mkdirSync(directory, { recursive: true });

    fs.writeFileSync(
      path.join(directory, "index.html"),
      renderArticle(article),
      "utf8"
    );

    published.push({
      slug,
      title: article.title,
      summary: article.summary,
      category: article.category || "",
      date: article.date || "",
      image: assetPath(article.image),
      image_alt: article.image_alt || article.title,
      url: `/articole/${slug}/`
    });
  }

  published.sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  return published;
}

function updateSitemap(articles) {
  const file = path.join(DIST, "sitemap.xml");

  if (!fs.existsSync(file)) return;

  let xml = fs.readFileSync(file, "utf8");

  const existingUrls = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map((match) => match[1])
  );

  const additional = articles
    .map((article) => `${DOMAIN}${article.url}`)
    .filter((url) => !existingUrls.has(url))
    .map((url) =>
      `  <url><loc>${escapeHtml(url)}</loc></url>`
    )
    .join("\n");

  xml = xml.replace(
    "</urlset>",
    `${additional ? additional + "\n" : ""}</urlset>`
  );

  fs.writeFileSync(file, xml, "utf8");
}

function main() {
  fs.rmSync(DIST, {
    recursive: true,
    force: true
  });

  fs.mkdirSync(DIST, { recursive: true });

  copySiteFiles();

  const articles = buildArticles();

  const manifestDirectory = path.join(
    DIST,
    "data"
  );

  fs.mkdirSync(manifestDirectory, {
    recursive: true
  });

  fs.writeFileSync(
    path.join(manifestDirectory, "articles.json"),
    JSON.stringify(articles, null, 2),
    "utf8"
  );

  updateSitemap(articles);

  console.log(
    `Build finalizat: ${articles.length} articole publicate.`
  );
}

main();
