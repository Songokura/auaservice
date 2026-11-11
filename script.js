(() => {
'use strict';
const SELF = document.currentScript;
const VER = (SELF && SELF.src.split('?v=')[1]) || '';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const hasG = !!window.gsap;
if (hasG) { gsap.registerPlugin(ScrollTrigger); if (window.SplitText) gsap.registerPlugin(SplitText); gsap.defaults({ ease: 'power3.out', duration: 1 }); }

/* ================= сцена тракта ================= */
const CFG = {
  d: { W: 1600, H: 900, G: 850, R1: 590, ST: 22, dy1: 626, dy2: 670, HX: 300, hbw: 172, hby: 726, neck: 42, stove: { x: 180, w: 240, y: 784 },
       SX: 1190, sw: 70, BX: 1050, BR: 1800, T: 250, M: 420, fan: { cy: 200, r: 34, hx: 1140, hw: 190, hy: 150 }, fs: 21, left: -1500, arrows: 16, part: true, chips: true, fanLeft: false, l0: [496, 720], l1: [812, 714] },
  m: { W: 760, H: 640, G: 600, R1: 350, ST: 18, dy1: 384, dy2: 428, HX: 196, hbw: 150, hby: 482, neck: 38, stove: { x: 92, w: 208, y: 534 },
       SX: 566, sw: 62, BX: 458, BR: 1000, T: 150, M: 256, fan: { cy: 105, r: 30, hx: 522, hw: 168, hy: 60 }, fs: 25, left: -500, arrows: 10, part: false, chips: false, fanLeft: true, l0: [52, 326, 96], l1: [372, 466] }
};
const SEG = [.12, .5, .26, .12];
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function buildTract(host, key, id, par) {
  const c = CFG[key], { W, H, G, R1, ST, dy1, dy2, HX, hbw, hby, neck, SX, sw, BX, BR, T, M, fs } = c;
  const f = c.fan, fy = T, mid = (dy1 + dy2) / 2, x0 = HX - neck - 14, cxS = SX + sw / 2, ceil = R1 + ST, L = c.left;
  const r = rng(7), R = (a, b) => a + (b - a) * r();
  const open = (cls) => `<svg class="sc ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="${par}" focusable="false">`;
  const P = `M${x0} ${dy1}H${SX}V${fy}H${SX + sw}V${dy2}H${HX + neck}L${HX + hbw} ${hby}H${HX - hbw}L${HX - neck} ${dy2}H${x0}Z`;

  /* облака */
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="18" width="170" height="30" rx="15" fill="#fff"/><rect x="34" y="0" width="84" height="40" rx="20" fill="#fff"/><rect x="84" y="10" width="62" height="32" rx="16" fill="#fff"/><path d="M12 48h150" stroke="#C9D9DE" stroke-width="1.5"/></g>`;
  let clouds = open('lay-clouds') + cloud(W * .66, H * .1, .9) + cloud(W * .86, H * .02, .6) + cloud(W * .12, H * .5, .7) + cloud(L * .3, H * .2, 1.2) + cloud(-W * .12, H * .36, .9) + '</svg>';

  /* дальний план: город в дымке */
  let far = open('lay-far') + `<defs><linearGradient id="${id}hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EEF1" stop-opacity="0"/><stop offset="1" stop-color="#E6EEF1" stop-opacity=".96"/></linearGradient></defs>`;
  for (let pass = 0; pass < 2; pass++) {
    let x = L;
    while (x < BX) {
      const w = R(38, 96), h = pass ? R(40, 150) : R(90, 250);
      far += `<rect class="${pass ? 'far' : 'far2'}" x="${x | 0}" y="${R1 - h | 0}" width="${w | 0}" height="${h + 4 | 0}"/>`;
      if (r() > .62) far += `<rect class="${pass ? 'far' : 'far2'}" x="${x + w * .4 | 0}" y="${R1 - h - 26 | 0}" width="3" height="28"/>`;
      if (pass && r() > .5) for (let k = 0; k < 3; k++) far += `<rect x="${x + 8 + k * 14 | 0}" y="${R1 - h + 14 | 0}" width="6" height="${h * .5 | 0}" fill="#E6EEF1" opacity=".55"/>`;
      x += w + R(4, 34);
    }
  }
  const bx = W * .36, bh = key === 'd' ? 250 : 190;
  far += `<g class="far"><path d="M${bx - 5} ${R1}L${bx - 2} ${R1 - bh + 40}h4L${bx + 5} ${R1}Z"/><path d="M${bx - 26} ${R1 - bh + 54}L${bx - 3} ${R1 - bh + 100}M${bx + 26} ${R1 - bh + 54}L${bx + 3} ${R1 - bh + 100}" stroke="#C9D9DE" stroke-width="3" fill="none"/><circle cx="${bx}" cy="${R1 - bh + 34}" r="22"/></g>`;
  far += `<rect x="${L}" y="${R1 - 170}" width="${BX - L}" height="172" fill="url(#${id}hz)"/></svg>`;

  /* здание в разрезе */
  let b = open('lay-bld') + `<defs><pattern id="${id}ht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V14" stroke="#0F2E3B" stroke-width="1.2" opacity=".35"/></pattern><pattern id="${id}tl" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0V34H0" fill="none" stroke="#0F2E3B" stroke-width="1" opacity=".1"/></pattern></defs>`;
  b += `<rect x="${L}" y="${G}" width="${BR - L}" height="${H - G + 400}" fill="#DCE6E9"/><rect x="${L}" y="${G}" width="${BR - L}" height="26" fill="url(#${id}ht)"/>`;
  b += `<rect class="room" x="${L}" y="${ceil}" width="${BX - L}" height="${G - ceil}"/><rect x="${L}" y="${G - 118}" width="${BX - L}" height="118" fill="url(#${id}tl)"/><path class="thin" d="M${L} ${G - 118}H${BX}"/>`;
  b += `<rect class="wallf" x="${BX}" y="${T}" width="${BR - BX}" height="${G - T}"/>`;
  // комнаты высокой части
  const rx = SX + sw + 16;
  b += `<rect class="room" x="${BX + 14}" y="${T + ST}" width="${SX - BX - 26}" height="${M - T - ST}"/><rect class="room" x="${BX + 14}" y="${M + 16}" width="${SX - BX - 26}" height="${R1 - M - 16}"/><rect class="room" x="${BX + 14}" y="${ceil}" width="${SX - BX - 26}" height="${G - ceil}"/>`;
  b += `<rect class="room" x="${rx}" y="${T + ST}" width="${BR - rx}" height="${M - T - ST}"/><rect class="room" x="${rx}" y="${M + 16}" width="${BR - rx}" height="${R1 - M - 16}"/><rect class="room" x="${rx}" y="${ceil}" width="${BR - rx}" height="${G - ceil}"/>`;
  // окна и мебель наверху
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#DDEBEF" stroke="#0F2E3B" stroke-width="1.6" opacity=".8"/><path class="thin" d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}"/>`;
  for (let i = 0; i < 4; i++) { const wx = rx + 150 + i * 150; b += win(wx, T + ST + 34, 74, 70) + win(wx, M + 16 + 38, 74, 74); }
  b += `<g class="sway"><path class="thin" d="M${BX + 80} ${T + ST}v34"/><path class="ink-f" d="M${BX + 66} ${T + ST + 48}l14-14 14 14z"/></g>`;
  b += `<g class="sway"><path class="thin" d="M${BX + 80} ${M + 16}v30"/><path class="ink-f" d="M${BX + 66} ${M + 60}l14-14 14 14z"/></g>`;
  // склад справа внизу (точки контроля намёком)
  const sx0 = rx + 150, sy = ceil + 46;
  b += `<path class="ink" d="M${sx0} ${sy}V${G}M${sx0 + 190} ${sy}V${G}M${sx0} ${sy + 62}h190M${sx0} ${sy + 124}h190"/>`;
  [[10, 62, 50, 36], [70, 62, 44, 28], [124, 62, 56, 42], [16, 124, 60, 40], [90, 124, 40, 30], [140, 124, 40, 44], [20, G - sy, 70, 48], [104, G - sy, 60, 36]].forEach(q => b += `<rect class="ink-f" x="${sx0 + q[0]}" y="${sy + q[1] - q[3]}" width="${q[2]}" height="${q[3]}" style="stroke-width:1.8"/>`);
  b += `<circle class="teal" cx="${sx0 - 30}" cy="${G - 9}" r="7"/><circle class="teal" cx="${sx0 + 226}" cy="${G - 9}" r="7"/>`;
  // плиты перекрытий
  b += `<rect class="slab" x="${L}" y="${R1}" width="${BR - L}" height="${ST}"/><rect class="slab" x="${BX - 10}" y="${T}" width="${BR - BX + 10}" height="${ST}"/><rect class="slab" x="${BX}" y="${M}" width="${BR - BX}" height="16"/><rect class="slab" x="${BX}" y="${T}" width="14" height="${R1 - T}"/>`;
  if (c.part) b += `<rect class="slab" x="${BX}" y="${ceil}" width="14" height="${G - ceil - 150}"/>`;
  // кровля низкой части: фонари и парапет
  for (let x = L + 80; x < BX - 200; x += 330) b += `<path class="ink-f" d="M${x} ${R1}l16-26h70l16 26z" style="stroke-width:1.8"/><path class="thin" d="M${x + 34} ${R1 - 26}v26M${x + 68} ${R1 - 26}v26"/>`;
  b += `<path class="ink" d="M${BX - 60} ${R1}v-22h44v22"/>`;
  // кухня: плита, столы, полки
  const s = c.stove, st = s.y;
  b += `<rect class="ink-f" x="${s.x}" y="${st}" width="${s.w}" height="${G - st}"/><path class="thin" d="M${s.x + 16} ${st + 22}h${s.w - 32}M${s.x + s.w / 2} ${st + 22}V${G}"/><circle class="or blink" cx="${s.x + 22}" cy="${st + 11}" r="3.5"/><circle cx="${s.x + 36}" cy="${st + 11}" r="3.5" fill="#0F2E3B"/>`;
  const pots = [s.x + s.w * .22, s.x + s.w * .52, s.x + s.w * .8];
  pots.forEach((px, i) => { const pw = [30, 38, 26][i], ph = [22, 28, 18][i]; b += `<path class="flame" d="M${px - 8} ${st}q8-16 16 0z"/><rect class="ink-f" x="${px - pw / 2}" y="${st - 5 - ph}" width="${pw}" height="${ph}" rx="3" style="stroke-width:2"/><path class="ink" d="M${px - pw / 2 - 6} ${st - ph}h6M${px + pw / 2} ${st - ph}h6" style="stroke-width:2"/>`; });
  const tx = HX + hbw + (key === 'd' ? 150 : 40);
  if (key === 'd') {
    b += `<path class="ink" d="M${tx} ${G}V${G - 72}h230V${G}M${tx} ${G - 30}h230"/><rect class="ink-f" x="${tx + 20}" y="${G - 92}" width="44" height="20" rx="3" style="stroke-width:1.8"/><rect class="ink-f" x="${tx + 150}" y="${G - 100}" width="30" height="28" rx="3" style="stroke-width:1.8"/>`;
    b += `<rect class="ink-f" x="${tx + 372}" y="${G - 168}" width="96" height="168"/><path class="thin" d="M${tx + 372} ${G - 100}h96M${tx + 386} ${G - 150}v36M${tx + 386} ${G - 84}v50"/>`;
    for (let x = s.x - 330; x > L; x -= 330) b += `<path class="ink" d="M${x} ${G}V${G - 72}h220V${G}M${x} ${G - 30}h220"/><path class="thin" d="M${x + 20} ${ceil + 96}h180M${x + 40} ${ceil + 96}v-22h30v22M${x + 110} ${ceil + 96}v-30h44v30"/><g class="sway"><path class="thin" d="M${x + 270} ${ceil}v44"/><path class="ink-f" d="M${x + 254} ${ceil + 60}l16-16 16 16z" style="stroke-width:1.8"/></g>`;
  } else {
    b += `<path class="ink" d="M${tx + 30} ${G}V${G - 62}h130V${G}"/><rect class="ink-f" x="${tx + 50}" y="${G - 84}" width="40" height="22" rx="3" style="stroke-width:1.8"/>`;
    b += `<path class="ink" d="M${L} ${G - 62}H${s.x - 40}V${G}"/>`;
  }
  // подвесы воздуховода
  for (let x = HX + hbw + 60; x < SX - 40; x += (key === 'd' ? 170 : 120)) b += `<path class="thin" d="M${x} ${ceil}V${dy1}" style="opacity:.8"/>`;
  b += `<path class="ink" d="M${L} ${G}H${BR}" style="stroke-width:3.4"/></svg>`;

  /* тракт */
  let t = open('lay-tract') + `<defs><linearGradient id="${id}mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E4F0F3"/><stop offset="1" stop-color="#CFE3E8"/></linearGradient>
    <clipPath id="${id}in"><path d="${P}"/></clipPath>
    <clipPath id="${id}ca"><rect data-k="ca" x="${HX - hbw - 6}" y="${dy2}" width="${hbw * 2 + 12}" height="${hby - dy2 + 4}"/></clipPath>
    <clipPath id="${id}cb"><rect data-k="cb" x="${x0}" y="${dy1 - 2}" width="${SX + sw - x0}" height="${dy2 - dy1 + 2}"/></clipPath>
    <clipPath id="${id}cc"><rect data-k="cc" x="${SX - 2}" y="${fy}" width="${sw + 4}" height="${dy1 - fy - 2}"/></clipPath><g id="${id}dep">`;
  t += `<path d="${P}" fill="#B07A35" opacity=".28"/><path d="${P}" fill="none" stroke="#B07A35" stroke-width="17" stroke-linejoin="round"/>`;
  for (let x = x0 + 8; x < SX + sw; x += R(15, 26)) { t += `<circle fill="#B07A35" cx="${x | 0}" cy="${dy1 + R(1, 5) | 0}" r="${R(5, 10) | 0}"/>`; if (x < SX || x > SX + sw) t += `<circle fill="#B07A35" cx="${x + 8 | 0}" cy="${dy2 - R(0, 4) | 0}" r="${R(5, 11) | 0}"/>`; if (r() > .6 && x < SX) t += `<rect fill="#B07A35" x="${x | 0}" y="${dy1 + 6}" width="3.4" height="${R(8, 18) | 0}" rx="1.7"/>`; }
  for (let y = fy + 8; y < dy1; y += R(15, 26)) t += `<circle fill="#B07A35" cx="${SX + R(0, 4) | 0}" cy="${y | 0}" r="${R(5, 10) | 0}"/><circle fill="#B07A35" cx="${SX + sw - R(0, 4) | 0}" cy="${y + 9 | 0}" r="${R(5, 10) | 0}"/>`;
  for (let k = 0; k <= 1; k += .2) { const y = lerp(dy2, hby, k), w = lerp(neck, hbw, k); t += `<circle fill="#B07A35" cx="${HX - w | 0}" cy="${y | 0}" r="${R(5, 9) | 0}"/><circle fill="#B07A35" cx="${HX + w | 0}" cy="${y | 0}" r="${R(5, 9) | 0}"/>`; }
  let flt = ''; for (let x = HX - hbw + 34; x < HX + hbw - 34; x += 21) flt += `M${x} ${hby - 3}l12-22`;
  t += `<path d="${flt}" fill="none" stroke="#B07A35" stroke-width="7.5" stroke-linecap="round"/></g></defs>`;
  t += `<path d="${P}" fill="url(#${id}mt)"/><path d="${flt}" class="teal-s" style="stroke-width:2.4"/>`;
  t += `<path class="thin" d="M${x0 + 20} ${dy1 + 9}H${SX - 12}M${SX + 9} ${dy1 - 10}V${fy + 16}" style="stroke:#fff;opacity:1;stroke-width:3"/>`;
  t += `<g clip-path="url(#${id}in)"><use href="#${id}dep" clip-path="url(#${id}ca)"/><use href="#${id}dep" clip-path="url(#${id}cb)"/><use href="#${id}dep" clip-path="url(#${id}cc)"/></g>`;
  t += `<path d="${P}" class="ink"/>`;
  for (let x = HX + hbw + 20; x < SX - 30; x += (key === 'd' ? 170 : 120)) t += `<path class="ink" d="M${x} ${dy1 - 6}V${dy2 + 6}" style="stroke-width:1.6;opacity:.55"/>`;
  for (let y = dy1 - 90; y > fy + 40; y -= 110) t += `<path class="ink" d="M${SX - 6} ${y}H${SX + sw + 6}" style="stroke-width:1.6;opacity:.55"/>`;
  t += `<rect class="ink-f" x="${HX - hbw - 8}" y="${hby}" width="${hbw * 2 + 16}" height="11" rx="2"/>`;
  // вентилятор: корпус
  t += `<rect class="ink-f" x="${f.hx}" y="${f.hy}" width="${f.hw}" height="${fy - f.hy}" rx="10"/><circle cx="${cxS}" cy="${f.cy}" r="${f.r + 7}" fill="url(#${id}mt)" stroke="#0F2E3B" stroke-width="2.4"/>`;
  t += `<circle data-k="fd" cx="${cxS}" cy="${f.cy}" r="${f.r + 6}" fill="#B07A35" opacity=".5"/><g data-k="fdb">`;
  for (let a = 0; a < 6.28; a += .52) t += `<circle class="dep" cx="${cxS + Math.cos(a) * (f.r + 3) | 0}" cy="${f.cy + Math.sin(a) * (f.r + 3) | 0}" r="${R(4, 7) | 0}"/>`;
  t += `</g><path class="ink-f" d="M${cxS + f.r + 26} ${f.hy + 22}h${f.hw - (cxS - f.hx) - f.r - 44}v${fy - f.hy - 44}h-${f.hw - (cxS - f.hx) - f.r - 44}z" style="stroke-width:1.8"/><path class="thin" d="M${cxS + f.r + 34} ${f.hy + 36}h30M${cxS + f.r + 34} ${f.hy + 48}h30M${cxS + f.r + 34} ${f.hy + 60}h20"/><circle class="or blink" cx="${f.hx + 16}" cy="${f.hy + 16}" r="4"/>`;
  t += `<path class="ink-f" d="M${cxS - 36} ${f.hy}l10-26h52l10 26z"/><path class="ink" d="M${cxS - 44} ${f.hy - 34}h88" style="stroke-width:3.4"/>`;
  // фронт очистки, щётка, робот
  t += `<g data-k="front" opacity="0"><line data-k="fl2" class="or-s" stroke-width="16" opacity=".22"/><line data-k="fl" class="or-s" stroke-width="5"/><g data-k="br"><circle class="brush or-s" r="13" stroke-width="5" stroke-dasharray="3 5.1"/></g></g>`;
  t += `<g data-k="robot" opacity="0"><path data-k="cone" fill="#F26A1B" opacity=".2"/><path data-k="teth" class="thin" style="opacity:.9"/><g><rect x="-66" y="-25" width="52" height="15" rx="5" fill="#0F2E3B"/><rect x="-24" y="-33" width="16" height="13" rx="3" fill="#0F2E3B"/><circle cx="-8" cy="-26.5" r="4.5" class="teal" stroke="#fff" stroke-width="1.5"/><circle cx="-56" cy="-7" r="6.5" fill="#fff" stroke="#0F2E3B" stroke-width="2.6"/><circle cx="-40" cy="-7" r="6.5" fill="#fff" stroke="#0F2E3B" stroke-width="2.6"/><circle cx="-24" cy="-7" r="6.5" fill="#fff" stroke="#0F2E3B" stroke-width="2.6"/><circle class="or blink" cx="-58" cy="-18" r="2.4"/></g></g>`;
  // подписи
  const lbl = (k, x, y, key18, txt, end) => `<g data-k="${k}"><circle class="ndot" cx="${end ? x + 2 : x}" cy="${y - fs * .33}" r="${fs * .28}"/><text x="${end ? x - fs * .7 : x + fs * .7}" y="${y}" font-size="${fs}" ${end ? 'text-anchor="end"' : ''} data-i18n="${key18}">${txt}</text></g>`;
  if (c.l0[2]) t += `<path class="thin" d="M${c.l0[2]} ${c.l0[1] + 8}V${dy2 + 14}" style="opacity:.8"/>`;
  t += lbl('l0', c.l0[0], c.l0[1], 'sc.hood', 'Зонт и фильтры') + lbl('l1', c.l1[0], c.l1[1], 'sc.duct', 'Воздуховоды');
  t += lbl('l2', SX + sw + 22, (M + R1) / 2 + 30, 'sc.shaft', 'Шахта');
  t += c.fanLeft ? lbl('l3', f.hx - 18, f.cy + 8, 'sc.fan', 'Вентилятор', true) : lbl('l3', f.hx + f.hw + 22, f.cy + 8, 'sc.fan', 'Вентилятор');
  t += `<g data-k="chips" opacity="0"><text data-k="chc" class="lbl-sub" font-size="${fs * .86}" text-anchor="end" style="fill:#1F6E86" data-i18n="sc.clean">Очищено</text><text data-k="chd" class="lbl-sub" font-size="${fs * .86}" style="fill:#B07A35" data-i18n="sc.dep">Отложения</text></g></svg>`;

  /* поток, пар, ротор */
  let fl = open('lay-flow') + `<defs><radialGradient id="${id}hzr"><stop offset="0" stop-color="#8C7A5C" stop-opacity=".42"/><stop offset="1" stop-color="#8C7A5C" stop-opacity="0"/></radialGradient></defs>`;
  fl += `<g data-k="haze"><ellipse cx="${HX}" cy="${hby + 20}" rx="${hbw * 1.5}" ry="46" fill="url(#${id}hzr)"/><ellipse cx="${HX - hbw - 40}" cy="${dy2 - 6}" rx="${hbw}" ry="38" fill="url(#${id}hzr)"/><ellipse cx="${HX + hbw + 70}" cy="${hby - 26}" rx="${hbw * .9}" ry="34" fill="url(#${id}hzr)"/></g>`;
  fl += `<g class="steam">` + pots.map(px => `<path d="M${px} ${st - 34}q-7-9 0-18t0-18"/>`).join('') + `</g><g data-k="arrows">`;
  for (let i = 0; i < c.arrows; i++) fl += `<g><path class="teal-s" d="M-18 0H7M1-6.5l7.5 6.5-7.5 6.5"/></g>`;
  fl += `</g><g transform="translate(${cxS} ${f.cy})"><g data-k="rotor">`;
  for (let i = 0; i < 6; i++) fl += `<path class="teal" transform="rotate(${i * 60})" d="M0 0Q${f.r * .5} ${-f.r * .5} ${f.r * .96} ${-f.r * .16}L${f.r * .9} ${f.r * .1}Q${f.r * .5} ${-f.r * .12} 0 0Z"/>`;
  fl += `</g><circle r="6" fill="#fff" stroke="#0F2E3B" stroke-width="2.4"/></g>`;
  fl += `<g data-k="puffs"><circle class="puff" cx="${cxS - 14}" cy="${f.hy - 52}" r="11"/><circle class="puff" cx="${cxS + 10}" cy="${f.hy - 50}" r="14"/><circle class="puff" cx="${cxS + 2}" cy="${f.hy - 56}" r="9"/><path data-k="exh" class="teal-s" d="M${cxS - 20} ${f.hy - 44}v-26m-7 8l7-8 7 8M${cxS + 20} ${f.hy - 44}v-26m-7 8l7-8 7 8M${cxS} ${f.hy - 54}v-34m-7 8l7-8 7 8"/></g></svg>`;

  host.innerHTML = clouds + far + b + t + fl;
  const q = k => host.querySelector(`[data-k="${k}"]`);
  const svgs = $$('svg', host);
  const E = { ca: q('ca'), cb: q('cb'), cc: q('cc'), fd: q('fd'), fdb: q('fdb'), front: q('front'), fl: q('fl'), fl2: q('fl2'), br: q('br'), robot: q('robot'), cone: q('cone'), teth: q('teth'), chips: q('chips'), chc: q('chc'), chd: q('chd'), haze: q('haze'), rotor: q('rotor'), puffs: q('puffs'), arrows: [...q('arrows').children], l: [q('l0'), q('l1'), q('l2'), q('l3')] };
  const pts = [[HX, hby - 8], [HX, mid], [cxS, mid], [cxS, fy + 14]];
  const lens = [pts[0][1] - pts[1][1], pts[2][0] - pts[1][0], pts[2][1] - pts[3][1]], total = lens[0] + lens[1] + lens[2];
  const S = { host, c, svgs, p: -1, flowT: 0, ang: 0, active: true, far: svgs[1], clouds: svgs[0] };
  const line = (x1, y1, x2, y2) => { for (const l of [E.fl, E.fl2]) { l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); } E.br.setAttribute('transform', `translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`); };
  S.render = (p) => {
    p = clamp(p); if (Math.abs(p - S.p) < .0004) return; S.p = p;
    const a = clamp(p / SEG[0]), bb = clamp((p - SEG[0]) / SEG[1]), cc = clamp((p - SEG[0] - SEG[1]) / SEG[2]), d = clamp((p - 1 + SEG[3]) / SEG[3]);
    const yA = lerp(hby, dy2, a), xB = lerp(x0, SX + sw, bb), yC = lerp(dy1, fy, cc), yD = lerp(fy, f.hy + 6, d);
    E.ca.setAttribute('height', Math.max(0, yA - dy2));
    E.cb.setAttribute('x', xB); E.cb.setAttribute('width', Math.max(0, SX + sw - xB));
    E.cc.setAttribute('height', Math.max(0, yC - fy));
    E.fd.setAttribute('opacity', .5 * (1 - d)); E.fdb.setAttribute('opacity', 1 - d);
    E.front.setAttribute('opacity', p > .002 && p < .998 ? 1 : 0);
    if (a < 1) { const w = lerp(neck, hbw, (yA - dy2) / (hby - dy2)); line(HX - w, yA, HX + w, yA); }
    else if (bb < 1) line(xB, dy1, xB, dy2);
    else if (cc < 1) line(SX, yC, SX + sw, yC);
    else line(f.hx + 8, yD, f.hx + f.hw - 8, yD);
    const inB = a >= 1 && bb > .04 && bb < 1;
    E.robot.setAttribute('opacity', inB ? clamp((bb - .04) * 20) * clamp((1 - bb) * 14) : 0);
    if (inB) { const rxp = Math.max(x0 + 72, xB - 50), dist = xB - rxp; E.robot.setAttribute('transform', `translate(${rxp} ${dy2})`); E.cone.setAttribute('d', `M-4 -27L${dist} ${-(dy2 - dy1) + 3}V-3Z`); E.teth.setAttribute('d', `M-64 -14Q${-(rxp - x0) / 2} -2 ${-(rxp - x0) + 10} -4`); }
    E.chips.setAttribute('opacity', inB && c.chips ? clamp((bb - .08) * 14) * clamp((.94 - bb) * 14) : 0);
    if (inB) { const cy = R1 - 16; E.chc.setAttribute('x', xB - 16); E.chc.setAttribute('y', cy); E.chd.setAttribute('x', xB + 16); E.chd.setAttribute('y', cy); }
    [a, bb, cc, d].forEach((v, i) => E.l[i].classList.toggle('is-clean', v >= 1));
    E.haze.setAttribute('opacity', 1 - clamp(p / .2));
    E.puffs.setAttribute('opacity', lerp(.12, 1, p));
  };
  S.tick = (dt) => {
    if (!S.active) return;
    const p = Math.max(0, S.p);
    S.flowT = (S.flowT + dt * lerp(.035, .2, p)) % 1;
    S.ang = (S.ang + dt * lerp(26, 560, p * p)) % 360;
    E.rotor.setAttribute('transform', `rotate(${S.ang.toFixed(1)})`);
    const n = E.arrows.length, base = lerp(.3, 1, p), sc = lerp(.72, 1.2, p);
    for (let i = 0; i < n; i++) {
      const tt = (i / n + S.flowT) % 1; let dd = tt * total, x, y, an;
      if (dd < lens[0]) { x = pts[0][0]; y = pts[0][1] - dd; an = -90; }
      else if (dd < lens[0] + lens[1]) { x = pts[1][0] + dd - lens[0]; y = mid; an = 0; }
      else { x = cxS; y = mid - (dd - lens[0] - lens[1]); an = -90; }
      const g = E.arrows[i]; g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${an}) scale(${sc.toFixed(2)})`);
      g.setAttribute('opacity', (base * Math.min(1, Math.sin(Math.PI * tt) * 3)).toFixed(2));
    }
  };
  S.view = (cx, cy, w, h) => { const vb = `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`; for (const s of svgs) s.setAttribute('viewBox', vb); };
  S.render(0); S.tick(0);
  return S;
}

/* ================= сцена ДДД ================= */
function buildDDD(host) {
  let s = `<svg class="sc dd" viewBox="0 0 900 620" preserveAspectRatio="xMidYMid slice"><defs><pattern id="dht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V14" stroke="#0F2E3B" stroke-width="1.2" opacity=".35"/></pattern><pattern id="dtl" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0V34H0" fill="none" stroke="#0F2E3B" stroke-width="1" opacity=".1"/></pattern></defs>`;
  s += `<rect x="-200" y="540" width="1300" height="200" fill="#DCE6E9"/><rect x="-200" y="540" width="1300" height="24" fill="url(#dht)"/><rect class="room" x="44" y="96" width="812" height="444"/><rect x="44" y="420" width="812" height="120" fill="url(#dtl)"/>`;
  s += `<rect class="slab" x="-200" y="76" width="1300" height="20"/><rect class="slab" x="30" y="96" width="14" height="444"/><rect class="slab" x="856" y="96" width="14" height="444"/><rect class="slab" x="470" y="96" width="12" height="230"/>`;
  s += `<path class="ink-f" d="M-200 26H1100V54H-200Z"/><path class="ink-f" d="M670 54h60v22h-60z"/><path class="ink-f" d="M650 96h100l-12 14h-76z"/><path class="thin" d="M100 26v28M330 26v28M560 26v28M840 26v28"/>`;
  s += `<path class="ink" d="M482 326v214M482 330l58 16v194" style="stroke-width:2"/><circle cx="530" cy="440" r="4" fill="#0F2E3B"/>`;
  // стеллажи
  const rack = (x) => { let o = `<path class="ink" d="M${x} 190V540M${x + 170} 190V540M${x} 270h170M${x} 360h170M${x} 450h170"/>`; [[10, 270, 50, 40], [70, 270, 80, 30], [14, 360, 70, 46], [96, 360, 56, 34], [8, 450, 44, 36], [60, 450, 96, 50], [20, 540, 130, 52]].forEach((q, i) => o += `<rect class="ink-f" x="${x + q[0]}" y="${q[1] - q[3]}" width="${q[2]}" height="${q[3]}" rx="${i % 3 == 1 ? 12 : 2}" style="stroke-width:1.8"/>`); return o; };
  s += rack(80) + rack(280);
  // мойка, стол
  s += `<path class="ink" d="M560 540V436h120V540M560 470h120"/><path class="ink" d="M585 436v-10q0-16 16-16h8v10" style="stroke-width:2.2"/><path class="ink" d="M572 436q0 22 20 22h54q20 0 20-22" style="stroke-width:1.8"/>`;
  s += `<path class="ink" d="M700 540V436h136V540M700 500h136"/><rect class="ink-f" x="716" y="406" width="40" height="30" rx="3" style="stroke-width:1.8"/><rect class="ink-f" x="778" y="414" width="44" height="22" rx="10" style="stroke-width:1.8"/>`;
  s += `<path class="ink" d="M-200 540H1100" style="stroke-width:3.4"/><path class="ink" d="M610 540h30" style="stroke-width:6;stroke:#1F6E86"/>`;
  // дезинсекция
  const sp = (x, y) => `<g transform="translate(${x} ${y})"><path class="spray" d="M0 0L-26-44A52 52 0 0 1 26-44Z"/><circle r="6" class="or"/><circle r="9" class="ring"/></g>`;
  s += `<g class="cp cp-ins">` + [[66, 534], [262, 534], [454, 534], [552, 534], [625, 536], [690, 534], [846, 534], [165, 446], [365, 356]].map(q => sp(q[0], q[1])).join('') + `</g>`;
  // дератизация
  const bait = (x) => `<g transform="translate(${x} 540)"><rect x="-17" y="-18" width="34" height="18" rx="3" fill="#0F2E3B"/><rect x="-17" y="-18" width="34" height="6" rx="3" class="or"/><circle cx="0" cy="-9" r="14" class="ring"/></g>`;
  s += `<g class="cp cp-rat"><path class="route" d="M52 528H458M494 528H848M52 528V120M848 528V120"/>` + [58, 264, 448, 506, 842].map(bait).join('') + `</g>`;
  // дезинфекция
  s += `<g class="cp cp-dis"><path class="surf" d="M562 432h116M702 432h132M-100 40H1000"/><path class="mist" d="M650 110h100l60 150H590z"/><path class="mist" d="M540 330h30v210h-30z"/><g transform="translate(530 440)"><circle r="6" class="teal"/><circle r="9" class="ring" style="stroke:#1F6E86"/></g><g transform="translate(700 104)"><circle r="6" class="teal"/><circle r="9" class="ring" style="stroke:#1F6E86"/></g><g transform="translate(620 430)"><circle r="6" class="teal"/><circle r="9" class="ring" style="stroke:#1F6E86"/></g><g transform="translate(766 430)"><circle r="6" class="teal"/><circle r="9" class="ring" style="stroke:#1F6E86"/></g></g></svg>`;
  host.innerHTML = s;
}

/* ================= робот ================= */
function buildRobot(host) {
  const r = rng(3), R = (a, b) => a + (b - a) * r();
  let s = `<svg class="sc" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rmt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#E4F0F3"/><stop offset="1" stop-color="#CFE3E8"/></linearGradient><linearGradient id="rcn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F26A1B" stop-opacity=".5"/><stop offset="1" stop-color="#F26A1B" stop-opacity=".04"/></linearGradient><clipPath id="rmon"><rect x="52" y="46" width="226" height="126" rx="10"/></clipPath></defs>`;
  s += `<rect x="-50" y="232" width="1000" height="226" fill="url(#rmt)"/><path d="M-50 244H430" stroke="#fff" stroke-width="5"/>`;
  let dep = ''; for (let x = 560; x < 920; x += R(16, 28)) dep += `<circle class="dep" cx="${x | 0}" cy="${232 + R(0, 6) | 0}" r="${R(7, 15) | 0}"/><circle class="dep" cx="${x + 9 | 0}" cy="${458 - R(0, 6) | 0}" r="${R(7, 16) | 0}"/>` + (r() > .5 ? `<rect class="dep" x="${x | 0}" y="238" width="4" height="${R(14, 30) | 0}" rx="2"/>` : '');
  s += `<rect x="560" y="232" width="400" height="226" class="dep-soft"/>` + dep;
  s += `<g class="rb-dust">` + Array.from({ length: 14 }, () => `<circle cx="${R(380, 1000) | 0}" cy="${R(260, 430) | 0}" r="${R(1.5, 3.5).toFixed(1)}" fill="#B07A35" opacity=".5"/>`).join('') + `</g>`;
  s += `<rect class="slab" x="-50" y="212" width="1000" height="20"/><rect class="slab" x="-50" y="458" width="1000" height="20"/>`;
  [120, 470, 820].forEach(x => s += `<rect class="ink-f" x="${x - 7}" y="198" width="14" height="48" rx="2"/><rect class="ink-f" x="${x - 7}" y="444" width="14" height="48" rx="2"/><path class="thin" d="M${x} 246V444"/>`);
  s += `<g class="rb-body"><path class="rb-cone" d="M548 338L900 240V452Z" fill="url(#rcn)"/><path class="ink" d="M308 404C200 440 120 380 0 420S-60 300 150 180" style="stroke-width:3"/>`;
  s += `<rect x="300" y="368" width="232" height="54" rx="14" fill="#0F2E3B"/><rect x="316" y="380" width="120" height="10" rx="5" fill="#1F6E86"/><circle class="or blink" cx="512" cy="386" r="5"/>`;
  s += `<path d="M430 368V332h60v36" fill="#0F2E3B"/><rect x="474" y="314" width="78" height="46" rx="10" fill="#0F2E3B"/><circle cx="548" cy="337" r="15" fill="#1F6E86" stroke="#fff" stroke-width="3"/><circle cx="548" cy="337" r="5" fill="#0A222C"/><circle cx="530" cy="322" r="3.4" class="or"/><circle cx="530" cy="352" r="3.4" class="or"/>`;
  [330, 416, 502].forEach(x => s += `<g><circle cx="${x}" cy="432" r="26" fill="#fff" stroke="#0F2E3B" stroke-width="4"/><g class="rb-wheel"><path d="M${x - 18} 432h36M${x} 414v36" stroke="#0F2E3B" stroke-width="3"/><circle cx="${x}" cy="432" r="7" fill="#0F2E3B"/></g></g>`);
  s += `</g><rect x="40" y="34" width="250" height="150" rx="16" fill="#0F2E3B"/><rect x="52" y="46" width="226" height="126" rx="10" fill="#0A222C"/><g clip-path="url(#rmon)"><g class="rb-tun"><rect x="52" y="46" width="226" height="126" rx="8"/><rect x="52" y="46" width="226" height="126" rx="8"/><rect x="52" y="46" width="226" height="126" rx="8"/><rect x="52" y="46" width="226" height="126" rx="8"/></g><path d="M165 96v26M152 109h26" stroke="#F26A1B" stroke-width="2"/></g><circle class="or blink" cx="264" cy="60" r="5"/><path d="M62 164h60" stroke="#57A5BA" stroke-width="3" stroke-linecap="round"/></svg>`;
  host.innerHTML = s;
}

/* ================= карта ================= */
function buildMap(host) {
  const B = [[46.5, 48.5], [47, 49.9], [48.4, 49.8], [48.8, 50.6], [50.8, 51.7], [52.3, 51.7], [53.4, 51.5], [54.5, 51], [55.7, 50.6], [57.5, 51.1], [58.6, 51], [59.9, 50.8], [61.5, 51.2], [60.9, 52.2], [61, 53], [61.2, 53.6], [62, 54], [63.2, 54.2], [65.2, 54.4], [66.6, 54.7], [68.2, 55], [69, 55.4], [70.2, 55.2], [70.8, 55.3], [71.2, 54.3], [72, 54.3], [73.3, 54], [73.7, 54.1], [74.4, 53.6], [76.5, 54.2], [76.9, 54.4], [77.9, 53.3], [80.1, 50.8], [81.5, 50.8], [83.4, 51], [84.3, 50.3], [85.3, 49.6], [87.3, 49.2], [87, 48.6], [85.7, 48.4], [85.8, 47.1], [83, 47.2], [82.3, 45.5], [80.3, 45], [79.9, 44.9], [80.4, 43], [80.2, 42.3], [79.2, 42.8], [76, 42.9], [75, 42.9], [73.5, 43], [73.6, 42.4], [71.8, 42.8], [70.9, 42.3], [70.2, 41.6], [69.1, 41.4], [68.1, 40.8], [66.7, 41.2], [66.5, 42], [66, 42.4], [66.1, 43], [64.9, 43.7], [62, 43.5], [61.1, 44.3], [58.6, 45.6], [56, 45], [56, 41.3], [55.5, 41.3], [54.9, 42], [53, 42.1], [52.5, 41.8], [52.4, 42.8], [51.2, 43.2], [50.9, 44.2], [50.3, 44.3], [51.3, 45.2], [53, 45.3], [53.2, 46.3], [53, 46.9], [51.2, 47.1], [49.2, 46.4], [48.6, 46.6], [49, 46.8], [48.2, 47.7], [47.3, 47.7]];
  const X = lon => 30 + (lon - 46.5) * 21.3, Y = lat => 24 + (55.4 - lat) * 33;
  const d = 'M' + B.map(p => `${X(p[0]).toFixed(0)} ${Y(p[1]).toFixed(0)}`).join('L') + 'Z';
  const C = [['geo.c1', 'Астана', 71.45, 51.17, 1, 14, -14], ['geo.c2', 'Актобе', 57.2, 50.28, 0, 14, 30], ['geo.c3', 'Караганда', 73.1, 49.8, 0, 16, 26], ['geo.c4', 'Шымкент', 69.6, 42.3, 0, -14, -14, 1]];
  const ax = X(C[0][2]), ay = Y(C[0][3]);
  let s = `<svg class="sc mp" viewBox="0 0 930 520"><path d="${d}" transform="translate(8 10)" fill="#1F6E86" opacity=".14"/><path class="land" d="${d}"/>`;
  for (let i = 1; i < 6; i++) s += `<path class="land2" d="M${150 * i} 20V500"/>`;
  s += `<path class="land" d="${d}" style="fill:none"/>`;
  C.slice(1).forEach((c, i) => { const x = X(c[2]), y = Y(c[3]), mx = (ax + x) / 2, my = (ay + y) / 2 - 46; const pth = `M${ax} ${ay}Q${mx} ${my} ${x} ${y}`; s += `<path class="rt" d="${pth}"/><rect class="van" x="-9" y="-5" width="18" height="10" rx="3"><animateMotion dur="${5 + i * 1.3}s" repeatCount="indefinite" rotate="auto" path="${pth}"/></rect>`; });
  s += `<circle class="van" r="5"><animateMotion dur="7s" repeatCount="indefinite" path="M${ax} ${ay}Q${ax + 120} ${ay - 60} ${X(82.6)} ${Y(49.95)}"/></circle><path class="rt" d="M${ax} ${ay}Q${ax + 120} ${ay - 60} ${X(82.6)} ${Y(49.95)}M${ax} ${ay}Q${ax - 200} ${ay + 150} ${X(51.9)} ${Y(47.1)}M${ax} ${ay}Q${ax + 60} ${ay + 130} ${X(76.9)} ${Y(43.25)}" style="opacity:.4"/>`;
  C.forEach(c => { const x = X(c[2]), y = Y(c[3]); s += `<g transform="translate(${x} ${y})">` + (c[4] ? `<circle r="12" class="ring"/><circle r="12" class="ring r2"/><circle r="9" class="cap"/>` : `<circle r="7" class="city"/>`) + `<text x="${c[5]}" y="${c[6]}" ${c[7] ? 'text-anchor="end"' : ''} data-i18n="${c[0]}">${c[1]}</text></g>`; });
  host.innerHTML = s + '</svg>';
}
function buildFan(host) {
  let s = `<svg viewBox="0 0 600 600" fill="none" stroke="#57A5BA" stroke-width="2"><circle cx="300" cy="300" r="292"/><circle cx="300" cy="300" r="280" stroke-dasharray="3 9"/><g class="rot">`;
  for (let i = 0; i < 9; i++) s += `<path transform="rotate(${i * 40} 300 300)" d="M300 300Q380 180 300 40Q330 190 300 300Z"/>`;
  host.innerHTML = s + `<circle cx="300" cy="300" r="40"/></g></svg>`;
}

/* ================= i18n ================= */
const RU = {}; let LANG = 'ru';
function captureRU() { $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in RU)) RU[k] = el.textContent; }); }
function applyOne(el) { const k = el.dataset.i18n, v = LANG === 'kk' ? ((window.SITE_KK || {})[k] || RU[k]) : RU[k]; if (v != null && el.textContent !== v) el.textContent = v; }
const META = { t: document.title, d: (document.querySelector('meta[name="description"]') || {}).content || '' };
function applyLang() {
  const KK = window.SITE_KK || {};
  const md = document.querySelector('meta[name="description"]');
  document.title = LANG === 'kk' && KK['meta.title'] ? KK['meta.title'] : META.t;
  if (md) md.content = LANG === 'kk' && KK['meta.desc'] ? KK['meta.desc'] : META.d;
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; const v = LANG === 'kk' ? (KK[k] || RU[k]) : RU[k]; if (v != null && el.textContent !== v) el.textContent = v; });
  document.documentElement.lang = LANG === 'kk' ? 'kk' : 'ru';
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
  document.dispatchEvent(new CustomEvent('langchange'));
}
function setLang(l, save) {
  LANG = l === 'kk' ? 'kk' : 'ru';
  if (save) { try { localStorage.setItem('lang', LANG); } catch (e) {} }
  if (LANG === 'kk' && !window.SITE_KK) {
    const s = document.createElement('script'); const base = SELF ? SELF.src.replace(/script\.js.*$/, '') : '';
    s.src = base + 'assets/lang/' + (document.body.dataset.kk || 'kk') + '.js' + (VER ? '?v=' + VER : ''); s.onload = applyLang; s.onerror = () => { LANG = 'ru'; applyLang(); };
    document.head.appendChild(s);
  } else applyLang();
}

