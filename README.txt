SITE PERSONAL — DR. ANDREEA-CRISTINA GHEORGHE
================================================

Ce include
- index.html: pagina principală, secțiuni Despre mine, Domenii de interes, Articole, Resurse, Contact
- articles/: trei pagini de articole demonstrative
- assets/styles.css: design responsive
- assets/script.js: meniu mobil, căutare și filtre de articole, setări de contact
- privacy.html: model orientativ de pagină de confidențialitate

IMPORTANT ÎNAINTE DE PUBLICARE
1. În assets/script.js, înlocuiește CONTACT_EMAIL, WHATSAPP_NUMBER și INSTAGRAM_URL cu datele corecte.
2. Revizuiește formulările despre statutul profesional și serviciile oferite. Nu publica servicii care nu sunt încă disponibile sau autorizate.
3. Cele trei articole sunt schițe demonstrative, nu materiale medicale finale. Verifică fiecare afirmație și adaugă bibliografie înainte de publicare.
4. Completează pagina de confidențialitate cu informații juridice corecte, inclusiv pentru orice servicii terțe pe care le integrezi.
5. Linkurile de programare nu sunt încă conectate la un calendar. Poți adăuga ulterior un link Calendly sau alt serviciu, după ce verifici planul gratuit și condițiile de prelucrare a datelor.
6. Google Fonts se încarcă dintr-un serviciu extern. Dacă vrei să eviți conexiuni externe, fonturile pot fi înlocuite cu fonturi de sistem.

PREVIZUALIZARE LOCALĂ
- Deschide index.html în browser pentru a vedea site-ul.
- Pentru testare mai bună, poți folosi extensia Live Server din VS Code.

PUBLICARE GRATUITĂ PE CLOUDFLARE PAGES (manual)
1. Creează un cont GitHub și un repository nou, de exemplu `site-personal`.
2. Încarcă toate fișierele și folderele din acest pachet în repository.
3. Creează un cont Cloudflare și intră la Workers & Pages > Create > Pages > Connect to Git.
4. Conectează repository-ul.
5. Pentru un site HTML simplu, selectează framework preset „None”; nu este necesară o comandă de build. Dacă platforma cere un director de output, folosește `/` sau lasă-l gol conform interfeței curente.
6. După deploy, Cloudflare va furniza un subdomeniu `*.pages.dev`.
7. După ce site-ul funcționează, conectează domeniul cumpărat urmând instrucțiunile Cloudflare.

ADMINISTRAREA VIZUALĂ A ARTICOLELOR
Acest pachet este site-ul de bază; nu are încă un CMS conectat. Pentru editor vizual, Pages CMS (pagescms.org) poate fi configurat ulterior pe repository-ul GitHub. Configurarea CMS și permisiunile GitHub trebuie făcute din contul tău; nu sunt incluse automat doar prin încărcarea fișierelor.

COSTURI
Cloudflare Pages și fișierele site-ului pot fi folosite gratuit în limitele planurilor lor. Domeniul se plătește separat, anual. Serviciile externe opționale pot avea limite sau costuri proprii.
