// Genera páginas estáticas pre-renderizadas para el blog de GoSmArtic a partir
// de data/blog-posts.json (repo gosmartic-offers), para que bots sin JS
// (Googlebot, WhatsApp, Telegram, Facebook) puedan indexar/mostrar preview
// de cada artículo. Sin dependencias: solo fetch/fs nativos de Node 18+.
//
// Uso:
//   node scripts/generate-blog.js
//   BLOG_DATA_URL=../gosmartic-offers/data/blog-posts.json node scripts/generate-blog.js   (dry-run local)

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://gosmartic.com';
const DEFAULT_DATA_URL = 'https://raw.githubusercontent.com/Villajr130/gosmartic-offers/main/data/blog-posts.json';
const ROOT_DIR = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');

const HEAD_ASSETS = `    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({ appId: "c97cc58d-ce41-48b8-b7ef-0e8ba3df6ad5" });
      });
    </script>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CATEGORY_LABELS = ['PC & Laptop', 'Telefoni', 'Smart TV', 'Accessori Tech'];

function renderLogo() {
  return `<div class="flex items-center space-x-2 select-none">
        <div class="relative w-9 h-9 bg-[#2563eb] rounded-full flex items-center justify-center shadow-md">
          <span class="text-white font-sans font-bold text-lg">G</span>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-[#06b6d4] rounded-full ring-1 ring-black"></span>
        </div>
        <span class="font-sans font-bold text-xl tracking-tight text-white">
          Go<span class="text-[#06b6d4]">Sm</span>Ar<span class="text-[#06b6d4]">tic</span>
        </span>
      </div>`;
}

function renderHeader() {
  const categoryLinks = CATEGORY_LABELS
    .map(label => `<a href="/" class="font-sans font-medium text-sm md:text-base transition-colors px-2 py-1 rounded text-gray-300 hover:text-[#06b6d4]">${escapeHtml(label)}</a>`)
    .join('\n          ');

  return `<header class="bg-black border-b border-gray-900 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto min-h-[80px] py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="cursor-pointer flex-shrink-0">
          ${renderLogo()}
        </div>
        <nav class="flex items-center space-x-2 md:space-x-6 max-w-full overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pb-2 md:pb-0 px-2">
          <a href="/" class="font-sans font-medium text-sm md:text-base transition-colors px-2 py-1 rounded text-[#06b6d4]">In Evidenza</a>
          ${categoryLinks}
          <a href="/blog/" class="font-sans font-medium text-sm md:text-base text-gray-300 hover:text-[#06b6d4] px-2 py-1 rounded">Blog</a>
        </nav>
      </div>
    </header>`;
}

function renderFooter() {
  const categoryButtons = CATEGORY_LABELS
    .map(label => `<li><button class="hover:text-[#06b6d4] transition-colors text-left text-gray-400">${escapeHtml(label)}</button></li>`)
    .join('\n              ');

  return `<footer class="bg-black text-gray-400 font-sans border-t border-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div class="space-y-4">
            ${renderLogo()}
            <p class="text-sm text-gray-500 max-w-sm leading-relaxed">
              Il tuo portale di fiducia per trovare la migliore tecnologia selezionata direttamente da Amazon. Qualità ed efficienza garantite per il 2026.
            </p>
          </div>
          <div>
            <h4 class="text-white font-bold tracking-wider uppercase text-sm mb-4">Categorie</h4>
            <ul class="space-y-2 text-sm">
              ${categoryButtons}
              <li><a href="/blog/" class="hover:text-[#06b6d4] transition-colors text-left text-gray-400">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-bold tracking-wider uppercase text-sm mb-4">Legale</h4>
            <ul class="space-y-2 text-sm">
              <li><button class="hover:text-[#06b6d4] transition-colors text-left block">Privacy Policy</button></li>
              <li><button class="hover:text-[#06b6d4] transition-colors text-left block">Termini di servizio</button></li>
              <li><button class="hover:text-[#06b6d4] transition-colors text-left block mt-1">Contatti</button></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-900 my-8"></div>
        <div class="text-center space-y-4">
          <p class="text-sm text-gray-500">&copy; 2026 GoSmArtic. Tutti i diritti riservati.</p>
          <p class="text-xs text-gray-600 max-w-3xl mx-auto leading-normal">
            Disclaimer di affiliazione: GoSmArtic partecipa al Programma Affiliazione Amazon EU. La commissione non comporta alcun costo aggiuntivo per l'utente.
          </p>
        </div>
      </div>
    </footer>`;
}

function renderNotificationButton() {
  return `<button class="inline-flex items-center gap-2 font-sans font-bold text-sm bg-[#2563eb] text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">🔔 Attiva notifiche push</button>`;
}

function renderWhatsAppButton() {
  return `<a href="https://whatsapp.com/channel/0029Vb8JW5c8kyyNuVPTEZ1u" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 font-sans font-bold text-sm bg-[#25D366] text-white px-4 py-2.5 rounded-lg hover:bg-[#1DA851] transition-colors">💬 Segui il canale WhatsApp</a>`;
}

function renderNewsletterForm() {
  return `<form action="https://buttondown.email/api/emails/embed-subscribe/villa" method="post" target="popupwindow" class="flex flex-col sm:flex-row gap-2">
        <input type="email" name="email" required placeholder="La tua email" class="flex-grow border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <button type="submit" class="font-sans font-bold text-sm bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">✉️ Iscriviti via email</button>
      </form>`;
}

function renderWhatsAppInlineLink() {
  return `<a href="https://whatsapp.com/channel/0029Vb8JW5c8kyyNuVPTEZ1u" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#1DA851] hover:underline">💬 Segui il canale WhatsApp per le offerte in tempo reale</a>`;
}

function renderShareButton() {
  return `<button type="button" class="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-gray-500 hover:text-gray-700 hover:underline">🔗 Condividi</button>`;
}

function renderArticleBody(post) {
  return `<article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <a href="/blog/" class="inline-flex items-center text-sm font-bold text-[#2563eb] hover:underline mb-6">&larr; Torna al blog</a>
        <span class="text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest mb-2 block">${escapeHtml(post.categoria)}</span>
        <h1 class="font-sans font-bold text-3xl sm:text-4xl text-gray-900 mb-4">${escapeHtml(post.titulo)}</h1>
        <p class="text-xs text-gray-400 mb-3">${escapeHtml(post.fecha)}${post.autor ? ` · ${escapeHtml(post.autor)}` : ''}</p>
        <div class="flex flex-wrap items-center gap-4 mb-8">
          ${renderWhatsAppInlineLink()}
          ${renderShareButton()}
        </div>
        ${post.imagenUrl ? `<img src="${escapeHtml(post.imagenUrl)}" alt="${escapeHtml(post.titulo)}" class="w-full rounded-xl mb-8 object-cover max-h-96">` : ''}
        <div class="prose prose-sm sm:prose-base max-w-none text-gray-800">${post.contenido_html}</div>
        <div class="mt-12 bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
          <p class="font-sans text-sm text-gray-600 mb-4">Ti è piaciuta questa guida? Ricevi le offerte in tempo reale sul nostro canale WhatsApp.</p>
          ${renderWhatsAppButton()}
        </div>
      </article>`;
}

function renderListBody(posts) {
  const cards = posts.map(post => `<a href="/blog/${post.slug}/" class="block bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
            <img src="${escapeHtml(post.imagenUrl)}" alt="${escapeHtml(post.titulo)}" class="w-full h-48 object-cover">
            <div class="p-5">
              <span class="text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest mb-1 block">${escapeHtml(post.categoria)}</span>
              <h2 class="font-sans font-bold text-gray-900 text-lg mb-2 line-clamp-2">${escapeHtml(post.titulo)}</h2>
              <p class="font-sans text-sm text-gray-500 line-clamp-3">${escapeHtml(post.resumen)}</p>
              <p class="font-sans text-xs text-gray-400 mt-3">${escapeHtml(post.fecha)}</p>
            </div>
          </a>`).join('\n          ');

  return `<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 class="font-sans font-bold text-3xl sm:text-4xl text-gray-900 mb-4">Blog GoSmArtic</h1>
        <p class="font-sans text-sm text-gray-500 mb-4">Ricevi un avviso ogni volta che pubblichiamo un nuovo articolo.</p>
        <div class="flex flex-col sm:flex-row gap-4 mb-12 bg-gray-50 border border-gray-100 rounded-xl p-5">
          ${renderNotificationButton()}
          ${renderWhatsAppButton()}
          ${renderNewsletterForm()}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          ${cards}
        </div>
      </div>`;
}

function serializePreloadedPosts(posts) {
  // Escapar "<" evita que un </script> (o <!--) dentro del JSON corte el
  // script tag antes de tiempo -- técnica estándar de "JSON script island".
  return JSON.stringify(posts).replace(/</g, '\\u003c');
}

function renderPage({ title, ogTitle, description, canonicalUrl, ogImage, publishedTime, bodyHtml, preloadedPosts }) {
  const ogTags = `
    <meta property="og:type" content="${publishedTime ? 'article' : 'website'}">
    <meta property="og:site_name" content="GoSmArtic">
    <meta property="og:title" content="${escapeHtml(ogTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonicalUrl}">${ogImage ? `
    <meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}${publishedTime ? `
    <meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
    <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">${ogImage ? `
    <meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonicalUrl}">
${ogTags}
${HEAD_ASSETS}
</head>
<body class="bg-gray-50 antialiased">

    <div id="root"><div class="flex flex-col min-h-screen">
      ${renderHeader()}
      <main class="flex-grow">
      ${bodyHtml}
      </main>
      ${renderFooter()}
    </div></div>

    <script>window.__PRELOADED_POSTS__ = ${serializePreloadedPosts(preloadedPosts)};</script>
    <script type="text/babel" src="/app.js"></script>

</body>
</html>
`;
}

function renderSitemap(posts) {
  const urls = [
    `  <url><loc>${SITE_URL}/</loc></url>`,
    `  <url><loc>${SITE_URL}/blog/</loc></url>`,
    ...posts.map(p => `  <url><loc>${SITE_URL}/blog/${p.slug}/</loc><lastmod>${p.fecha}</lastmod></url>`),
  ].join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

async function loadPosts() {
  const src = process.env.BLOG_DATA_URL || DEFAULT_DATA_URL;
  let raw;
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`No se pudo descargar blog-posts.json: ${res.status}`);
    raw = await res.text();
  } else {
    raw = fs.readFileSync(path.resolve(process.cwd(), src), 'utf8');
  }
  return JSON.parse(raw).posts || [];
}

async function main() {
  const posts = await loadPosts();

  fs.rmSync(BLOG_DIR, { recursive: true, force: true });
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  for (const post of posts) {
    const dir = path.join(BLOG_DIR, post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const html = renderPage({
      title: `${post.titulo} | GoSmArtic`,
      ogTitle: post.titulo,
      description: post.resumen,
      canonicalUrl: `${SITE_URL}/blog/${post.slug}/`,
      ogImage: post.imagenUrl,
      publishedTime: post.fecha,
      bodyHtml: renderArticleBody(post),
      preloadedPosts: [post],
    });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  const sortedByDate = [...posts].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  const listHtml = renderPage({
    title: 'Blog GoSmArtic | Guide e novità tech',
    ogTitle: 'Blog GoSmArtic',
    description: 'Guide pratiche, novità e approfondimenti sul mondo tech: smartphone, laptop, Smart TV e accessori.',
    canonicalUrl: `${SITE_URL}/blog/`,
    ogImage: null,
    publishedTime: null,
    preloadedPosts: sortedByDate,
    bodyHtml: renderListBody(sortedByDate),
  });
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), listHtml);

  fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), renderSitemap(posts));
  fs.writeFileSync(path.join(ROOT_DIR, 'robots.txt'), renderRobots());

  console.log(`Generadas ${posts.length} páginas de artículo + listado + sitemap.xml + robots.txt`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
