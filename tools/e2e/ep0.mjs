// Headless playthrough of Episode 0: each room's mechanic + transitions + boss.
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
const g = fn => page.evaluate(fn);
const S = `window.__qublox.scene.getScene('game')`;
const skipDialogue = async () => { for (let i = 0; i < 40 && await g(() => !!document.querySelector('.dialogue')); i++) { await page.keyboard.press('Escape'); await wait(80); } };
const tp = (tx, ty) => page.evaluate((tx, ty) => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(tx * 16 + 8, (ty + 1) * 16); s.avatar.pbody.setVelocity(0, 0); }, tx, ty);
const room = () => g(() => { const s = window.__qublox.scene.getScene('game'); return { key: s.levelKey, party: s.avatar.members.map(m => m.def.id).join(','), slot: s.avatar.slot, cut: s.cutscene }; });
const press = async k => { await page.keyboard.press(k); await wait(120); };
const toExit = async () => { const x = await g(() => { const s = window.__qublox.scene.getScene('game'); const e = s.level.entities.find(e => e.kind === 'X'); return e; }); await tp(x.tx, x.ty); await wait(800); };
const swapTo = async id => { const i = await page.evaluate(id => window.__qublox.scene.getScene('game').avatar.members.findIndex(m => m.def.id === id), id); await press(String(i + 1)); };
const R = {};

await page.goto(BASE + '/?level=ep0-r01', { waitUntil: 'networkidle0' });
await wait(1800);
await press('Escape');
R.r01 = await room();
await skipDialogue();
await page.screenshot({ path: `${out}/ep0-r01.png` });
await toExit(); await wait(400); await skipDialogue();

R.r02 = await room();
await swapTo('ashwath');
await tp(23, 13); await press('k'); await wait(300);
R.r02laser = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'laser').open);
await page.screenshot({ path: `${out}/ep0-r02.png` });
await wait(6200); await tp(46, 13); await press('k'); await wait(300);
R.r02door = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'door').open);
await toExit(); await wait(400); await skipDialogue();

R.r03 = await room();
await swapTo('sayam'); await tp(32, 13); await wait(200);
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); s.avatar.facing = 1; });
await press('k'); await wait(1200);
R.r03gate = await g(() => window.__qublox.scene.getScene('game').switches.find(s => s.kind === 'gate').open);
await page.screenshot({ path: `${out}/ep0-r03.png` });
await toExit(); await wait(400); await skipDialogue();

R.r04 = await room();
await tp(9, 13); await wait(200);
R.r04hint = await g(() => document.querySelector('.hud-hint')?.textContent ?? null);
await press('Enter'); await wait(400);
R.r04talk = await g(() => document.querySelector('.dialogue-name')?.textContent ?? null);
await page.screenshot({ path: `${out}/ep0-r04-npc.png` });
await skipDialogue();
await toExit(); await wait(400); await skipDialogue();

R.r05 = await room();
await page.screenshot({ path: `${out}/ep0-r05.png` });
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.hit(999, 0); });
await wait(1500);
R.r05joinDialogue = await g(() => !!document.querySelector('.dialogue'));
await skipDialogue(); await wait(300);
R.r05party = (await room()).party;
await toExit(); await wait(400); await skipDialogue();

R.r06 = await room();
await swapTo('tushar'); await tp(14, 37); await wait(200); await press('k'); await wait(200);
R.r06fansFrozen = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.fans.filter(f => f.frozenUntil > s.time.now).length + '/' + s.fans.length; });
await page.screenshot({ path: `${out}/ep0-r06.png` });
await toExit(); await wait(400);

R.r07 = await room();
await skipDialogue(); await wait(400); await skipDialogue(); await wait(1200);
R.bossMode = await g(() => window.__qublox.scene.getScene('game').boss?.mode);
await page.evaluate(() => { const b = window.__qublox.scene.getScene('game').boss; b.hit(130, 0); });
await wait(200);
R.bossShield = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
await page.screenshot({ path: `${out}/ep0-r07-boss.png` });
await swapTo('ashwath'); await tp(3, 13); await wait(5000); await press('k'); await wait(300);
R.bossShieldAfterHack = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
await page.evaluate(() => { const b = window.__qublox.scene.getScene('game').boss; b.hit(999, 0); });
await wait(200);
R.bossShield2 = await g(() => window.__qublox.scene.getScene('game').boss.shielded);
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); s.boss.dropShield(); s.boss.hit(999, 0); });
await wait(2500); await skipDialogue(); await wait(800);
R.results = await g(() => document.querySelector('.results-stats')?.textContent ?? null);
await page.screenshot({ path: `${out}/ep0-end.png` });
console.log(JSON.stringify(R, null, 1));
console.log(logs.join('\n') || 'no errors');
await browser.close();
