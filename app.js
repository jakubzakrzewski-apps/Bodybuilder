'use strict';

/* ---------- dane ---------- */

const KEY = 'trening.v1';
const GROUPS = ['Klatka', 'Plecy', 'Nogi', 'Barki', 'Biceps', 'Triceps', 'Brzuch', 'Inne'];
// filtry w zakładce Ćwiczenia: [grupa, etykieta]
const FILTERS = [['', 'Wszystko'], ['Brzuch', 'Brzuch'], ['Klatka', 'Klatka piersiowa'], ['Nogi', 'Nogi'],
  ['Biceps', 'Biceps'], ['Triceps', 'Triceps'], ['Barki', 'Barki'], ['Plecy', 'Plecy']];
const REST_OPTIONS = [0, 60, 90, 120, 150, 180, 240];
// [nazwa, partia, zdjęcia w img/] — zdjęcia z free-exercise-db (public domain)
const DEFAULT_EXERCISES = [
  ['Wyciskanie sztangi leżąc', 'Klatka', 'barbell-bench-press---medium-grip'],
  ['Wyciskanie hantli na skosie', 'Klatka', 'incline-dumbbell-press'],
  ['Rozpiętki na bramie', 'Klatka', 'cable-crossover'],
  ['Pompki na poręczach', 'Klatka', 'dips---chest-version'],
  ['Podciąganie', 'Plecy', 'pullups'],
  ['Wiosłowanie sztangą', 'Plecy', 'bent-over-barbell-row'],
  ['Wiosłowanie hantlem', 'Plecy', 'one-arm-dumbbell-row'],
  ['Ściąganie drążka wyciągu', 'Plecy', 'wide-grip-lat-pulldown'],
  ['Wiosłowanie na wyciągu siedząc', 'Plecy', 'seated-cable-rows'],
  ['Przysiad ze sztangą', 'Nogi', 'barbell-full-squat'],
  ['Martwy ciąg', 'Nogi', 'barbell-deadlift'],
  ['Martwy ciąg rumuński', 'Nogi', 'romanian-deadlift'],
  ['Prasa nóg', 'Nogi', 'leg-press'],
  ['Wykroki z hantlami', 'Nogi', 'dumbbell-lunges'],
  ['Uginanie nóg leżąc', 'Nogi', 'lying-leg-curls'],
  ['Prostowanie nóg siedząc', 'Nogi', 'leg-extensions'],
  ['Hip thrust', 'Nogi', 'barbell-hip-thrust'],
  ['Wspięcia na palce', 'Nogi', 'standing-calf-raises'],
  ['Wyciskanie żołnierskie', 'Barki', 'standing-military-press'],
  ['Wyciskanie hantli nad głowę', 'Barki', 'dumbbell-shoulder-press'],
  ['Wznosy bokiem', 'Barki', 'side-lateral-raise'],
  ['Face pull', 'Barki', 'face-pull'],
  ['Uginanie ramion ze sztangą', 'Biceps', 'barbell-curl'],
  ['Uginanie ramion z hantlami', 'Biceps', 'dumbbell-bicep-curl'],
  ['Uginanie młotkowe', 'Biceps', 'hammer-curls'],
  ['Prostowanie ramion na wyciągu', 'Triceps', 'triceps-pushdown'],
  ['Wyciskanie francuskie', 'Triceps', 'ez-bar-skullcrusher'],
  ['Prostowanie ramienia z hantlem nad głową', 'Triceps', 'standing-dumbbell-triceps-extension'],
  ['Unoszenie nóg w zwisie', 'Brzuch', 'hanging-leg-raise'],
  ['Allahy na wyciągu', 'Brzuch', 'cable-crunch'],
  ['Brzuszki', 'Brzuch', 'crunches'],
];
// filmy z techniką (ID z YouTube), klucz = nazwa zdjęcia ćwiczenia
const VIDEOS = {
  'barbell-bench-press---medium-grip': '8_33og5lN-Y',
  'incline-dumbbell-press': 'UGxPA-XMQRI',
  'cable-crossover': 'h4_TUmraj-4',
  'dips---chest-version': 'hiAvKCpOWdg',
  'pullups': 'jxQ6lKiVfuo',
  'bent-over-barbell-row': 'MOlDmANU_4U',
  'one-arm-dumbbell-row': 'vR61_1Js4Wg',
  'wide-grip-lat-pulldown': 'D7zI8jGWiDI',
  'seated-cable-rows': 'Wn0NcvPV1Ks',
  'barbell-full-squat': 'aX7aE0meWcY',
  'barbell-deadlift': 'QRWtL7_Zj84',
  'romanian-deadlift': 'F5-KQs5NqZY',
  'leg-press': '-w1u2DtnPHo',
  'dumbbell-lunges': '_kE05bfLrUQ',
  'lying-leg-curls': 'ydlYURAFobg',
  'leg-extensions': 'gjVh7w6-5hs',
  'barbell-hip-thrust': 'ezEQkeQWMPM',
  'standing-calf-raises': 'Yz_KagQ5b3Q',
  'standing-military-press': '3g4BKPw9R1Q',
  'dumbbell-shoulder-press': 'pmYAOPpEyw0',
  'side-lateral-raise': '5g5U2dIoeQ0',
  'face-pull': 'foz3Le39glE',
  'barbell-curl': 'rOY9-_qysgc',
  'dumbbell-bicep-curl': 'xo-A8A8SH1U',
  'hammer-curls': 'F4ejmKjjaNE',
  'triceps-pushdown': 'sAvmhbGzkSk',
  'ez-bar-skullcrusher': 'TJkoGDIdRYk',
  'standing-dumbbell-triceps-extension': 'bWY7OQ8nxhQ',
  'hanging-leg-raise': 'IE9a5gtEs7c',
  'cable-crunch': 'pPztC5WDZqk',
  'crunches': 'YwjryOaK6KQ',
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function freshState() {
  return {
    v: 1,
    exercises: DEFAULT_EXERCISES.map(([name, group, img]) => ({ id: uid(), name, group, img, rest: 120 })),
    workouts: [],   // zakończone, od najnowszego
    active: null,   // trening w toku
    rest: null,     // { end, total } — licznik przerwy
  };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.exercises) && Array.isArray(s.workouts)) return s;
  } catch {}
  return freshState();
}

