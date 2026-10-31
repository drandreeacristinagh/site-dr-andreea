
(async function () {
  const data = await fetch('data/site.json', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Nu s-a putut încărca site.json');
      return r.json();
    });

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  const put = (node, text) => {
    if (node && typeof text === 'string') {
      node.textContent = text;
    }
  };

  const section = (id, title) => {
    const n = document.querySelector(
      '[data-section-content="' + id + '"]'
    );

    if (!n) return null;

    n.replaceChildren();

    if (title) {
      n.append(el('h2', 'editable-title', title));
    }

    return n;
  };

  const para = (parent, text, cls = '') => {
    if (text) parent.append(el('p', cls, text));
  };

  const heading = (parent, title) => {
    parent.append(el('h3', 'editable-subtitle', title));
  };

  const cards = (parent, items) => {
    const wrap = el('div', 'editable-cards');

    for (const item of items || []) {
      const card = el('article', 'editable-card');

      if (item.title) heading(card, item.title);
      para(card, item.description || '');

      if (item.title || item.description) {
        wrap.append(card);
      }
    }

    parent.append(wrap);
  };

  // NUMELE ȘI SUBTITLUL SITE-ULUI
  for (const n of document.querySelectorAll('.brand-text strong')) {
    put(n, data.brand_name);
  }

  for (const n of document.querySelectorAll('.brand-text small')) {
    put(n, data.brand_subtitle);
  }

  // TEXTELE ȘI FOTOGRAFIILE EDITABILE
  for (const n of document.querySelectorAll('[data-cms-aria]')) {
    const v = data[n.dataset.cmsAria];

    if (typeof v === 'string') {
      n.setAttribute('aria-label', v);
    }
  }

  for (const n of document.querySelectorAll('[data-cms-alt]')) {
    const v = data[n.dataset.cmsAlt];

    if (typeof v === 'string') {
      n.alt = v;
    }
  }

  for (const n of document.querySelectorAll('[data-cms]')) {
    const v = data[n.dataset.cms];

    if (typeof v === 'string') {
      put(n, v);
    }
  }

  for (const img of document.querySelectorAll('[data-cms-image]')) {
    const imagePath = data[img.dataset.cmsImage];

    if (
      typeof imagePath === 'string' &&
      /^(\/assets\/|assets\/)/.test(imagePath)
    ) {
      img.src = imagePath;
    }
  }

  // PARCURS PROFESIONAL
  const professional = section(
    'parcurs',
    data.professional_title
  );

  if (professional) {
    para(professional, data.professional_intro);

    const groups = [
      ['Studii universitare', data.professional_group_studies],
      ['Experiență profesională', data.professional_group_experience],
      ['Formare complementară', data.professional_group_training]
    ];

    const year = x =>
      Number((x.period || '').match(/20\d{2}/)?.[0] || 0);

    let found = false;

    for (const [category, label] of groups) {
      const entries = (data.professional_entries || [])
        .filter(x => x.category === category)
        .sort((a, b) => year(b) - year(a));

      if (!entries.length) continue;

      found = true;
      heading(professional, label);

      const wrap = el('div', 'timeline');

      for (const x of entries) {
        const item = el('div', 'timeline-item');

        para(item, x.period, 'timeline-period');

        if (x.title) heading(item, x.title);

        para(item, x.institution, 'timeline-institution');
        para(item, x.description);

        wrap.append(item);
      }

      professional.append(wrap);
    }

    const other = (data.professional_entries || [])
      .filter(x => !groups.some(g => g[0] === x.category))
      .sort((a, b) => year(b) - year(a));

    if (other.length) {
      found = true;

      const wrap = el('div', 'timeline');

      for (const x of other) {
        const item = el('div', 'timeline-item');

        para(item, x.period, 'timeline-period');

        if (x.title) heading(item, x.title);

        para(item, x.institution, 'timeline-institution');
        para(item, x.category, 'muted');
        para(item, x.description);

        wrap.append(item);
      }

      professional.append(wrap);
    }

    if (!found) {
      para(
        professional,
        data.professional_empty || '',
        'muted'
      );
    }
  }

  // DOMENII DE INTERES
  const focus = section('arii', data.focus_title);

  if (focus) {
    para(focus, data.focus_intro);

    if (data.focus_items?.length) {
      cards(focus, data.focus_items);
    } else {
      para(
        focus,
        data.focus_empty ||
          'Domeniile de interes vor fi disponibile în curând.',
        'muted'
      );
    }
  }

  // CE OFER
  const offer = section('ofer', data.offer_title);

  if (offer) {
    para(offer, data.offer_intro, 'editable-lede');

    const nut = el('div', 'offer-panel');

    if (data.nutrition_title) {
      heading(nut, data.nutrition_title);
    }

    para(nut, data.nutrition_intro, 'editable-lede');

    if (data.nutrition_areas?.length) {
      if (data.nutrition_areas_title) {
        heading(nut, data.nutrition_areas_title);
      }

      cards(nut, data.nutrition_areas);
    }

    para(
      nut,
      data.nutrition_disclaimer,
      'editable-disclaimer'
    );

    offer.append(nut);

    const psycho = el('div', 'offer-panel');

    if (data.psycho_title) {
      heading(psycho, data.psycho_title);
    }

    para(psycho, data.psycho_intro, 'editable-lede');
    para(psycho, data.psycho_description);

    if (data.psycho_topics?.length) {
      if (data.psycho_topics_title) {
        heading(psycho, data.psycho_topics_title);
      }

      para(
        psycho,
        data.psycho_topics.join(' · '),
        'topic-list'
      );
    }

    para(
      psycho,
      data.psycho_disclaimer,
      'editable-disclaimer'
    );

    const cta = el(
      'a',
      'button button-dark',
      data.nutrition_cta || 'Solicită informații'
    );

    cta.href = '#contact';
    psycho.append(cta);

    para(
      psycho,
      data.nutrition_cta_note,
      'muted'
    );

    offer.append(psycho);
  }

  // ARTICOLE
  // Articolele noi sunt preluate din lista generată automat
  // la publicarea site-ului: data/articles.json.
  const articles = section(
    'articole',
    data.articles_title
  );

  if (articles) {
    let items = [];
    let manifestAvailable = false;

    try {
      const response = await fetch(
        'data/articles.json',
        { cache: 'no-store' }
      );

      if (response.ok) {
        const result = await response.json();

        if (Array.isArray(result)) {
          items = result;
          manifestAvailable = true;
        }
      }
    } catch (error) {
      console.warn(
        'Lista articolelor noi nu este disponibilă încă.',
        error
      );
    }

    if (manifestAvailable) {
      // NOUL SISTEM: PAGINI INDIVIDUALE
      const published = items.filter(x =>
        typeof x.title === 'string' &&
        typeof x.url === 'string' &&
        /^\/articole\/[a-z0-9-]+\/$/.test(x.url)
      );

      if (!published.length) {
        para(
          articles,
          data.articles_empty ||
            'Articolele vor fi disponibile în curând.',
          'muted'
        );
      } else {
        const wrap = el('div', 'editable-cards');

        for (const x of published) {
          const card = el('article', 'editable-card');

          if (
            x.image &&
            /^(\/assets\/|assets\/)/.test(x.image)
          ) {
            const imageLink = el('a');

            imageLink.href = x.url;

            const img = el('img');

            img.src = x.image;
            img.alt = x.image_alt || x.title;
            img.loading = 'lazy';
            img.decoding = 'async';

            imageLink.append(img);
            card.append(imageLink);
          }

          if (x.category) {
            para(card, x.category, 'muted');
          }

          const title = el('h3', 'editable-subtitle');
          const titleLink = el('a', '', x.title);

          titleLink.href = x.url;
          titleLink.style.color = 'inherit';
          titleLink.style.textDecoration = 'none';

          title.append(titleLink);
          card.append(title);

          if (x.date) {
            const date = new Date(x.date);

            if (!Number.isNaN(date.getTime())) {
              para(
                card,
                new Intl.DateTimeFormat('ro-RO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC'
                }).format(date),
                'muted'
              );
            }
          }

          para(card, x.summary);

          const readMore = el(
            'a',
            'text-link',
            'Citește articolul →'
          );

          readMore.href = x.url;

          card.append(readMore);
          wrap.append(card);
        }

        articles.append(wrap);
      }
    } else {
      // SISTEMUL VECHI:
      // Este păstrat temporar până la activarea build-ului.
      const oldItems = (data.articles || [])
        .filter(x => x.published === true);

      if (!oldItems.length) {
        para(
          articles,
          data.articles_empty ||
            'Articolele vor fi disponibile în curând.',
          'muted'
        );
      } else {
        const wrap = el('div', 'editable-cards');

        for (const x of oldItems) {
          const card = el('article', 'editable-card');

          if (
            x.image &&
            /^(\/assets\/|assets\/)/.test(x.image)
          ) {
            const img = el('img');

            img.src = x.image;
            img.alt = x.title || '';
            img.loading = 'lazy';

            card.append(img);
          }

          heading(card, x.title);
          para(card, x.category, 'muted');
          para(card, x.summary);

          const body = el('div', 'article-body');

          for (const line of (x.body || '')
            .split(/\n\s*\n/)) {
            para(body, line);
          }

          card.append(body);
          wrap.append(card);
        }

        articles.append(wrap);
      }
    }
  }

  // RESURSE
  // Acceptă imagini, PDF-uri și linkuri externe,
  // păstrând compatibilitatea cu resursele vechi.
  const resources = section(
    'resurse',
    data.resources_title
  );

  if (resources) {
    const items = (data.resources || [])
      .filter(x => x && x.published === true);

    if (!items.length) {
      para(
        resources,
        data.resources_empty,
        'muted'
      );
    } else {
      const wrap = el('div', 'editable-cards');

      // Stiluri aplicate exclusiv secțiunii Resurse.
      wrap.style.display = 'grid';
      wrap.style.gridTemplateColumns =
        'repeat(auto-fit, minmax(min(100%, 280px), 1fr))';
      wrap.style.gap = '24px';
      wrap.style.alignItems = 'stretch';

      const localAsset = value => {
        if (typeof value !== 'string') return '';

        const normalized = value.trim();

        if (/^\/assets\/[^?#]+$/i.test(normalized)) {
          return normalized;
        }

        if (/^assets\/[^?#]+$/i.test(normalized)) {
          return '/' + normalized;
        }

        return '';
      };

      const safeLink = value => {
        if (typeof value !== 'string') return '';

        const normalized = value.trim();

        if (/^https?:\/\/[^\s]+$/i.test(normalized)) {
          return normalized;
        }

        if (/^\/(?!\/)[^\s]*$/.test(normalized)) {
          return normalized;
        }

        return '';
      };

      for (const x of items) {
        const card = el('article', 'editable-card');

        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.minWidth = '0';
        card.style.overflow = 'hidden';

        const imagePath = localAsset(x.image);
        const filePath = localAsset(x.file);
        const externalUrl = safeLink(x.url);

        // Imagine de prezentare
        if (imagePath) {
          const imageLink = el('a');
          imageLink.href = imagePath;
          imageLink.target = '_blank';
          imageLink.rel = 'noopener noreferrer';
          imageLink.setAttribute(
            'aria-label',
            'Vezi imaginea: ' + (x.title || 'Resursă')
          );

          const img = el('img');

          img.src = imagePath;
          img.alt = x.title || 'Imagine resursă educațională';
          img.loading = 'lazy';
          img.decoding = 'async';

          img.style.display = 'block';
          img.style.width = '100%';
          img.style.aspectRatio = '16 / 10';
          img.style.objectFit = 'contain';
          img.style.borderRadius = '6px';
          img.style.marginBottom = '16px';

          imageLink.append(img);
          card.append(imageLink);
        }

        // Categoria resursei
        if (x.category) {
          para(card, x.category, 'muted');
        }

        // Titlu și descriere
        if (x.title) {
          heading(card, x.title);
        }

        para(card, x.description);

        // Zona cu linkuri și documente
        const actions = el('div', 'resource-actions');

        actions.style.display = 'flex';
        actions.style.flexDirection = 'column';
        actions.style.alignItems = 'flex-start';
        actions.style.gap = '10px';
        actions.style.marginTop = 'auto';
        actions.style.paddingTop = '16px';

        // PDF încărcat în Pages CMS
        if (
          filePath &&
          /\.pdf$/i.test(filePath)
        ) {
          const download = el(
            'a',
            'text-link',
            'Descarcă PDF ↓'
          );

          download.href = filePath;
          download.setAttribute('download', '');
          download.setAttribute(
            'aria-label',
            'Descarcă PDF: ' + (x.title || 'Resursă')
          );

          actions.append(download);
        }

        // Link către sursă externă
        if (externalUrl) {
          const external = el(
            'a',
            'text-link',
            data.resource_open_text ||
              'Accesează resursa ↗'
          );

          external.href = externalUrl;
          external.rel = 'noopener noreferrer';

          if (/^https?:\/\//i.test(externalUrl)) {
            external.target = '_blank';
          }

          actions.append(external);
        }

        // Pentru imagini fără PDF sau link extern
        if (
          imagePath &&
          !filePath &&
          !externalUrl
        ) {
          const viewImage = el(
            'a',
            'text-link',
            'Vezi imaginea ↗'
          );

          viewImage.href = imagePath;
          viewImage.target = '_blank';
          viewImage.rel = 'noopener noreferrer';

          actions.append(viewImage);
        }

        if (actions.children.length) {
          card.append(actions);
        }

        wrap.append(card);
      }

      resources.append(wrap);
    }
  }

  // SECȚIUNI SUPLIMENTARE
  const contact = document.getElementById('contact');

  if (contact && data.extra_sections?.length) {
    const extras = el(
      'section',
      'section editable-section'
    );

    extras.id = 'suplimentar';

    for (const x of data.extra_sections) {
      heading(extras, x.title);
      para(extras, x.description);
    }

    contact.before(extras);

    const nav = document.querySelector('.nav');

    if (nav) {
      const a = el('a', '', 'Alte informații');

      a.href = '#suplimentar';

      nav.insertBefore(
        a,
        nav.querySelector('.nav-cta')
      );
    }
  }

  // CONTACT - E-MAIL
  const email = document.getElementById('emailLink');

  if (email) {
    if (data.contact_email) {
      email.textContent = data.contact_email;
      email.href = 'mailto:' + data.contact_email;
    } else {
      email.textContent = 'E-mail disponibil la cerere';
      email.removeAttribute('href');
    }
  }

  // CONTACT - WHATSAPP
  const wa = document.getElementById('whatsappLink');

  if (wa) {
    const digits = (data.contact_whatsapp || '')
      .replace(/\D/g, '');

    if (digits) {
      wa.textContent =
        data.contact_whatsapp_text || 'WhatsApp';

      wa.href = 'https://wa.me/' + digits;
    } else {
      wa.textContent = 'WhatsApp indisponibil momentan';
      wa.removeAttribute('href');
    }
  }

  // CONTACT - INSTAGRAM
  const insta = document.getElementById('instagramLink');

  if (
    insta &&
    /^https:\/\//.test(data.contact_instagram || '')
  ) {
    insta.href = data.contact_instagram;

    insta.textContent =
      data.contact_instagram_text || 'Instagram';

    insta.target = '_blank';
    insta.rel = 'noopener noreferrer';
  }

})().catch(e =>
  console.error('Eroare de încărcare conținut CMS', e)
);