/* ================= запуск ================= */
const scenes = [];
let lenis = null;
function init() {
  const page = !!$('#heroScene');
  let hero = null, tour = null, heroKey = null;
  const mqM = matchMedia('(max-width:860px)');

  if (page) {
    const mkHero = () => {
      const key = mqM.matches ? 'm' : 'd'; if (key === heroKey) return; heroKey = key;
      const old = hero; hero = buildTract($('#heroScene'), key, 'h', key === 'm' ? 'xMidYMax slice' : 'xMaxYMax meet');
      if (old) { scenes.splice(scenes.indexOf(old), 1); hero.render(old.p); } scenes.push(hero);
    };
    mkHero();
    tour = buildTract($('#tourScene'), 'd', 't', 'xMidYMid slice'); scenes.push(tour);
    buildDDD($('#dddScene')); buildRobot($('#robotScene')); buildMap($('#mapScene')); buildFan($('#reqBg'));
    mqM.addEventListener('change', () => { mkHero(); applyLang(); layoutHero(); });
  }
  captureRU();

  /* язык */
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));
  const qs = new URLSearchParams(location.search).get('lang'); let saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
  const start = qs === 'kk' || qs === 'ru' ? qs : saved; if (start === 'kk') setLang('kk', false);

  /* плавная прокрутка */
  if (window.Lenis && !RM) {
    lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const hdrH = () => $('.hdr').offsetHeight;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1), el = id && id !== 'top' ? document.getElementById(id) : null;
    if (id && id !== 'top' && !el) return; e.preventDefault(); closeMenu();
    const y = el ? el.getBoundingClientRect().top + scrollY - hdrH() + 1 : 0;
    if (lenis) lenis.scrollTo(y, { duration: 1.3 }); else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    if (el) history.replaceState(null, '', '#' + id);
  });

  /* шапка, меню, липкая панель, спинка */
  const hdr = $('.hdr'), mbar = $('.mbar'), spine = $('.spine'), spineI = spine && $('i', spine), burger = $('.burger'), mm = $('#mmenu');
  function closeMenu() { if (!mm || mm.hidden) return; mm.hidden = true; burger.setAttribute('aria-expanded', 'false'); if (lenis) lenis.start(); document.documentElement.style.overflow = ''; }
  addEventListener('keydown', e => { if (e.key === 'Escape' && mm && !mm.hidden) { closeMenu(); burger.focus(); } });
  if (burger) burger.addEventListener('click', () => { if (mm.hidden) { mm.hidden = false; burger.setAttribute('aria-expanded', 'true'); hdr.classList.add('is-solid'); if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden'; } else closeMenu(); });
  const onScroll = () => {
    const y = scrollY; hdr.classList.toggle('is-solid', y > 20 || (mm && !mm.hidden));
    if (mbar) { const hw = $('.hero-wrap'), kt = $('#kontakty'); const from = hw ? hw.offsetTop + hw.offsetHeight - innerHeight * .45 : innerHeight * .55; mbar.classList.toggle('is-on', y > from && (!kt || kt.getBoundingClientRect().top > innerHeight * .35)); }
    if (spine) { spine.classList.toggle('is-on', y > innerHeight * 1.6); spineI.style.transform = `scaleY(${clamp(y / (document.documentElement.scrollHeight - innerHeight)).toFixed(4)})`; }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (!page) return;

  /* герой: закрепление и фронт очистки */
  const wrap = $('.hero-wrap'), heroEl = $('.hero'), meter = $('.hero-meter i');
  const hs = { intro: 0, prog: 0 };
  function layoutHero() {
    if (RM) { hero.render(1); return; }
    if (mqM.matches) { const h = heroEl.offsetHeight; wrap.style.setProperty('--hh', h + 'px'); wrap.classList.add('is-pin'); heroEl.style.top = Math.min(0, innerHeight - h) + 'px'; }
    else { wrap.classList.remove('is-pin'); heroEl.style.top = ''; }
  }
  const heroRender = () => { const p = Math.max(hs.intro, clamp(hs.prog / .86)); hero.render(p); if (meter) meter.style.transform = `scaleX(${p.toFixed(3)})`; };
  layoutHero();
  let lastW = innerWidth; addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; layoutHero(); if (hasG) ScrollTrigger.refresh(); } });

  /* живые анимации сцен: один тикер, вне экрана пауза */
  const io = new IntersectionObserver(es => es.forEach(e => { const S = scenes.find(s => s.host === e.target); if (S) S.active = e.isIntersecting; e.target.classList.toggle('is-paused', !e.isIntersecting); }), { rootMargin: '80px' });
  ['#heroScene', '#tourScene', '#dddScene', '#robotScene', '#mapScene', '#reqBg'].forEach(s => io.observe($(s)));
  if (!RM) { let last = performance.now(); const loop = (now) => { const dt = Math.min(.05, (now - last) / 1000); last = now; for (const S of scenes) S.tick(dt); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  /* тур по узлам */
  const tourEl = $('#tour'), stops = $$('.stop'), rails = $$('.rail li'), pairs = $$('.tour-photos .pair'), win = $('.tour-win'), anchors = $$('.tour-a');
  let cur = -1;
  const setStop = i => { if (i === cur) return; cur = i; stops.forEach((s, k) => s.classList.toggle('is-on', k === i)); pairs.forEach((s, k) => s.classList.toggle('is-on', k === i)); rails.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); }); };
  const D = CFG.d, cxS = D.SX + D.sw / 2;
  const cam = { p: 0, cx: 830, cy: 540, w: 1640 };
  const camDraw = () => { const r = win.clientWidth / Math.max(1, win.clientHeight); let w = cam.w; const h = w / r; tour.view(cam.cx, cam.cy, w, h); tour.render(cam.p); };
  const K = [
    [{ cx: D.HX + 30, cy: 716, w: 540 }, { p: SEG[0], cx: D.HX + 40, cy: 704, w: 480 }, .9],
    [{ cx: D.HX + 190, cy: 668, w: 600 }, { p: SEG[0] + SEG[1], cx: D.SX - 130, cy: 668, w: 600 }, 1.5],
    [{ cx: cxS + 50, cy: 600, w: 560 }, { p: 1 - SEG[3], cx: cxS + 50, cy: 380, w: 560 }, 1],
    [{ cx: cxS + 40, cy: 215, w: 470 }, { p: 1, cx: cxS + 40, cy: 205, w: 400 }, .8]
  ];
  if (hasG && !RM) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => { camDraw(); const t = tl.time(); let i = 0; marks.forEach((m, k) => { if (t >= m - .22) i = k; }); setStop(i); } });
    const marks = [];
    K.forEach((k, i) => { tl.to(cam, { ...k[0], duration: i ? .55 : .7, ease: 'power2.inOut' }); marks.push(tl.duration()); tl.to(cam, { ...k[1], duration: k[2] }); });
    tl.to(cam, { duration: .35 });
    const place = () => { const span = tourEl.offsetHeight - innerHeight; anchors.forEach((a, i) => a.style.top = (marks[i] / tl.duration() * span + hdrH() + 4) + 'px'); };
    place(); ScrollTrigger.create({ trigger: tourEl, start: 'top top', end: 'bottom bottom', scrub: .5, animation: tl, onRefresh: place });
    camDraw(); setStop(0);
  } else { cam.cx = 800; cam.cy = 470; cam.w = 1700; cam.p = 1; camDraw(); tourEl.style.height = 'auto'; $('.tour-stage').style.position = 'relative'; }
  $$('.rail a').forEach(a => a.tabIndex = -1);

  if (hasG && !RM) {
    /* герой: интро */
    const lay = hero.svgs;
    gsap.from(lay, { opacity: 0, y: i => [0, 40, 30, 18, 0][i], duration: 1.2, stagger: .09, delay: .1, clearProps: 'transform,opacity' });
    const tw = { v: 0 }; gsap.to(hs, { intro: SEG[0] - .002, duration: 2.4, delay: 1.1, ease: 'power2.inOut', onUpdate: heroRender });
    const txt = $('.hero-txt');
    /* интро текста - только если скрипты пришли быстро (класс pre ещё стоит); пришли поздно - текст уже виден, не мигаем */
    if (document.documentElement.classList.contains('pre')) { document.documentElement.classList.remove('pre'); gsap.from([$('.kicker', txt), $('.btns', txt), $('.ig-link', txt)], { opacity: 0, y: 22, duration: .9, stagger: .1, delay: .15, clearProps: 'all' }); }
    ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: .6, onUpdate: s => { hs.prog = s.progress; heroRender(); gsap.set(hero.far, { y: -s.progress * 26 }); } });
    if (matchMedia('(hover:hover)').matches) { const qx = gsap.quickTo(hero.far, 'x', { duration: .8 }); heroEl.addEventListener('pointermove', e => { if (heroKey === 'd') qx((e.clientX / innerWidth - .5) * -26); }); }

    /* появление секций */
    $$('.sec-head, .insp-txt, .geo-txt, .req-txt').forEach(h => {
      const items = [...h.children].flatMap(c => c.classList.contains('kicker') || c.tagName === 'H2' || c.classList.contains('lead') || c.tagName === 'UL' || c.classList.contains('ig-link') || c.classList.contains('btns') || c.classList.contains('arrows') ? [c] : [...c.children]);
      const h2 = $('h2', h), rest = items.filter(x => x !== h2);
      gsap.from(rest, { opacity: 0, y: 34, duration: .9, stagger: .08, scrollTrigger: { trigger: h, start: 'top 82%' }, clearProps: 'transform,opacity' });
      if (h2) ScrollTrigger.create({ trigger: h, start: 'top 82%', once: true, onEnter: () => {
        if (!window.SplitText) return gsap.from(h2, { opacity: 0, y: 34, duration: .9 });
        const sp = SplitText.create(h2, { type: 'lines', mask: 'lines' });
        gsap.from(sp.lines, { yPercent: 110, duration: 1.1, stagger: .09, onComplete: () => { sp.revert(); applyOne(h2); } });
      } });
    });
    const pop = (sel, vars, trig) => { const els = $$(sel); if (els.length) gsap.from(els, { opacity: 0, y: 44, duration: .9, stagger: .09, scrollTrigger: { trigger: trig || els[0], start: 'top 84%' }, clearProps: 'transform,opacity', ...vars }); };
    pop('.sheet', { rotate: 0, y: 70, stagger: .1 }); pop('.case'); pop('.steps li'); pop('.dcard', { x: -30, y: 0 }); pop('.qa details'); pop('.cont-list>div', { y: 24, stagger: .06 }); pop('.form', { y: 50 }); pop('.ticks li, .who li', { y: 18, stagger: .06 });
    [['.insp-art', -40], ['.ddd-win', 40], ['.geo-map', 40]].forEach(([s, x]) => gsap.from(s, { opacity: 0, x, clipPath: x < 0 ? 'inset(0 100% 0 0 round 22px)' : 'inset(0 0 0 100% round 22px)', duration: 1.2, scrollTrigger: { trigger: s, start: 'top 80%' }, clearProps: 'all' }));
    gsap.to('.pfill', { scaleX: 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 55%', scrub: .5 } });
    $$('[data-count]').forEach(el => { const n = +el.dataset.count, o = { v: 0 }; gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => el.textContent = Math.round(o.v) }); });
    gsap.to('.req-bg svg', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.req-sec', start: 'top bottom', end: 'bottom top', scrub: true } });
  } else { hero.render(1); document.documentElement.classList.remove('pre'); }

  /* бегущие строки */
  const marqs = [];
  function marquee(track, speed, dirByScroll) {
    const st = { tween: null };
    const setup = () => {
      if (st.tween) st.tween.kill(); $$('[data-clone]', track).forEach(n => n.remove());
      let set = track.firstElementChild; if (!set.classList.contains('cl-set') && !set.classList.contains('mset')) { set = document.createElement('div'); set.className = 'mset'; while (track.firstChild) set.appendChild(track.firstChild); track.appendChild(set); }
      const w = set.offsetWidth; if (!w) return; const n = Math.ceil(innerWidth / w) + 1;
      for (let i = 0; i < n; i++) { const c = set.cloneNode(true); c.dataset.clone = '1'; c.setAttribute('aria-hidden', 'true'); $$('img', c).forEach(im => im.alt = ''); track.appendChild(c); }
      if (hasG && !RM) st.tween = gsap.fromTo(track, { x: 0 }, { x: -w, duration: w / speed, ease: 'none', repeat: -1 });
    };
    setup(); marqs.push(setup);
    if (dirByScroll && hasG && !RM) ScrollTrigger.create({ trigger: track, start: 'top bottom', end: 'bottom top', onUpdate: s => { if (st.tween) gsap.to(st.tween, { timeScale: s.direction * (1 + Math.min(3, Math.abs(s.getVelocity()) / 900)), duration: .4, overwrite: true }); } });
  }
  marquee($('#clTrack'), 46); marquee($('[data-marq]'), 90, true);
  document.addEventListener('langchange', () => { marqs.forEach(f => f()); if (hasG) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { marqs.forEach(f => f()); if (hasG) ScrollTrigger.refresh(); });
  /* прямой переход по ссылке с якорем (объявления): после раскладки сцен - точно к блоку, под шапку */
  let hashDone = false;
  const jumpHash = () => { if (hashDone) return; hashDone = true; const id = decodeURIComponent(location.hash.slice(1)); const el = id && document.getElementById(id); if (!el) return; const y = el.getBoundingClientRect().top + scrollY - hdrH() + 1; if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); };
  const onLoad = () => { marqs.forEach(f => f()); layoutHero(); if (hasG) ScrollTrigger.refresh(); jumpHash(); };
  if (document.readyState === 'complete') setTimeout(onLoad, 0); else addEventListener('load', onLoad);

  /* лента «до/после» */
  const strip = $('#strip'), prev = $('.arw.prev'), next = $('.arw.next');
  const step = () => { const s = $('.shot', strip); return s.offsetWidth + parseFloat(getComputedStyle(strip).columnGap || 20); };
  const upd = () => { const max = strip.scrollWidth - strip.clientWidth - 4; prev.disabled = strip.scrollLeft < 4; next.disabled = strip.scrollLeft > max; const fits = strip.scrollWidth <= strip.clientWidth + 4; prev.hidden = next.hidden = fits; };
  prev.addEventListener('click', () => strip.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => strip.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
  strip.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); sio.unobserve(e.target); } }), { threshold: .1 });
  $$('.shot').forEach(s => sio.observe(s));
  /* фото тура и ленты «до/после» грузятся, когда блок подходит к экрану (не мешают первому экрану) */
  const setSrc = im => { if (!im.dataset.src) return; im.src = im.dataset.src; im.removeAttribute('data-src'); const sh = im.closest('.shot-img'); if (sh) sh.style.setProperty('--src', `url("${im.getAttribute('src')}")`); };
  const lio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; $$('img[data-src]', e.target).forEach(setSrc); lio.unobserve(e.target); }), { rootMargin: '900px 0px' });
  ['.tour-photos', '#strip'].forEach(sel => { const el = $(sel); if (el) lio.observe(el); });

  /* ДДД: активная услуга */
  const dwin = $('#dddScene'), dcards = $$('.dcard');
  const setD = c => { dcards.forEach(x => x.classList.toggle('is-on', x === c)); dwin.dataset.on = c.dataset.k; };
  dcards.forEach(c => { c.addEventListener('pointerenter', () => { if (matchMedia('(hover:hover)').matches) setD(c); }); c.addEventListener('click', () => setD(c)); c.addEventListener('focusin', () => setD(c));
    if (hasG) ScrollTrigger.create({ trigger: c, start: 'top 62%', end: 'bottom 62%', onToggle: s => { if (s.isActive) setD(c); } }); });

  /* форма -> WhatsApp */
  const form = $('#leadForm');
  form.addEventListener('submit', e => {
    e.preventDefault(); const f = form.elements; let ok = true;
    [f.name, f.phone].forEach(i => { const bad = !i.value.trim() || (i === f.phone && i.value.replace(/\D/g, '').length < 10); i.classList.toggle('is-err', bad); if (bad && ok) { i.focus(); ok = false; } });
    if (!ok) return;
    const work = f.work.options[f.work.selectedIndex];
    const msg = ['Здравствуйте! Заявка с сайта.', 'Имя: ' + f.name.value.trim(), 'Телефон: ' + f.phone.value.trim(), 'Город: ' + f.city.value.trim(), 'Вид работ: ' + (RU[work.dataset.i18n] || work.textContent), 'Комментарий: ' + f.comment.value.trim()].join('\n');
    window.open('https://wa.me/77000333363?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    $('.form-ok', form).hidden = false;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