// starsze dane: dopisz zdjęcia i nowe partie (Ramiona → Biceps/Triceps), dodaj brakujące ćwiczenia z bazy
function migrate(s) {
  for (const [name, group, img] of DEFAULT_EXERCISES) {
    const ex = s.exercises.find((e) => e.name === name);
    if (ex) Object.assign(ex, { group, img });
    else s.exercises.push({ id: uid(), name, group, img, rest: 120 });
  }
  for (const ex of s.exercises) if (!GROUPS.includes(ex.group)) ex.group = 'Inne';
  return s;
}

let S = migrate(load());
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

const ui = { tab: 'workout', view: null, q: '', group: '', pickMode: 'browse', nxGroup: 'Inne', onOk: null };

/* ---------- pomocnicze ---------- */

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const exById = (id) => S.exercises.find((e) => e.id === id);
const exName = (id) => exById(id)?.name ?? 'Usunięte ćwiczenie';
const NUM = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
const fmtNum = (n) => NUM.format(n);
const DAY = new Intl.DateTimeFormat('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
const DAY_LONG = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const MONTH = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// polska odmiana: 1 seria, 2 serie, 5 serii
function plural(n, one, few, many) {
  const d = n % 10, t = n % 100;
  return `${n} ${n === 1 ? one : d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many}`;
}

function parseNum(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function parseInt0(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function clock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
function fmtDur(ms) {
  const m = Math.round(ms / 60000), h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
const e1rm = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30)); // wzór Epleya
const volume = (w) => w.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.kg * s.reps, 0), 0);
const countSets = (w) => w.exercises.reduce((a, e) => a + e.sets.length, 0);
const setText = (s) => `${fmtNum(s.kg)} kg × ${s.reps}`;

function weekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}
function defaultName() {
  const h = new Date().getHours();
  return h < 12 ? 'Trening poranny' : h < 18 ? 'Trening popołudniowy' : 'Trening wieczorny';
}

// serie z ostatniego zakończonego treningu z danym ćwiczeniem
function prevSets(exId) {
  for (const w of S.workouts) {
    const e = w.exercises.find((x) => x.exId === exId);
    if (e) return e.sets;
  }
  return null;
}
// podpowiedź dla serii: wynik z zeszłego razu, a jak go brak — poprzednia seria z dzisiaj
function hint(entry, j, prev) {
  if (prev?.[j]) return prev[j];
  const before = entry.sets[j - 1];
  return before && before.reps ? { kg: before.kg ?? 0, reps: before.reps } : null;
}
function sessionsOf(exId) {
  const out = [];
  for (const w of S.workouts) {
    const e = w.exercises.find((x) => x.exId === exId);
    if (e) out.push({ w, sets: e.sets });
  }
  return out;
}

/* ---------- widoki ---------- */

const bar = (inner) => `<header class="bar">${inner}</header>`;

