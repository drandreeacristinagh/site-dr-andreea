# Site Dr. Andreea-Cristina Gheorghe — versiune completată

1. Încărcați **conținutul arhivei**, nu arhiva ca fișier, în rădăcina repository-ului GitHub.
2. Pages CMS citește `.pages.yml`, `data/site.json` și `data/privacy.json`. Editați textele din Pages CMS; inclusiv meniul, titlurile secțiunilor, tarifele, pașii, FAQ, formularele și politica de confidențialitate.
3. Formularul de contact folosește **mailto:** (deschide aplicația de e-mail a vizitatorului). **Nu trimite automat date și nu există backend.** Pentru trimitere directă din site trebuie integrat un serviciu de formulare, cu verificare GDPR și antispam.
4. Poziția fotografiei principale se ajustează în CMS prin `hero_image_position` (de exemplu `50% 13%`). Testați pe desktop și mobil.
5. **Important:** serviciile de planificare nutrițională individualizată pentru afecțiuni medicale și serviciile individuale de psihoeducație trebuie verificate juridic înainte de publicarea/comercializarea ofertei. Textele și prețurile sunt propuneri, nu o validare a dreptului de practică.
6. Imaginea de logo este o decupare raster a variantei alese, nu un fișier vectorial original. Poate fi înlocuită ulterior cu un SVG curat.
7. Testați local printr-un server HTTP (`python -m http.server 8000`) sau pe Cloudflare Pages; deschiderea directă a fișierului HTML nu permite fetch JSON.
