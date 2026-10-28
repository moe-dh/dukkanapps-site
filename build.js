// Builds dist/index.html from content/site.json — no dependencies.
// Netlify runs: node build.js   (publish directory: dist)
const fs = require('fs');
const path = require('path');

const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/site.json'), 'utf8'));
const OUT = path.join(__dirname, 'dist');

/* ---------- helpers ---------- */
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = (v) => (Array.isArray(v) ? v : []);
const txt = (v) => (v && typeof v === 'object' ? v.text ?? '' : v ?? '');
const digits = (v) => String(v || '').replace(/\D/g, '').replace(/^00/, '').replace(/^0(5\d{8})$/, '966$1');
const WA = digits(C.contact?.whatsapp);
const wa = (msg) => `https://wa.me/${WA}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
const img = (p) => esc(p ? (p.startsWith('http') || p.startsWith('/') ? p : '/' + p) : '');
const safeColor = (v, fb) => (/^#[0-9a-f]{3,8}$/i.test(String(v || '').trim()) ? String(v).trim() : fb);

const ICONS = {
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 14v6h14v-6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  monitor: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.7 5.7 0 0 0 22 9.7C22 5.4 17.5 2 12 2z"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  barcode: '<path d="M4 7V5h2M18 5h2v2M20 17v2h-2M6 19H4v-2M8 8v8M11 8v8M14 8v8M17 8v8"/>',
  ruler: '<path d="M21.3 15.3l-6.6 6.6a1 1 0 0 1-1.4 0L2.1 10.7a1 1 0 0 1 0-1.4l6.6-6.6a1 1 0 0 1 1.4 0l11.2 11.2a1 1 0 0 1 0 1.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 10.5l2 2M10.5 13.5l2 2"/>'
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.code}</svg>`;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.3-.2z"/></svg>';
const LOGO = (a = '#f2b33d', d = '#0a0c0b') => `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="${a}"/><path d="M8 16h24l-3-7H11z" fill="${d}"/><path d="M8 16a4 4 0 0 0 8 0a4 4 0 0 0 8 0a4 4 0 0 0 8 0" fill="${d}"/><rect x="11" y="21" width="18" height="11" rx="2.5" fill="${d}"/><path d="M17.5 24.5l-2 2 2 2M22.5 24.5l2 2-2 2" stroke="${a}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- sections ---------- */
const T = C.theme || {};
const accent = safeColor(T.accent, '#f2b33d');
const motion = T.motion !== false;
const introMode = motion ? (T.intro || 'once') : 'off'; // once | always | off

const head = (C.seo?.title || C.header?.brand || '');
const secHead = (s) => `
    <div class="sec-head rv">
      <div>
        ${s.kicker ? `<span class="kicker mono">${esc(s.kicker)}</span>` : ''}
        <h2>${esc(s.title)}</h2>
      </div>
      ${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ''}
    </div>`;

const H = C.header || {}, HE = C.hero || {}, M = C.marquee || {}, S = C.services || {}, W = C.work || {}, P = C.process || {}, F = C.faq || {}, FI = C.final || {}, FO = C.footer || {}, CT = C.contact || {};

const introHtml = introMode === 'off' ? '' : `
<div class="intro" id="intro" aria-hidden="true">
  <div class="intro-inner">
    <svg class="intro-logo" viewBox="0 0 40 40">
      <rect class="box" x="1" y="1" width="38" height="38" rx="11"/>
      <rect class="fill" x="1" y="1" width="38" height="38" rx="11"/>
      <g class="awn"><path d="M8 16h24l-3-7H11z"/><path d="M8 16a4 4 0 0 0 8 0a4 4 0 0 0 8 0a4 4 0 0 0 8 0"/></g>
      <rect class="door" x="11" y="21" width="18" height="11" rx="2.5"/>
      <path class="code" d="M17.5 24.5l-2 2 2 2M22.5 24.5l2 2-2 2"/>
    </svg>
    <div class="intro-name">${esc(C.intro?.name_first)} <span>${esc(C.intro?.name_second)}</span></div>
    <div class="intro-bar"><i></i></div>
    <div class="intro-pct mono" id="pct">00%</div>
  </div>