function viewHome() {
  const ws = weekStart();
  const week = S.workouts.filter((w) => w.start >= ws);
  const recent = S.workouts.slice(0, 8);
  return `
    ${bar(`<img class="logo" src="icons/logo.png" alt=""><h1>Trening</h1>`)}
    <div class="hero">
      <div class="label">Objętość w tym tygodniu</div>
      <div class="big">${fmtNum(Math.round(week.reduce((a, w) => a + volume(w), 0)))}<small>kg</small></div>
    </div>
    <div class="stats">
      <div><div class="label">Treningi</div><div class="v">${week.length}</div></div>
      <div><div class="label">Serie</div><div class="v">${week.reduce((a, w) => a + countSets(w), 0)}</div></div>
      <div><div class="label">Czas</div><div class="v">${fmtDur(week.reduce((a, w) => a + (w.end - w.start), 0))}</div></div>
    </div>
    <div class="pad"><button class="btn primary block" data-act="start">Rozpocznij pusty trening</button></div>
    <h2 class="section">Powtórz trening</h2>
    ${recent.length
      ? `<ul class="list">${recent.map((w) => `
          <li class="row" data-act="repeat" data-id="${w.id}">
            <div class="main"><div class="t">${esc(w.name)}</div>
            <div class="s">${DAY.format(w.start)} · ${w.exercises.map((e) => esc(exName(e.exId))).join(', ')}</div></div>
            <span class="chev">›</span>
          </li>`).join('')}</ul>`
      : `<p class="empty">Tu pojawią się twoje ostatnie treningi. Następnym razem powtórzysz je jednym kliknięciem.</p>`}`;
}

function viewActive() {
  const w = S.active;
  return `
    ${bar(`
      <input class="title-input" data-f="wname" value="${esc(w.name)}" enterkeyhint="done" aria-label="Nazwa treningu">
      <span class="elapsed" id="elapsed">${clock(Date.now() - w.start)}</span>
      <button class="btn primary sm" data-act="finish">Zakończ</button>`)}
    ${w.exercises.length ? w.exercises.map(exBlock).join('') : `<p class="empty">Dodaj pierwsze ćwiczenie.</p>`}
    <div class="pad stack">
      <button class="btn block" data-act="add-ex">+ Dodaj ćwiczenie</button>
      <button class="btn ghost danger block" data-act="cancel">Anuluj trening</button>
    </div>`;
}

function exBlock(entry, i) {
  const ex = exById(entry.exId);
  const prev = prevSets(entry.exId);
  return `
    <section class="ex">
      <div class="ex-head">
        <button class="ex-name" data-act="ex-open" data-id="${entry.exId}">${esc(ex.name)}</button>
        <button class="icon" data-act="ex-menu" data-ei="${i}" aria-label="Opcje">⋮</button>
      </div>
      <div class="ex-note">Przerwa ${ex.rest ? clock(ex.rest * 1000) : 'wyłączona'}</div>
      <div class="grid head"><span>Seria</span><span>Poprzednio</span><span>kg</span><span>Powt.</span><span></span></div>
      ${entry.sets.map((s, j) => {
        const p = prev?.[j], h = hint(entry, j, prev);
        return `
        <div class="grid set${s.done ? ' done' : ''}" data-ei="${i}" data-si="${j}">
          <span class="n">${j + 1}</span>
          <span class="prev" data-act="fill-prev">${p ? `${fmtNum(p.kg)} × ${p.reps}` : '—'}</span>
          <input data-f="kg" inputmode="decimal" autocomplete="off" value="${s.kg == null ? '' : fmtNum(s.kg)}" placeholder="${h ? fmtNum(h.kg) : ''}" aria-label="Ciężar">
          <input data-f="reps" inputmode="numeric" autocomplete="off" value="${s.reps ?? ''}" placeholder="${h ? h.reps : ''}" aria-label="Powtórzenia">
          <button class="check" data-act="toggle" aria-label="Zalicz serię"></button>
        </div>`;
      }).join('')}
      <button class="add-set" data-act="add-set" data-ei="${i}">+ Dodaj serię</button>
    </section>`;
}

function viewHistory() {
  if (!S.workouts.length) {
    return `${bar(`<h1>Historia</h1><button class="link" data-act="data-menu">Dane</button>`)}
      <p class="empty">Brak zapisanych treningów.</p>`;
  }
  let html = '', month = '';
  for (const w of S.workouts) {
    const m = cap(MONTH.format(w.start));
    if (m !== month) {
      if (month) html += '</ul>';
      html += `<h2 class="section">${m}</h2><ul class="list">`;
      month = m;
    }
    html += `
      <li class="row" data-act="open-w" data-id="${w.id}">
        <div class="main"><div class="t">${esc(w.name)}</div>
        <div class="s">${DAY.format(w.start)} · ${fmtDur(w.end - w.start)} · ${plural(countSets(w), 'seria', 'serie', 'serii')}</div></div>
        <div class="r">${fmtNum(Math.round(volume(w)))} kg</div>
      </li>`;
  }
  return `${bar(`<h1>Historia</h1><button class="link" data-act="data-menu">Dane</button>`)}${html}</ul>`;
}

function viewExercises() {
  return `
    ${bar(`<h1>Ćwiczenia</h1><button class="link" data-act="new-ex">+ Nowe</button>`)}
    <input class="search" data-f="q" type="search" placeholder="Szukaj" value="${esc(ui.q)}" autocomplete="off">
    <div class="filters" id="filters">${filterChips()}</div>
    <ul id="ex-list">${exListHTML('ex-open')}</ul>`;
}

const filterChips = () => FILTERS.map(([g, label]) =>
  `<button class="chip${ui.group === g ? ' on' : ''}" data-act="filter" data-g="${g}">${label}</button>`).join('');

