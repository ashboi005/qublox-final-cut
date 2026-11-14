import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173';
const out = process.argv[2] ?? 'tools/e2e/shots';
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const logs = []; page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !m.text().includes('GL Driver')) logs.push(m.text()); }); page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
const wait = ms => new Promise(r => setTimeout(r, ms));
const g = (fn, ...a) => page.evaluate(fn, ...a);
const skip = async () => { for (let i = 0; i < 40 && await g(() => !!document.querySelector('.dialogue')); i++) { await page.keyboard.press('Escape'); await wait(90); } };
const tp = (tx, ty) => g((tx, ty) => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(tx * 16 + 8, (ty + 1) * 16); s.avatar.pbody.setVelocity(0, 0); }, tx, ty);
const room = () => g(() => { const s = window.__qublox.scene.getScene('game'); return `${s.levelKey} [${s.avatar.members.map(m => m.def.id)}]`; });
const toExit = async () => { const e = await g(() => { const s = window.__qublox.scene.getScene('game'); return { ...s.level.entities.find(e => e.kind === 'X'), key: s.levelKey }; }); await tp(e.tx, e.ty); for (let i = 0; i < 30; i++) { await wait(150); if (await g(k => window.__qublox.scene.getScene('game').levelKey !== k && !window.__qublox.scene.getScene('game').leaving, e.key)) break; } await wait(300); await skip(); };
const clearWaves = async () => { for (let i = 0; i < 4; i++) { await wait(500); await g(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.hit(999, 0); }); await wait(1300); } };
const R = {};
try {
  // Title → Story → EP4 → Studio (pick 4) → play
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await wait(1200);
  await page.keyboard.press('Enter'); await wait(500);   // Title → Story
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter'); await wait(500);
  R.studio = await g(() => [...document.querySelectorAll('.studio-card[aria-selected="true"] .studio-name')].map(e => e.textContent).join(','));
  await page.keyboard.press('Enter'); await wait(2500); await skip();
  for (const k of ['r01', 'r02', 'r03', 'r04']) { R[k] = await room(); await toExit(); }
  R.r05 = await room(); await clearWaves(); R.r05door = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'wave').open); await toExit();
  R.r06 = await room(); await clearWaves(); R.r06door = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'wave').open); await toExit();
  R.r07 = await room();
  await skip(); await wait(400); await skip(); await wait(2500);
  R.boss = await g(() => { const b = window.__qublox.scene.getScene('game').boss; return `${b.title}:${b.mode}:phase${b.phase}`; });
  await g(() => window.__qublox.scene.getScene('game').boss.hit(230, 0)); await wait(300);
  R.shield1 = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
  await wait(800);
  R.beigeHud = await g(() => !!document.querySelector('.hud.is-beige'));
  await page.screenshot({ path: `${out}/60-ep4-beige.png` });
  await g(() => { const s = window.__qublox.scene.getScene('game'); s.style.meter = 70; });
  await wait(400);
  R.afterStyle = await g(() => { const b = window.__qublox.scene.getScene('game').boss; return `shielded=${b.shielded} phase=${b.phase}`; });
  await g(() => { const b = window.__qublox.scene.getScene('game').boss; b.mode = 'stunned'; b.hit(400, 0); }); await wait(300);
  R.shield2 = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
  await g(() => { const s = window.__qublox.scene.getScene('game'); s.style.meter = 90; }); await wait(400);
  R.phase3 = await g(() => window.__qublox.scene.getScene('game').boss.phase);
  await page.screenshot({ path: `${out}/61-ep4-phase3.png` });
  await g(() => { const b = window.__qublox.scene.getScene('game').boss; b.mode = 'stunned'; b.hit(9999, 0); });
  await wait(2800); await skip(); await wait(1200);
  R.credits = await g(() => document.querySelectorAll('.credits-line').length);
  await page.screenshot({ path: `${out}/62-credits.png` });
  await wait(1500); await page.keyboard.press('Enter'); await wait(800);
  R.results = await g(() => document.querySelector('.results-stats')?.textContent ?? null);
  R.headline = await g(() => document.querySelector('.results-paper b')?.textContent ?? null);
  await page.screenshot({ path: `${out}/63-final-results.png` });
} catch (e) { R.ERROR = String(e.message).slice(0, 200); }
console.log(JSON.stringify(R, null, 1));
console.log(logs.join('\n') || 'no errors');
await browser.close();