</div>`;

const chips = (row) => list(row).map((c) => `<span class="chipx"><i style="--c:${safeColor(c.color, accent)}"></i>${esc(txt(c))}</span>`).join('');

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(head)}</title>
<meta name="description" content="${esc(C.seo?.description)}">
<meta property="og:title" content="${esc(head)}">
<meta property="og:description" content="${esc(C.seo?.description)}">
<meta property="og:image" content="${img(C.seo?.share_image)}">
<meta name="theme-color" content="${safeColor(T.background, '#0a0c0b')}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO(accent, '#0a0c0b').replace(' aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"'))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>:root{--amber:${accent};--amber-ink:${safeColor(T.accent_text, '#1a1204')};--green:${safeColor(T.secondary, '#3ccf8e')};--bg:${safeColor(T.background, '#0a0c0b')};--card:${safeColor(T.card, '#131716')};--text:${safeColor(T.text, '#eef1ee')};--muted:${safeColor(T.muted, '#9aa49f')}}</style>
</head>
<body class="${introMode === 'off' ? '' : 'locked'}" data-intro="${introMode}" data-motion="${motion ? 'on' : 'off'}">
${introHtml}
<div class="aurora" aria-hidden="true"><b class="a1"></b><b class="a2"></b><b class="a3"></b></div>
<div class="grid-bg" aria-hidden="true"></div>
<div class="cursor-glow" id="glow" aria-hidden="true"></div>
<div class="progress" id="progress" aria-hidden="true"></div>

<div class="nav-shell">
  <nav class="nav">
    <a href="#" class="logo" aria-label="${esc(H.brand)}">${LOGO(accent, safeColor(T.background, '#0a0c0b'))}${esc(H.brand)}</a>
    <div class="links">${list(H.links).map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>
    ${H.cta_label ? `<a class="btn btn-primary" href="${esc(wa(H.cta_message))}" target="_blank" rel="noopener">${CAL}<span>${esc(H.cta_label)}</span></a>` : ''}
  </nav>
</div>

<main>
<section class="hero">
  <div class="wrap hero-grid">
    <div class="rv">
      ${HE.status ? `<span class="status"><span class="dot"></span>${esc(HE.status)}</span>` : ''}
      <h1>${esc(HE.title_before)} ${HE.title_highlight ? `<em>${esc(HE.title_highlight)}</em>` : ''}${esc(HE.title_after)}</h1>
      <p class="lead">${esc(HE.lead)}</p>
      <div class="cta-row">
        ${HE.primary_label ? `<a class="btn btn-primary" href="${esc(wa(HE.primary_message || CT.default_message))}" target="_blank" rel="noopener">${esc(HE.primary_label)}</a>` : ''}
        ${HE.secondary_label ? `<a class="btn btn-line" href="${esc(HE.secondary_href || '#work')}">${esc(HE.secondary_label)} ${ARROW}</a>` : ''}
      </div>
      ${list(HE.facts).length ? `<div class="facts">${list(HE.facts).map((f) => `<div><b>${esc(f.value)}</b><span>${esc(f.label)}</span></div>`).join('')}</div>` : ''}
    </div>
    <div class="stack rv" aria-hidden="true" id="stack">
     <div class="stack-inner" id="stackInner">
      ${HE.mockup_back_image ? `<div class="shot s1"><div class="bar"><i></i><i></i><i></i><span class="mono">${esc(HE.mockup_back_label)}</span></div><img src="${img(HE.mockup_back_image)}" alt=""></div>` : ''}
      ${HE.mockup_front_image ? `<div class="shot s2"><div class="bar"><i></i><i></i><i></i><span class="mono">${esc(HE.mockup_front_label)}</span></div><img src="${img(HE.mockup_front_image)}" alt=""></div>` : ''}
      ${HE.badge_one ? `<div class="tag-float tf1"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>${esc(HE.badge_one)}</div>` : ''}
      ${HE.badge_two ? `<div class="tag-float tf2">${icon('barcode')}${esc(HE.badge_two)}</div>` : ''}
     </div>
    </div>
  </div>
</section>

${M.show !== false ? `<div class="marquee" aria-hidden="true">
  <div class="track" id="t1">${chips(M.row_one)}</div>
  ${list(M.row_two).length ? `<div class="track rev" id="t2">${chips(M.row_two)}</div>` : ''}