const thumb = (ex) => ex.img
  ? `<img class="thumb" src="img/${ex.img}-t.jpg" alt="" loading="lazy">`
  : `<span class="thumb">${esc(ex.name.charAt(0).toUpperCase())}</span>`;

function exListHTML(act) {
  const q = norm(ui.q);
  const words = q.split(/\s+/).filter(Boolean);
  const items = S.exercises
    .filter((e) => !ui.group || e.group === ui.group)
    .filter((e) => words.every((w) => norm(e.name).includes(w)))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  let html = items.map((e) => {
    const n = sessionsOf(e.id).length;
    return `
      <li class="row" data-act="${act}" data-id="${e.id}">
        ${thumb(e)}
        <div class="main"><div class="t">${esc(e.name)}</div><div class="s">${esc(e.group)}${n ? ` · ${n} tren.` : ''}</div></div>
        <span class="chev">›</span>
      </li>`;
  }).join('');
  if (q && !S.exercises.some((e) => norm(e.name) === q)) {
    html += `<li class="row" data-act="create-q"><div class="main"><div class="t">+ Utwórz „${esc(ui.q.trim())}”</div><div class="s">Nowe ćwiczenie</div></div></li>`;
  }
  return html || '<li class="empty">Brak ćwiczeń w tej partii.</li>';
}

function refreshList() {
  const pick = $('#pick-list');
  if (pick) pick.innerHTML = exListHTML('pick');
  const list = $('#ex-list');
  if (list) list.innerHTML = exListHTML('ex-open');
}

function chart(values) {
  if (values.length < 2) return '';
  const W = 300, H = 100;
  const mn = Math.min(...values), mx = Math.max(...values), r = mx - mn || 1;
  const pts = values.map((v, i) => `${(i * W / (values.length - 1)).toFixed(1)} ${(H - 8 - ((v - mn) / r) * (H - 16)).toFixed(1)}`);
  return `
    <h2 class="section">Szacowany 1RM w czasie</h2>
    <div style="padding:0 16px">
      <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <line x1="0" y1="${H - 0.5}" x2="${W}" y2="${H - 0.5}"/><path class="l" d="M${pts.join('L')}"/>
      </svg>
    </div>`;
}

function viewExercise({ id }) {
  const ex = exById(id);
  const sessions = sessionsOf(id);
  const all = sessions.flatMap((s) => s.sets);
  const best1rm = all.reduce((a, s) => Math.max(a, e1rm(s.kg, s.reps)), 0);
  const maxKg = all.reduce((a, s) => Math.max(a, s.kg), 0);
  const series = sessions.map((s) => Math.max(...s.sets.map((x) => e1rm(x.kg, x.reps)))).reverse();
  const inUse = S.active?.exercises.some((e) => e.exId === id);
  return `
    ${bar(`<button class="back" data-act="back" aria-label="Wstecz">‹</button><h1>${esc(ex.name)}</h1>`)}
    ${ex.img ? `<div class="photo"><img src="img/${ex.img}.jpg" alt="${esc(ex.name)}"></div>` : ''}
    <div class="hero">
      <div class="label">Szacowany maks. ciężar na 1 powtórzenie</div>
      <div class="big">${best1rm ? `${fmtNum(Math.round(best1rm * 10) / 10)}<small>kg</small>` : '—'}</div>
    </div>
    <div class="stats">
      <div><div class="label">Maks. ciężar</div><div class="v">${maxKg ? fmtNum(maxKg) + ' kg' : '—'}</div></div>
      <div><div class="label">Treningi</div><div class="v">${sessions.length}</div></div>
      <div><div class="label">Partia</div><div class="v">${esc(ex.group)}</div></div>
    </div>
    ${chart(series)}
    <h2 class="section">Historia</h2>
    ${sessions.length
      ? sessions.map(({ w, sets }) => `
        <div class="detail-ex">
          <div class="t">${DAY.format(w.start)} <span style="color:var(--mute);font-weight:400">· ${esc(w.name)}</span></div>
          <div class="sets">${sets.map((s, i) => `<span class="i">${i + 1}</span><span>${setText(s)}</span><span class="e">1RM ${fmtNum(Math.round(e1rm(s.kg, s.reps)))}</span>`).join('')}</div>
        </div>`).join('')
      : `<p class="empty">Jeszcze nie wykonano tego ćwiczenia.</p>`}
    ${!ex.img && !sessions.length && !inUse ? `<div class="pad"><button class="btn ghost danger block" data-act="ex-delete" data-id="${id}">Usuń ćwiczenie</button></div>` : ''}
    ${videoSection(ex)}`;
}

