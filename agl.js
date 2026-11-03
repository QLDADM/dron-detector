// Wysokość drona nad terenem (AGL): wysokość geodezyjna z Remote ID (nad elipsoidą WGS-84) minus odstęp geoidy
// (EGM2008, siatka co 0,5° dla Polski, błąd interpolacji poniżej 0,4 m) minus wysokość terenu z numerycznego modelu
// terenu GUGiK (services.gugik.gov.pl/nmt, układ PL-1992, wysokości PL-EVRF2007). Bez internetu AGL nie ma -
// strona pokazuje wtedy tylko wysokość z Remote ID. Wysokość terenu pobierana raz na punkt co ok. 25 m.
// Plik jest w dwóch miejscach (static/ i static/phone/) i musi być w obu taki sam.
"use strict";
const RidAgl = (() => {
  // odstęp geoidy EGM2008 [m]: wiersze od 49°N co 0,5°, kolumny od 14°E co 0,5° (GeographicLib GeoidEval)
  const GEOID = [
    [46.92, 46.16, 46.10, 46.69, 45.95, 44.57, 43.32, 42.90, 43.18, 43.31, 43.22, 43.31, 42.95, 41.73, 40.64, 39.33, 38.34, 37.63, 36.47, 34.40, 32.29, 31.81],
    [46.36, 46.01, 45.98, 45.83, 45.81, 45.08, 44.13, 43.40, 43.23, 43.19, 42.50, 41.91, 40.96, 39.58, 38.48, 37.38, 36.24, 34.86, 33.32, 31.86, 31.22, 31.64],
    [45.67, 45.09, 44.45, 44.37, 44.07, 44.13, 43.99, 43.76, 42.55, 42.01, 41.55, 40.80, 39.72, 38.34, 37.05, 35.96, 34.95, 34.07, 32.54, 31.18, 30.67, 31.03],
    [44.44, 44.13, 43.77, 43.90, 43.61, 43.26, 42.26, 41.12, 40.88, 40.84, 40.39, 39.48, 38.44, 37.31, 36.45, 35.58, 34.70, 33.81, 32.55, 30.69, 29.96, 30.11],
    [43.39, 43.33, 42.54, 42.34, 42.12, 41.49, 40.80, 39.81, 39.30, 38.89, 37.97, 37.03, 36.60, 36.50, 35.92, 34.70, 33.77, 32.90, 30.78, 29.55, 29.17, 29.21],
    [42.60, 41.60, 41.03, 40.98, 40.54, 39.87, 39.20, 38.44, 37.61, 36.51, 35.40, 34.67, 34.44, 34.35, 33.96, 33.32, 32.28, 30.99, 29.33, 28.49, 28.15, 28.29],
    [40.79, 40.12, 39.63, 39.33, 38.73, 37.88, 36.97, 36.05, 34.93, 33.77, 33.03, 32.89, 32.49, 32.25, 31.94, 31.24, 30.07, 29.45, 28.85, 28.19, 27.77, 27.52],
    [38.77, 38.20, 37.70, 37.00, 36.11, 35.39, 34.61, 33.64, 32.42, 31.74, 31.63, 31.40, 31.52, 31.56, 30.81, 30.03, 29.19, 28.62, 28.55, 28.22, 27.71, 27.25],
    [37.55, 36.64, 35.85, 35.03, 34.33, 33.89, 33.35, 32.42, 31.19, 30.19, 29.89, 30.19, 30.73, 30.78, 30.48, 29.66, 29.10, 28.51, 28.09, 28.12, 27.97, 27.41],
    [36.74, 35.98, 35.15, 34.62, 34.40, 33.79, 32.61, 31.27, 30.03, 29.19, 29.10, 29.62, 30.23, 30.34, 30.15, 29.55, 29.09, 28.54, 28.09, 27.83, 27.48, 26.98],
    [36.00, 35.50, 35.10, 34.69, 33.81, 32.91, 31.93, 30.96, 30.25, 29.65, 29.32, 29.33, 29.31, 29.15, 28.75, 28.54, 28.25, 27.97, 27.68, 27.26, 26.95, 26.61],
    [35.42, 34.76, 34.68, 34.05, 33.56, 32.95, 32.08, 31.13, 30.37, 29.44, 28.69, 28.38, 28.07, 27.61, 27.11, 26.87, 26.82, 26.74, 26.55, 26.31, 26.11, 25.77],
    [34.75, 34.40, 34.62, 33.92, 33.47, 32.83, 32.04, 31.08, 30.02, 28.89, 27.94, 27.25, 26.79, 26.37, 26.02, 25.76, 25.51, 25.41, 25.28, 25.22, 24.90, 24.75]
  ];
  function geoid(lat, lon) {
    const fi = (lat - 49) / 0.5, fj = (lon - 14) / 0.5, i = Math.floor(fi), j = Math.floor(fj);
    if (i < 0 || j < 0 || i >= GEOID.length - 1 || j >= GEOID[0].length - 1) return null;  // poza Polską
    const a = fi - i, b = fj - j, g = GEOID;
    return g[i][j] * (1 - a) * (1 - b) + g[i][j + 1] * (1 - a) * b + g[i + 1][j] * a * (1 - b) + g[i + 1][j + 1] * a * b;
  }

  // WGS-84 -> PL-1992 (EPSG:2180, odwzorowanie Gaussa-Krügera, GRS80): [X na północ, Y na wschód]
  function pl1992(lat, lon) {
    const a = 6378137, f = 1 / 298.257222101, e2 = f * (2 - f), ep2 = e2 / (1 - e2), k0 = 0.9993, r = Math.PI / 180;
    const phi = lat * r, s = Math.sin(phi), c = Math.cos(phi), t = Math.tan(phi);
    const N = a / Math.sqrt(1 - e2 * s * s), T = t * t, C = ep2 * c * c, A = (lon - 19) * r * c;
    const e4 = e2 * e2, e6 = e4 * e2;
    const M = a * ((1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * phi - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * phi)
      + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * phi) - (35 * e6 / 3072) * Math.sin(6 * phi));
    const y = 500000 + k0 * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5 / 120);
    const x = -5300000 + k0 * (M + N * t * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A ** 4 / 24
      + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6 / 720));
    return [x, y];
  }

  const CELL = 0.00025;  // ~25 m: jeden punkt NMT na kratkę
  const cache = new Map();  // kratka -> wysokość terenu [m] (undefined = w trakcie pobierania)
  let inflight = 0, offlineUntil = 0, changed = () => {}, changeTimer = 0;
  // kilka odpowiedzi GUGiK naraz = jedno odświeżenie strony (inaczej strona migała)
  const notify = () => { if (!changeTimer) changeTimer = setTimeout(() => { changeTimer = 0; changed(); }, 500); };
  const lastGround = new Map();  // dron -> ostatnia znana wysokość terenu pod nim
  function terrain(lat, lon) {
    const k = `${Math.round(lat / CELL)}:${Math.round(lon / CELL)}`;
    if (cache.has(k)) return cache.get(k) ?? null;
    if (Date.now() < offlineUntil || inflight >= 3) return null;
    cache.set(k, undefined);
    inflight++;
    const [x, y] = pl1992(lat, lon);
    fetch(`https://services.gugik.gov.pl/nmt/?request=GetHbyXY&x=${x.toFixed(1)}&y=${y.toFixed(1)}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
      .then((txt) => {
        const h = parseFloat(txt);
        if (Number.isFinite(h) && h > -100) { cache.set(k, h); notify(); } else cache.delete(k);
      })
      .catch(() => { cache.delete(k); offlineUntil = Date.now() + 30000; })  // bez internetu: kolejna próba za 30 s
      .finally(() => { inflight--; });
    return null;
  }

  // wysokość nad terenem [m] albo null (brak internetu, poza Polską, brak wysokości geodezyjnej).
  // id drona: gdy teren pod nową pozycją jeszcze się pobiera, liczymy z ostatniego terenu pod tym dronem -
  // AGL nie znika i nie wraca co chwilę (sąsiednie punkty co 25 m różnią się zwykle o metr, dwa)
  function agl(lat, lon, altGeo, id) {
    if (altGeo == null || !Number.isFinite(altGeo) || lat == null) return null;
    const n = geoid(lat, lon);
    let t = terrain(lat, lon);
    if (id != null) {
      if (t != null) lastGround.set(id, t);
      else t = lastGround.get(id) ?? null;
    }
    return n == null || t == null ? null : altGeo - n - t;
  }

  // wysokość terenu pod dronem; w trakcie pobierania nowej kratki - ostatnia znana pod tym dronem
  function ground(lat, lon, id) {
    const t = lat == null ? null : terrain(lat, lon);
    if (t != null && id != null) lastGround.set(id, t);
    return t ?? (id != null ? lastGround.get(id) ?? null : null);
  }

  return { agl, terrain, ground, onChange(f) { changed = f; } };
})();