</div>` : ''}

<section id="needs">
  <div class="wrap">${secHead(S)}
    <div class="needs">
      ${list(S.items).map((it) => `<a class="need${it.wide ? ' big' : ''} rv" href="${esc(wa(it.message || it.title))}" target="_blank" rel="noopener">
        <div class="ico">${icon(it.icon)}</div>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
        ${it.link_label ? `<span class="go">${esc(it.link_label)} ${ARROW}</span>` : ''}
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="work" class="work">
  <div class="wrap">${secHead(W)}
    ${list(W.cases).map((c, i) => `<article class="case${i % 2 ? ' flip' : ''} rv">
      <div>
        <div class="case-label">${list(c.tags).map((t) => `<span class="pill">${esc(txt(t))}</span>`).join('')}</div>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.text)}</p>
        ${list(c.points).length ? `<ul class="points">${list(c.points).map((p) => `<li>${esc(txt(p))}</li>`).join('')}</ul>` : ''}
        ${c.link_label && c.link_url ? `<div class="cta-row"><a class="btn btn-line" href="${esc(c.link_url)}" target="_blank" rel="noopener">${esc(c.link_label)} ${ARROW}</a></div>` : ''}
      </div>
      <div class="case-media">
        ${c.image_one ? `<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img(c.image_one)}" alt="${esc(c.title)}" loading="lazy"></div>` : ''}
        ${c.image_two ? `<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img(c.image_two)}" alt="${esc(c.title)}" loading="lazy"></div>` : ''}
      </div>
    </article>`).join('\n    ')}
  </div>
</section>

<section id="process">
  <div class="wrap">${secHead(P)}
    <div class="steps rv">
      ${list(P.steps).map((s, i) => `<div class="step"><span class="n mono">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section id="faq">
  <div class="wrap faq">
    <div class="rv">
      ${F.kicker ? `<span class="kicker mono">${esc(F.kicker)}</span>` : ''}
      <h2 class="faq-title">${esc(F.title)}</h2>
      ${F.subtitle ? `<p class="faq-sub">${esc(F.subtitle)}</p>` : ''}
    </div>
    <div class="rv">
      ${list(F.items).map((q, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q.question)}</summary><p>${esc(q.answer)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="final-wrap">
  <div class="wrap">
    <div class="final rv">
      <h2>${esc(FI.title)}</h2>
      ${FI.text ? `<p>${esc(FI.text)}</p>` : ''}
      <div class="cta-row">
        <a class="btn btn-primary" href="${esc(wa(CT.default_message))}" target="_blank" rel="noopener">${WA_ICON} ${esc(FI.whatsapp_label || CT.whatsapp_display)}</a>
        ${FI.show_email !== false && CT.email ? `<a class="btn btn-line" href="mailto:${esc(CT.email)}"><span class="mono mail">${esc(CT.email)}</span></a>` : ''}
      </div>
      ${FI.note ? `<small>${esc(FI.note)}</small>` : ''}
    </div>
  </div>
</section>
</main>

<footer>
  <div class="wrap">
    <span>© <span id="y">${new Date().getFullYear()}</span> ${esc(FO.copyright)}</span>
    <span><a href="${esc(wa())}" target="_blank" rel="noopener">${esc(FO.whatsapp_label)}${CT.whatsapp_display ? ' ' + esc(CT.whatsapp_display) : ''}</a>${CT.email ? ` · <a href="mailto:${esc(CT.email)}">${esc(FO.email_label)}</a>` : ''}</span>
  </div>
</footer>

${T.floating_whatsapp !== false ? `<a class="wa" href="${esc(wa(CT.default_message))}" target="_blank" rel="noopener" aria-label="واتساب">${WA_ICON}</a>` : ''}
<script src="/assets/main.js"></script>
</body>
</html>
`;

/* ---------- write ---------- */
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'CNAME'), 'dukkanapps.com\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
copyDir(path.join(__dirname, 'assets'), path.join(OUT, 'assets'));
copyDir(path.join(__dirname, 'img'), path.join(OUT, 'img'));
console.log('Built dist/index.html (' + html.length + ' bytes), WhatsApp ' + WA);