// film z techniką: ładowany z YouTube dopiero po kliknięciu (bez ciasteczek i zbędnego ruchu)
function videoSection(ex) {
  const id = VIDEOS[ex.img];
  if (!id) {
    const q = encodeURIComponent(`${ex.name} technika`);
    return `
      <h2 class="section">Jak wykonać</h2>
      <div class="pad"><a class="btn block" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">Szukaj filmu na YouTube</a></div>`;
  }
  return `
    <h2 class="section">Jak wykonać</h2>
    <div class="video" data-act="play" data-id="${id}">
      <span class="play" aria-hidden="true"></span>
      <span class="video-label">Odtwórz film z YouTube</span>
    </div>`;
}

function viewWorkout(v) {
  const w = S.workouts.find((x) => x.id === v.id);
  if (!w) { ui.view = null; return S.active ? viewActive() : viewHome(); }
  const summary = v.type === 'summary';
  return `
    ${summary
      ? bar(`<h1>Trening zapisany</h1><button class="btn primary sm" data-act="back">Gotowe</button>`)
      : bar(`<button class="back" data-act="back" aria-label="Wstecz">‹</button><h1>${esc(w.name)}</h1>`)}
    <div class="hero">
      <div class="label">${summary ? esc(w.name) + ' · ' : ''}${cap(DAY_LONG.format(w.start))}</div>
      <div class="big">${fmtNum(Math.round(volume(w)))}<small>kg</small></div>
    </div>
    <div class="stats">
      <div><div class="label">Czas</div><div class="v">${fmtDur(w.end - w.start)}</div></div>
      <div><div class="label">Serie</div><div class="v">${countSets(w)}</div></div>
      <div><div class="label">Ćwiczenia</div><div class="v">${w.exercises.length}</div></div>
    </div>
    ${summary && v.prs?.length ? `
      <h2 class="section">Nowe rekordy</h2>
      ${v.prs.map((p) => `<div class="pr-row"><span class="badge">Rekord</span><b>${esc(exName(p.exId))}</b><br><span style="color:var(--mute);font-size:14px">${setText(p)} · 1RM ok. ${fmtNum(Math.round(e1rm(p.kg, p.reps)))} kg</span></div>`).join('')}` : ''}
    <h2 class="section">Ćwiczenia</h2>
    ${w.exercises.map((e) => `
      <div class="detail-ex">
        <div class="t">${esc(exName(e.exId))}</div>
        <div class="sets">${e.sets.map((s, i) => `<span class="i">${i + 1}</span><span>${setText(s)}</span><span class="e">1RM ${fmtNum(Math.round(e1rm(s.kg, s.reps)))}</span>`).join('')}</div>
      </div>`).join('')}
    <div class="pad stack">
      ${!S.active ? `<button class="btn block" data-act="repeat" data-id="${w.id}">Powtórz ten trening</button>` : ''}
      ${!summary ? `<button class="btn ghost danger block" data-act="w-delete" data-id="${w.id}">Usuń trening</button>` : ''}
    </div>`;
}

const VIEWS = { exercise: viewExercise, workout: viewWorkout, summary: viewWorkout };
function render() {
  let html;
  if (ui.view) html = VIEWS[ui.view.type](ui.view);
  else if (ui.tab === 'workout') html = S.active ? viewActive() : viewHome();
  else if (ui.tab === 'history') html = viewHistory();
  else { ui.pickMode = 'browse'; html = viewExercises(); }
  $('#view').innerHTML = html;
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === ui.tab));
  renderBars();
}

function renderBars() {
  const rest = $('#rest'), live = $('#live');
  const onActive = ui.tab === 'workout' && !ui.view && S.active;
  rest.hidden = !S.rest;
  live.hidden = !(S.active && !S.rest && !onActive);
  if (S.rest) {
    rest.innerHTML = `
      <div class="prog" id="rest-prog"></div>
      <span class="lbl">Przerwa</span><span class="time" id="rest-time"></span>
      <button data-act="rest-add" data-d="-15">−15</button>
      <button data-act="rest-add" data-d="15">+15</button>
      <button data-act="rest-skip">Pomiń</button>`;
  }
  if (!live.hidden) {
    live.innerHTML = `<span class="lbl">W toku</span><span class="time" id="live-time"></span><span class="name">${esc(S.active.name)}</span><span>›</span>`;
  }
  document.body.classList.toggle('has-bar', !rest.hidden || !live.hidden);
  tick();
}

/* ---------- timery ---------- */

let actx;
function unlockAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch {}
}
function beep() {
  try {
    if (!actx) return;
    for (const t of [0, 0.25]) {
      const o = actx.createOscillator(), g = actx.createGain(), at = actx.currentTime + t;
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
      o.connect(g).connect(actx.destination);
      o.start(at); o.stop(at + 0.2);
    }
  } catch {}
}

