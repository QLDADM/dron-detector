// Wspólny rysunek radaru (wskaźnik PPI) i widoku 3D: strona RID Decoder, strona tabletu (phone/)
// oraz pełny widok w osobnej karcie (view.html), który dostaje dane z karty głównej przez BroadcastChannel.
// Plik jest w dwóch miejscach (static/ i static/phone/) i musi być w obu taki sam.
"use strict";
const RidViews = (() => {
  const VERSION = 2;  // podnieść przy zmianie danych wysyłanych do pełnego widoku
  const G = "#3ccf7a", SWEEP_MS = 4000, RAD = Math.PI / 180;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const distText = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(Math.round(m) % 1000 ? 1 : 0)} km`);
  // wielkość znaków drona liczona z rozmiaru rysunku na ekranie: te same piksele w małym panelu i na pełnym ekranie
  const fit = (px, k, min, max) => Math.min(max, Math.max(min, px / (k || 1e-6)));
  const unitPx = (svg, w, h) => Math.min(svg.clientWidth / w, svg.clientHeight / h);
  const hTxt = (p) => `↑${p.h != null ? `${Math.round(p.h)} m` : "?"} · ↔${distText(p.dist)}`;
  const color = (tag) => (tag === "own" ? "#3ccf7a" : tag === "foreign" ? "#ff4d4f" : "#f0b429");

  // Zasięg dobierany do dronów, najwyżej 5 km (dalej anteny i tak nie łapią): najmniejszy stopień, w którym
  // najdalszy dron z aktualnym sygnałem jest najwyżej na ~85% promienia. Stary wpis z historii skali nie rozciąga.
  // Drony dalej niż 5 km nie są rysowane - strona pokazuje ich liczbę jako "poza skalą".
  const SCALES = [500, 1000, 2000, 3000, 5000];
  function pickScale(pts) {
    const fresh = pts.filter((p) => p.fresh);
    if (!fresh.length) return 1000;
    const need = Math.max(...fresh.map((p) => p.dist)) * 1.15;
    return SCALES.find((s) => s >= need) || SCALES[SCALES.length - 1];
  }

  // odległość -> promień rysunku (0..100) i pierścienie co 1/4 zasięgu
  const radial = (d, scale) => (100 * d) / scale;
  const rings = (scale) => [1, 2, 3, 4].map((i) => (scale * i) / 4);

  // radar jako największe koło, jakie mieści się w swoim polu
  function fitRadar(box, wrap) {
    const fit = () => { wrap.style.width = `${Math.max(80, Math.min(box.clientWidth, box.clientHeight))}px`; };
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(box);
    fit();
  }

  // ---- podkład mapy: kafelki wokół Twojej pozycji w jednostkach rysunku (100 = skala radaru),
  // u na wschód, v na południe; blisko środka Mercator jest praktycznie liniowy
  const TILES = {
    osm: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    sat: (z, x, y) => `https://mt${(x + y) % 4}.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`,
  };
  function tiles(me, scale, layer) {
    if (!me || !TILES[layer]) return "";
    const C = 40075016.686 * Math.cos(me.lat * RAD), span = scale * 1.15;
    const z = Math.min(18, Math.max(3, Math.floor(Math.log2(C / (span / 2)))));
    const n = 2 ** z, tm = C / n, k = 100 / scale, w = (tm * k).toFixed(2);
    const cx = ((me.lon + 180) / 360) * n;
    const cy = ((1 - Math.log(Math.tan(me.lat * RAD) + 1 / Math.cos(me.lat * RAD)) / Math.PI) / 2) * n;
    const d = span / tm;
    let s = "";
    for (let x = Math.floor(cx - d); x <= Math.floor(cx + d); x++) {
      for (let y = Math.floor(cy - d); y <= Math.floor(cy + d); y++) {
        if (y < 0 || y >= n) continue;
        // +0.3: kafelki zachodzą na siebie, inaczej przy obrocie widać szpary
        s += `<image href="${TILES[layer](z, ((x % n) + n) % n, y)}" x="${((x - cx) * tm * k).toFixed(2)}" y="${((y - cy) * tm * k).toFixed(2)}" width="${+w + 0.3}" height="${+w + 0.3}" preserveAspectRatio="none"/>`;
      }
    }
    return s;
  }
  // podmiana kafelków tylko przy zmianie pozycji (o ~10 m), skali albo warstwy - inaczej obraz migał
  function mapInto(g, me, scale, layer) {
    const key = me && TILES[layer] ? `${layer}|${scale}|${me.lat.toFixed(4)}|${me.lon.toFixed(4)}` : "";
    if (g._key === key) return;
    g._key = key;
    g.innerHTML = tiles(me, scale, layer);
    g.setAttribute("class", `mapg ${layer || ""}`);
  }

  // siatka jak na wojskowym wskaźniku PPI: pierścienie odległości, promienie co 30°, podziałka azymutu co 5°
  function radarGrid(scale) {
    const P = (r, deg) => [(r * Math.sin(deg * RAD)).toFixed(1), (-r * Math.cos(deg * RAD)).toFixed(1)];
    const rs = rings(scale).map((d) => [d, radial(d, scale)]);
    let s = "";
    // między pierścieniami cieńsze kropkowane (w połowie promienia sąsiednich)
    rs.forEach(([, r], i) => {
      const mid = (r + (i ? rs[i - 1][1] : 0)) / 2;
      s += `<circle class="gr" r="${mid.toFixed(1)}" fill="none" stroke="${G}" stroke-opacity=".2" stroke-width="0.4" stroke-dasharray="1 2"/>`;
      const last = i === rs.length - 1;
      s += `<circle class="gr" r="${r.toFixed(1)}" fill="none" stroke="${G}" stroke-opacity="${last ? 0.85 : 0.45}" stroke-width="${last ? 1 : 0.6}"/>`;
    });
    for (let deg = 0; deg < 360; deg += 30) {
      const [x, y] = P(100, deg), main = deg % 90 === 0;
      s += `<line class="gr" x1="0" y1="0" x2="${x}" y2="${y}" stroke="${G}" stroke-opacity="${main ? 0.45 : 0.25}" stroke-width="${main ? 0.6 : 0.4}"${main ? "" : ' stroke-dasharray="2 2"'}/>`;
    }
    for (let deg = 0; deg < 360; deg += 5) {
      const [x1, y1] = P(100, deg), [x2, y2] = P(deg % 30 === 0 ? 93 : deg % 10 === 0 ? 96 : 98, deg);
      s += `<line class="gr" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${G}" stroke-opacity=".8" stroke-width="0.6"/>`;
    }
    for (let deg = 0; deg < 360; deg += 30) {
      const [x, y] = P(87, deg);
      s += `<text class="gt" x="${x}" y="${y}" fill="${G}" fill-opacity="${deg ? 0.75 : 1}" font-size="${deg ? 7 : 9}" font-family="monospace" text-anchor="middle" dominant-baseline="central">${deg ? String(deg).padStart(3, "0") : "N"}</text>`;
    }
    for (const [d, r] of rs) {
      const [x, y] = P(r, 45);
      s += `<text class="gt" x="${x}" y="${y}" fill="${G}" font-size="7" font-family="monospace" text-anchor="middle" dominant-baseline="central" stroke="#03130a" stroke-width="3" paint-order="stroke">${distText(d)}</text>`;
    }
    return s + `<circle class="gt" r="2.5" fill="${G}"/>`;
  }

  // radar: wiązka tylko wizualna, pozycje dronów pochodzą z ich Remote ID
  const sweeps = new WeakMap();
  function radar(svg, sweep, pts, scale) {
    const phase = Date.now() % SWEEP_MS;
    // animacja uruchamiana raz: zmiana przy każdym odświeżeniu danych powodowała przeskoki wiązki
    if (!sweeps.has(sweep) && document.timeline.currentTime !== null) {
      const a = sweep.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: SWEEP_MS, iterations: Infinity });
      a.startTime = document.timeline.currentTime - phase;  // kąt wiązki wynika z zegara, tak jak rozbłyski dronów
      sweeps.set(sweep, a);
    }
    const k = unitPx(svg, 220, 220), fs = fit(11, k, 4.5, 9), r0 = fit(6, k, 2.2, 4.5);
    let s = radarGrid(scale);
    for (const p of pts) {
      if (p.dist > scale) continue;
      const r = radial(p.dist, scale);
      const x = r * Math.sin(p.brg * RAD), y = -r * Math.cos(p.brg * RAD);
      if (p.kind === "o") {
        s += `<rect x="${x - r0 * 0.55}" y="${y - r0 * 0.55}" width="${r0 * 1.1}" height="${r0 * 1.1}" fill="#f0b429" stroke="#000" stroke-width="${r0 * 0.12}" opacity="${p.fresh ? 1 : 0.4}"/>`;
        continue;
      }
      // dron rozbłyska, gdy mija go wiązka, ale nigdy nie znika
      const since = (phase - (p.brg / 360) * SWEEP_MS + SWEEP_MS) % SWEEP_MS;
      const halo = `stroke="#02100a" stroke-width="${(fs * 0.28).toFixed(2)}" paint-order="stroke" font-family="monospace"`;
      s += `<g opacity="${p.fresh ? 1 : 0.4}"><g class="blip" style="animation-delay:${-since}ms"><circle cx="${x}" cy="${y}" r="${r0}" fill="${color(p.tag)}" stroke="#000" stroke-width="${r0 * 0.18}"/>`;
      s += `<text x="${x + r0 + 1.5}" y="${y - fs * 0.15}" fill="#dbe4ec" font-size="${fs}" ${halo}>${esc(p.label)}</text>`;
      s += `<text x="${x + r0 + 1.5}" y="${y + fs * 0.85}" fill="#9fe8bd" font-size="${(fs * 0.85).toFixed(2)}" ${halo}>${hTxt(p)}</text></g></g>`;
    }
    svg.innerHTML = s;
  }

  // widok 3D wokół Twojej pozycji: skala pozioma jak na radarze, wysokość w osobnej (powiększonej) skali;
  // przeciąganie obraca widok (w poziomie) i zmienia nachylenie (w pionie)
  let v3count = 0;
  function view3d(svg, info) {
    const V = { pts: [], scale: 500, msg: "", az: 0, el: 32, drag: null, me: null, layer: "" };
    const clip = `v3clip${++v3count}`;
    svg.innerHTML = `<defs><clipPath id="${clip}"><circle r="100"/></clipPath></defs><g class="v3map"><g clip-path="url(#${clip})"></g></g><g class="v3fg"></g>`;
    const mapT = svg.querySelector(".v3map"), mapG = mapT.firstChild, fg = svg.querySelector(".v3fg");
    function draw() {
      const R = 100, HZ = 75;
      const sa = Math.sin(V.az * RAD), ca = Math.cos(V.az * RAD), se = Math.sin(V.el * RAD), ce = Math.cos(V.el * RAD);
      const hMax = Math.max(150, Math.ceil(Math.max(0, ...V.pts.map((p) => p.h || 0)) / 50) * 50);
      // x na wschód, y na północ, z w górę -> punkt na ekranie; d = głębokość (rysujemy od najdalszych)
      const P = (x, y, z) => {
        const X = x * ca - y * sa, Y = x * sa + y * ca;
        return { x: +X.toFixed(1), y: +(-Y * se - z * ce).toFixed(1), d: Y };
      };
      // mapa leży na ziemi: ten sam rzut co P dla z = 0, zapisany jako macierz (u na wschód, v na południe)
      mapT.setAttribute("transform", `matrix(${ca.toFixed(4)} ${(-sa * se).toFixed(4)} ${sa.toFixed(4)} ${(ca * se).toFixed(4)} 0 0)`);
      mapInto(mapG, V.me, V.scale, V.layer);
      const rs = rings(V.scale).map((d) => [d, radial(d, V.scale)]);
      const halo = 'stroke="#02100a" stroke-width="2.5" paint-order="stroke" font-family="monospace"';
      let s = "";
      rs.forEach(([, r], i) => {
        const last = i === rs.length - 1;
        s += `<ellipse class="gr" rx="${r.toFixed(1)}" ry="${(r * se).toFixed(1)}" fill="none" stroke="${G}" stroke-opacity="${last ? 0.7 : 0.35}" stroke-width="${last ? 0.9 : 0.5}"/>`;
      });
      for (let b = 0; b < 360; b += 30) {
        const e = P(R * Math.sin(b * RAD), R * Math.cos(b * RAD), 0);
        s += `<line class="gr" x1="0" y1="0" x2="${e.x}" y2="${e.y}" stroke="${G}" stroke-opacity="${b % 90 ? 0.18 : 0.4}" stroke-width="0.5"/>`;
      }
      ["N", "E", "S", "W"].forEach((t, i) => {
        const e = P(R * 1.1 * Math.sin(i * 90 * RAD), R * 1.1 * Math.cos(i * 90 * RAD), 0);
        s += `<text class="gt" x="${e.x}" y="${e.y}" fill="${G}" font-size="${t === "N" ? 10 : 8}" text-anchor="middle" dominant-baseline="central" ${halo}>${t}</text>`;
      });
      for (const [d, r] of rs) {
        s += `<text class="gt" x="${(r * 0.71).toFixed(1)}" y="${(r * se * 0.71 + 3).toFixed(1)}" fill="${G}" fill-opacity=".8" font-size="7" text-anchor="middle" ${halo}>${distText(d)}</text>`;
      }
      // oś wysokości nad Tobą
      const step = hMax <= 200 ? 50 : 100;
      s += `<line class="gr" x1="0" y1="0" x2="0" y2="${(-HZ * ce).toFixed(1)}" stroke="${G}" stroke-opacity=".5" stroke-width="0.6"/>`;
      for (let h = step; h <= hMax; h += step) {
        const y = ((-HZ * h) / hMax * ce).toFixed(1);
        s += `<line class="gr" x1="-2" y1="${y}" x2="2" y2="${y}" stroke="${G}" stroke-opacity=".6" stroke-width="0.6"/>`;
        s += `<text class="gt" x="-4" y="${y}" fill="${G}" fill-opacity=".7" font-size="7" text-anchor="end" dominant-baseline="central" ${halo}>${h} m</text>`;
      }
      const k = unitPx(svg, 224, 190), fs = fit(11, k, 4.5, 9), r0 = fit(5.5, k, 2, 3.5);
      const lhalo = `stroke="#02100a" stroke-width="${(fs * 0.28).toFixed(2)}" paint-order="stroke" font-family="monospace"`;
      const items = [], tops = new Map();
      for (const p of V.pts) {
        const r = radial(p.dist, V.scale), x = r * Math.sin(p.brg * RAD), y = r * Math.cos(p.brg * RAD);
        const z = p.kind === "d" ? (HZ * Math.min(p.h || 0, hMax)) / hMax : 0;
        const it = { p, g: P(x, y, 0), t: P(x, y, z) };
        items.push(it);
        if (p.kind === "d") tops.set(p.n, it.t);
      }
      for (const { p, g } of items) {  // linia operator-dron pod pozostałymi znakami
        const t = p.kind === "o" && tops.get(p.n);
        if (t) s += `<line x1="${g.x}" y1="${g.y}" x2="${t.x}" y2="${t.y}" stroke="#f0b429" stroke-opacity="${p.fresh ? 0.6 : 0.25}" stroke-width="0.6" stroke-dasharray="2 2"/>`;
      }
      s += '<circle r="2.6" fill="#3fb6ff" stroke="#fff" stroke-width="0.8"/>';
      items.sort((a, b) => b.g.d - a.g.d);
      for (const { p, g, t } of items) {
        const op = p.fresh ? 1 : 0.4;
        if (p.kind === "o") {
          s += `<rect x="${g.x - r0 * 0.6}" y="${g.y - r0 * 0.6}" width="${r0 * 1.2}" height="${r0 * 1.2}" fill="#f0b429" stroke="#000" stroke-width="${r0 * 0.14}" opacity="${op}"/>`;
          continue;
        }
        const c = color(p.tag);
        s += `<g opacity="${op}"><ellipse cx="${g.x}" cy="${g.y}" rx="3" ry="${(3 * se).toFixed(1)}" fill="${c}" fill-opacity=".35"/>
          <line x1="${g.x}" y1="${g.y}" x2="${t.x}" y2="${t.y}" stroke="${c}" stroke-width="0.7" stroke-dasharray="1.5 1.5"/>
          <circle cx="${t.x}" cy="${t.y}" r="${r0}" fill="${c}" stroke="#000" stroke-width="${r0 * 0.2}"/>
          <text x="${t.x + r0 + 1.5}" y="${t.y - fs * 0.15}" fill="#dbe4ec" font-size="${fs}" ${lhalo}>${esc(p.label)}</text>
          <text x="${t.x + r0 + 1.5}" y="${t.y + fs * 0.85}" fill="#9fe8bd" font-size="${(fs * 0.85).toFixed(2)}" ${lhalo}>${hTxt(p)}</text></g>`;
      }
      if (V.msg) s += `<text x="0" y="58" fill="#9fe8bd" font-size="9" text-anchor="middle" ${halo}>${esc(V.msg)}</text>`;
      fg.innerHTML = s;
      if (info) info.textContent = `wysokość do ${hMax} m`;
    }
    svg.addEventListener("pointerdown", (e) => {
      V.drag = { x: e.clientX, y: e.clientY, az: V.az, el: V.el };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
      if (!V.drag) return;
      V.az = (V.drag.az + (e.clientX - V.drag.x) * 0.5 + 360) % 360;  // scena idzie za ruchem ręki
      V.el = Math.min(85, Math.max(8, V.drag.el + (e.clientY - V.drag.y) * 0.3));
      draw();
    });
    const end = () => { V.drag = null; };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    draw();
    return {
      set(pts, scale, msg) { Object.assign(V, { pts, scale, msg }); draw(); },
      setMap(me, layer) { Object.assign(V, { me, layer }); draw(); },
    };
  }

  // karta główna wysyła każdy stan radaru; karta z pełnym widokiem po otwarciu prosi o ostatni stan
  let chan = null, lastState = null;
  function share(name, st) {
    if (!("BroadcastChannel" in window)) return;
    if (!chan) {
      chan = new BroadcastChannel(name);
      chan.onmessage = (e) => { if (e.data === "hello" && lastState) chan.postMessage(lastState); };
      setInterval(() => lastState && chan.postMessage(lastState), 3000);  // znak życia, gdy nic się nie zmienia
    }
    lastState = { ...st, v: VERSION, at: Date.now() };
    chan.postMessage(lastState);
  }

  return { VERSION, pickScale, fitRadar, mapInto, radar, view3d, share, distText };
})();
