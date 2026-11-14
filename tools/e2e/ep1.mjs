// Headless playthrough of Episode 1 via Title → Studio.
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
const skip = async () => { for (let i = 0; i < 40 && await g(() => !!document.querySelector('.dialogue')); i++) { await page.keyboard.press('Escape'); await wait(80); } };
const tp = (tx, ty) => g((tx, ty) => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(tx * 16 + 8, (ty + 1) * 16); s.avatar.pbody.setVelocity(0, 0); }, tx, ty);
const room = () => g(() => { const s = window.__qublox.scene.getScene('game'); return `${s.levelKey} [${s.avatar.members.map(m => m.def.id)}]`; });
const press = async k => { await page.keyboard.press(k); await wait(120); };
const swapTo = async id => { const i = await g(id => window.__qublox.scene.getScene('game').avatar.members.findIndex(m => m.def.id === id), id); if (i >= 0) await press(String(i + 1)); };
const toExit = async () => { const e = await g(() => window.__qublox.scene.getScene('game').level.entities.find(e => e.kind === 'X')); await tp(e.tx, e.ty); await wait(900); await skip(); };
const R = {};

await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await wait(1200);
await press('Enter'); await wait(500); await press('ArrowDown'); await press('Enter'); await wait(500);   // Title → Story → EP1
R.studio = await g(() => [...document.querySelectorAll('.studio-card[aria-selected="true"] .studio-name')].map(e => e.textContent));
await page.screenshot({ path: `${out}/30-studio.png` });
await press('Enter'); await wait(2500); await skip();
R.r01 = await room();
R.vents = await g(() => window.__qublox.scene.getScene('game').vents.length);
await swapTo('tushar'); await tp(17, 13); await press('k'); await wait(150);
R.ventsFrozen = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.vents.filter(v => v.frozenUntil > s.time.now).length; });
await page.screenshot({ path: `${out}/31-ep1-r01.png` });
await toExit();

R.r02 = await room();
const cw = await g(() => { const c = window.__qublox.scene.getScene('game').crumbly[0]; return { x: c.spr.x, y: c.spr.y }; });
await g(c => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(c.x, c.y - 9); s.avatar.pbody.setVelocity(0, 0); }, cw);
await wait(900);
R.catwalkAfterStand = await g(() => window.__qublox.scene.getScene('game').crumbly[0].state);
await toExit();

R.r03 = await room();
await g(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.hit(999, 0); });
await wait(1600); await skip(); await wait(300);
R.r03party = await room();
await g(() => { const s = window.__qublox.scene.getScene('game'); s.setCrumbly(s.crumbly[0], 'broken', s.time.now); });
await swapTo('sehaj'); await tp(41, 13); await press('k'); await wait(200);
R.ctrlzRebuilt = await g(() => window.__qublox.scene.getScene('game').crumbly[0].state);
await page.screenshot({ path: `${out}/32-ep1-r03.png` });
await toExit();

R.r04 = await room();
await tp(36, 13); await wait(600);
R.windVx = await g(() => Math.round(window.__qublox.scene.getScene('game').avatar.pbody.velocity.x));
await g(() => { const s = window.__qublox.scene.getScene('game'); for (const w of s.winds) w.frozenUntil = s.time.now + 3000; }); await tp(36, 13); await wait(400);
R.windVxFrozen = await g(() => Math.round(window.__qublox.scene.getScene('game').avatar.pbody.velocity.x));
await toExit();

R.r05 = await room();
const kb = await g(() => { const c = window.__qublox.scene.getScene('game').crumbly[0]; return { x: c.spr.x, y: c.spr.y }; });
await g(c => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(c.x, c.y - 9); s.avatar.pbody.setVelocity(0, 0); }, kb);
await wait(1600);
R.cacheGone = await g(() => window.__qublox.scene.getScene('game').crumbly[0].state);
await wait(3300);
R.cacheBack = await g(() => window.__qublox.scene.getScene('game').crumbly[0].state);
await toExit();

R.r06 = await room();
await wait(600);
const waves = [];
for (let i = 0; i < 4; i++) {
  waves.push(await g(() => { const s = window.__qublox.scene.getScene('game'); return `w${s.wave}:${s.liveEnemies().length}`; }));
  await g(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.hit(999, 0); });
  await wait(1500);
}
R.waves = waves.join(' ');
R.waveDoorOpen = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'wave').open);
await toExit();

R.r07 = await room();
await skip(); await wait(500); await skip(); await wait(2500);
R.boss = await g(() => { const b = window.__qublox.scene.getScene('game').boss; return `${b.title}:${b.mode}`; });
await swapTo('sehaj'); await wait(4000);
await g(() => { const s = window.__qublox.scene.getScene('game'); s.foeShot(s.avatar.x + 50, s.avatar.y - 20, -40, 0, 'lag-spike', 12, 'boss', 0); });
await press('k'); await wait(80);
R.reflected = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.shots.getChildren().filter(x => x.getData('kind') === 'rewind').length; });
await g(() => window.__qublox.scene.getScene('game').boss.hit(150, 0)); await wait(200);
R.shield = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
await page.screenshot({ path: `${out}/33-ep1-boss.png` });
await swapTo('ashwath'); await tp(3, 13); await wait(300); await press('k'); await wait(200);
R.shieldAfterHack = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
await g(() => { const b = window.__qublox.scene.getScene('game').boss; b.dropShield(); b.hit(9999, 0); });
await wait(2600); await skip(); await wait(900);
R.results = await g(() => document.querySelector('.results-stats')?.textContent ?? null);
console.log(JSON.stringify(R, null, 1));
console.log(logs.join('\n') || 'no errors');
await browser.close();