function tick() {
  const now = Date.now();
  if (S.active) {
    const t = clock(now - S.active.start);
    const a = $('#elapsed'); if (a) a.textContent = t;
    const b = $('#live-time'); if (b) b.textContent = t;
  }
  if (S.rest) {
    const left = S.rest.end - now;
    if (left <= 0) {
      const fresh = left > -5000;
      S.rest = null; save();
      if (fresh) { navigator.vibrate?.([200, 100, 200]); beep(); }
      renderBars();
      return;
    }
    const t = $('#rest-time'); if (t) t.textContent = clock(left + 999);
    const p = $('#rest-prog'); if (p) p.style.width = `${Math.min(100, 100 * (1 - left / S.rest.total))}%`;
  }
}
setInterval(tick, 250);

/* ---------- arkusze (bottom sheet) ---------- */

function openSheet(html) {
  const el = $('#sheet');
  el.innerHTML = html;
  el.hidden = false;
}
function closeSheet() {
  const el = $('#sheet');
  el.hidden = true;
  el.innerHTML = '';
  ui.onOk = null;
}
const panel = (title, body) => `
  <div class="panel">
    <div class="panel-head"><h3>${title}</h3><button class="icon" data-act="close" aria-label="Zamknij">×</button></div>
    <div class="panel-body">${body}</div>
  </div>`;

function confirmSheet(title, text, okLabel, onOk, danger = true) {
  openSheet(panel(title, `
    <p class="panel-text">${text}</p>
    <div class="pad stack">
      <button class="btn primary block${danger ? ' danger' : ''}" data-act="ok">${okLabel}</button>
      <button class="btn block" data-act="close">Wróć</button>
    </div>`));
  ui.onOk = onOk;
}

function pickSheet() {
  ui.q = '';
  ui.group = '';
  ui.pickMode = 'add';
  openSheet(panel('Dodaj ćwiczenie', `
    <input class="search" data-f="q" type="search" placeholder="Szukaj" autocomplete="off">
    <div class="filters" id="filters">${filterChips()}</div>
    <ul id="pick-list">${exListHTML('pick')}</ul>`));
}

function exMenuSheet(ei) {
  const entry = S.active.exercises[ei], ex = exById(entry.exId);
  const n = S.active.exercises.length;
  openSheet(panel(esc(ex.name), `
    <div class="field"><span>Przerwa po serii</span></div>
    <div class="chips" style="padding-top:0">${REST_OPTIONS.map((s) => `
      <button class="chip${ex.rest === s ? ' on' : ''}" data-act="rest-set" data-ei="${ei}" data-s="${s}">${s ? clock(s * 1000) : 'Wył.'}</button>`).join('')}
    </div>
    <div style="height:12px"></div>
    ${entry.sets.length > 1 ? `<button class="opt" data-act="set-del-last" data-ei="${ei}">Usuń ostatnią serię</button>` : ''}
    ${ei > 0 ? `<button class="opt" data-act="ex-move" data-ei="${ei}" data-d="-1">Przesuń wyżej</button>` : ''}
    ${ei < n - 1 ? `<button class="opt" data-act="ex-move" data-ei="${ei}" data-d="1">Przesuń niżej</button>` : ''}
    <button class="opt danger" data-act="ex-remove" data-ei="${ei}">Usuń z treningu</button>`));
}

function newExSheet(name = '') {
  ui.nxGroup = ui.group || 'Inne';
  openSheet(panel('Nowe ćwiczenie', `
    <label class="field"><span>Nazwa</span><input id="nx-name" value="${esc(name)}" maxlength="60" autocomplete="off"></label>
    <div class="field"><span>Partia</span></div>
    <div class="chips" id="nx-groups" style="padding-top:0">${groupChips()}</div>
    <div class="pad"><button class="btn primary block" data-act="nx-save">Zapisz</button></div>`));
  const input = $('#nx-name');
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}
const groupChips = () => GROUPS.map((g) => `<button class="chip${g === ui.nxGroup ? ' on' : ''}" data-act="nx-group" data-g="${g}">${g}</button>`).join('');

function dataSheet() {
  openSheet(panel('Dane', `
    <p class="panel-text" style="color:var(--mute);font-size:14px;padding-bottom:12px">Dane są zapisane tylko na tym urządzeniu. Rób kopię co jakiś czas.</p>
    <button class="opt" data-act="export">Eksportuj kopię (JSON)</button>
    <button class="opt" data-act="import">Importuj kopię</button>`));
}

/* ---------- akcje ---------- */

function newEntry(exId, n) {
  n = n || prevSets(exId)?.length || 3;
  return { exId, sets: Array.from({ length: n }, () => ({ kg: null, reps: null, done: false })) };
}

function startWorkout(name, exercises = []) {
  S.active = { id: uid(), name, start: Date.now(), exercises: exercises.map((e) => newEntry(e.exId, e.sets.length)) };
  save();
  ui.tab = 'workout';
  ui.view = null;
  render();
  scrollTo(0, 0);
}

function discardWorkout() {
  S.active = null;
  S.rest = null;
  save();
  closeSheet();
  render();
  scrollTo(0, 0);
}

function findPRs(w) {
  const out = [];
  for (const e of w.exercises) {
    const history = sessionsOf(e.exId).flatMap((s) => s.sets);
    if (!history.length) continue; // pierwszy raz to jeszcze nie rekord
    const prevBest = history.reduce((a, s) => Math.max(a, e1rm(s.kg, s.reps)), 0);
    const best = e.sets.reduce((b, s) => (e1rm(s.kg, s.reps) > e1rm(b.kg, b.reps) ? s : b));
    if (e1rm(best.kg, best.reps) > prevBest + 0.01) out.push({ exId: e.exId, kg: best.kg, reps: best.reps });
  }
  return out;
}

function commitFinish() {
  const a = S.active;
  const w = {
    id: a.id, name: a.name.trim() || defaultName(), start: a.start, end: Date.now(),
    exercises: a.exercises
      .map((e) => ({ exId: e.exId, sets: e.sets.filter((s) => s.done).map(({ kg, reps }) => ({ kg, reps })) }))
      .filter((e) => e.sets.length),
  };
  const prs = findPRs(w);
  S.workouts.unshift(w);
  S.active = null;
  S.rest = null;
  save();
  closeSheet();
  ui.view = { type: 'summary', id: w.id, prs };
  render();
  scrollTo(0, 0);
}

function shake(row) {
  row.classList.remove('shake');
  void row.offsetWidth;
  row.classList.add('shake');
}

function setRef(el) {
  const row = el.closest('.set');
  const entry = S.active.exercises[+row.dataset.ei];
  return { row, entry, j: +row.dataset.si, s: entry.sets[+row.dataset.si] };
}

const actions = {
  tab(el) {
    ui.tab = el.dataset.tab;
    ui.view = null;
    ui.q = '';
    ui.group = '';
    render();
    scrollTo(0, 0);
  },
  back() {
    ui.view = null;
    render();
    scrollTo(0, 0);
  },
  'go-active'() { actions.tab({ dataset: { tab: 'workout' } }); },

  start() { startWorkout(defaultName()); },
  repeat(el) {
    const w = S.workouts.find((x) => x.id === el.dataset.id);
    if (w && !S.active) startWorkout(w.name, w.exercises.filter((e) => exById(e.exId)));
  },
  finish() {
    const all = S.active.exercises.flatMap((e) => e.sets);
    const done = all.filter((s) => s.done).length;
    if (!done) {
      return confirmSheet('Brak zaliczonych serii', 'Żadna seria nie jest zaliczona, więc nie ma czego zapisać. Odrzucić ten trening?', 'Odrzuć trening', discardWorkout);
    }
    const undone = all.length - done;
    confirmSheet('Zakończyć trening?',
      undone ? `Niezaliczone serie (${undone}) nie zostaną zapisane.` : `Zapisane zostaną wszystkie serie (${done}).`,
      'Zakończ i zapisz', commitFinish, false);
  },
  cancel() {
    confirmSheet('Anulować trening?', 'Wszystkie wpisane serie zostaną usunięte.', 'Anuluj trening', discardWorkout);
  },

  toggle(el) {
    const { row, entry, j, s } = setRef(el);
    if (s.done) { s.done = false; save(); render(); return; }
    const h = hint(entry, j, prevSets(entry.exId));
    if (s.reps == null && h) s.reps = h.reps;
    if (s.kg == null && h) s.kg = h.kg;
    if (!s.reps) { shake(row); row.querySelector('[data-f=reps]').focus(); return; }
    if (s.kg == null) s.kg = 0;
    s.done = true;
    unlockAudio();
    const rest = exById(entry.exId).rest;
    S.rest = rest ? { end: Date.now() + rest * 1000, total: rest * 1000 } : null;
    document.activeElement?.blur();
    save();
    render();
  },
  'fill-prev'(el) {
    const { entry, j, s } = setRef(el);
    const p = prevSets(entry.exId)?.[j];
    if (!p || s.done) return;
    s.kg = p.kg;
    s.reps = p.reps;
    save();
    render();
  },
  'add-set'(el) {
    const entry = S.active.exercises[+el.dataset.ei];
    entry.sets.push({ kg: null, reps: null, done: false });
    save();
    render();
  },
  'add-ex'() { pickSheet(); setTimeout(() => $('#sheet .search')?.focus(), 50); },
  pick(el) {
    S.active.exercises.push(newEntry(el.dataset.id));
    save();
    closeSheet();
    render();
    const blocks = document.querySelectorAll('.ex');
    blocks[blocks.length - 1]?.scrollIntoView({ block: 'center' });
  },
  'ex-menu'(el) { exMenuSheet(+el.dataset.ei); },
  'rest-set'(el) {
    const ei = +el.dataset.ei;
    exById(S.active.exercises[ei].exId).rest = +el.dataset.s;
    save();
    render();
    exMenuSheet(ei);
  },
  'set-del-last'(el) {
    S.active.exercises[+el.dataset.ei].sets.pop();
    save(); closeSheet(); render();
  },
  'ex-move'(el) {
    const i = +el.dataset.ei, j = i + +el.dataset.d, list = S.active.exercises;
    [list[i], list[j]] = [list[j], list[i]];
    save(); closeSheet(); render();
  },
  'ex-remove'(el) {
    S.active.exercises.splice(+el.dataset.ei, 1);
    save(); closeSheet(); render();
  },

  'rest-add'(el) {
    const d = +el.dataset.d * 1000;
    S.rest.end += d;
    S.rest.total = Math.max(1000, S.rest.total + d);
    save();
    tick();
  },
  'rest-skip'() { S.rest = null; save(); renderBars(); },

  'open-w'(el) { ui.view = { type: 'workout', id: el.dataset.id }; render(); scrollTo(0, 0); },
  'w-delete'(el) {
    confirmSheet('Usunąć trening?', 'Tego nie da się cofnąć.', 'Usuń trening', () => {
      S.workouts = S.workouts.filter((w) => w.id !== el.dataset.id);
      save(); closeSheet(); ui.view = null; render();
    });
  },

  'ex-open'(el) { closeSheet(); ui.view = { type: 'exercise', id: el.dataset.id }; render(); scrollTo(0, 0); },
  'ex-delete'(el) {
    confirmSheet('Usunąć ćwiczenie?', 'Zniknie z listy ćwiczeń.', 'Usuń', () => {
      S.exercises = S.exercises.filter((e) => e.id !== el.dataset.id);
      save(); closeSheet(); ui.view = null; render();
    });
  },
  play(el) {
    if (!navigator.onLine) {
      el.querySelector('.video-label').textContent = 'Film wymaga internetu';
      return;
    }
    el.removeAttribute('data-act');
    el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0&playsinline=1"
      title="Film z techniką ćwiczenia" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  },
  filter(el) {
    ui.group = el.dataset.g;
    document.querySelectorAll('.filters').forEach((f) => { f.innerHTML = filterChips(); });
    refreshList();
  },
  'new-ex'() { newExSheet(); },
  'create-q'() { newExSheet(ui.q.trim()); },
  'nx-group'(el) { ui.nxGroup = el.dataset.g; $('#nx-groups').innerHTML = groupChips(); },
  'nx-save'() {
    const input = $('#nx-name');
    const name = input.value.trim().replace(/\s+/g, ' ');
    if (!name) { input.focus(); return; }
    let ex = S.exercises.find((e) => norm(e.name) === norm(name));
    if (!ex) {
      ex = { id: uid(), name, group: ui.nxGroup, rest: 120 };
      S.exercises.push(ex);
    }
    if (ui.pickMode === 'add' && S.active) S.active.exercises.push(newEntry(ex.id));
    save();
    closeSheet();
    ui.q = '';
    render();
  },

  'data-menu'() { dataSheet(); },
  export() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trening-kopia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    closeSheet();
  },
  import() { $('#import-file').click(); },

  ok() { ui.onOk?.(); },
  close() { closeSheet(); },
};

document.addEventListener('click', (e) => {
  if (e.target.id === 'sheet') return closeSheet();
  const el = e.target.closest('[data-act]');
  if (el) actions[el.dataset.act]?.(el, e);
});

document.addEventListener('input', (e) => {
  const f = e.target.dataset.f;
  if (!f) return;
  if (f === 'wname') { S.active.name = e.target.value; save(); return; }
  if (f === 'q') { ui.q = e.target.value; refreshList(); return; }
  const { s } = setRef(e.target);
  s[f] = f === 'kg' ? parseNum(e.target.value) : parseInt0(e.target.value);
  save();
});

// Enter w polu kg przeskakuje do powtórzeń, w polu powtórzeń zalicza serię
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const f = e.target.dataset?.f;
  if (f === 'kg') { e.preventDefault(); e.target.closest('.set').querySelector('[data-f=reps]').focus(); }
  else if (f === 'reps') { e.preventDefault(); actions.toggle(e.target); }
  else if (f === 'wname') e.target.blur();
  else if (e.target.id === 'nx-name') actions['nx-save']();
});

$('#import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.exercises) || !Array.isArray(data.workouts)) throw new Error();
    confirmSheet('Zastąpić dane?', `Kopia zawiera ${data.workouts.length} treningów. Obecne dane zostaną zastąpione.`, 'Importuj', () => {
      S = { ...freshState(), ...data };
      save(); closeSheet(); ui.view = null; render();
    });
  } catch {
    confirmSheet('Nie udało się', 'To nie jest poprawna kopia danych z tej aplikacji.', 'OK', closeSheet, false);
  }
});

$('#live').dataset.act = 'go-active';

render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  // pobierz zdjęcia ćwiczeń w tle, żeby działały offline na siłowni
  navigator.serviceWorker.ready.then(() => setTimeout(() => {
    for (const [, , img] of DEFAULT_EXERCISES) {
      for (const f of [`${img}.jpg`, `${img}-t.jpg`]) fetch(`img/${f}`).catch(() => {});
    }
  }, 3000));
}
navigator.storage?.persist?.().catch(() => {});
