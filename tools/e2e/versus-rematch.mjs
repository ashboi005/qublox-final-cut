// VERSUS online REMATCH: play a match to the end, rematch, and the second match must not "desync" (a finished match used to stay subscribed to the socket).
// Needs `bun run dev` and `bun run dev:server`.
import puppeteer from 'puppeteer-core';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173';
const launch = () => puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
const wait = ms => new Promise(r => setTimeout(r, ms));
const R = {}; const logs = [];
const open = async (b, tag) => {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  p.on('pageerror', e => logs.push(`${tag} PAGEERROR ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !m.text().includes('GL Driver')) logs.push(`${tag} ${m.text()}`); });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' }); await wait(800);
  return p;
};
const clickText = (p, sel, text) => p.evaluate((sel, text) => { const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text)); el?.click(); return !!el; }, sel, text);
const state = p => p.evaluate(() => { const s = window.__fight?.last; return s ? { frame: s.frame, phase: s.phase, hp: s.fighters.map(f => f.hp), wins: s.wins, crews: s.fighters.map(f => f.crew) } : null; });

const setVal = (p, sel, v) => p.evaluate((sel, v) => { const i = document.querySelector(sel); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, v); i.dispatchEvent(new Event('input', { bubbles: true })); }, sel, v);
const bA = await launch(), bB = await launch();
const pa = await open(bA, 'A'), pb = await open(bB, 'B');
for (const [p, n] of [[pa, 'Ashwath'], [pb, 'Sehaj']]) { await clickText(p, 'button', 'Versus'); await wait(300); await setVal(p, '.versus-field input', n); }
await clickText(pa, 'button', 'Create online room'); await wait(800);
const code = await pa.evaluate(() => document.querySelector('.studio-head h2')?.textContent.match(/[A-Z]{4}$/)?.[0] ?? null);
await setVal(pb, '.versus-join input', code);
await clickText(pb, 'button', 'Join room'); await wait(800);
const pickReady = async () => { await clickText(pa, '.studio-card', 'Ashwath'); await clickText(pb, '.studio-card', 'Manya'); await wait(400); await clickText(pa, 'button', 'Ready'); await clickText(pb, 'button', 'Ready'); await wait(2500); };
await pickReady();
// End match 1 fast: from a frame both sims agree on, P2 drops every round (frame-based, so rollbacks replay it identically).
const T = Math.max(...await Promise.all([pa, pb].map(p => p.evaluate(() => window.__fight.driver.state.frame)))) + 90;
for (const p of [pa, pb]) await p.evaluate(T => { const d = window.__fight.driver; const sim = d.simulate.bind(d); d.simulate = f => { if (f > T && d.state.phase === 'fight') d.state.fighters[1].hp = 0; return sim(f); }; }, T);
const mash = async (p, keys, n) => { for (let k = 0; k < n; k++) { await p.keyboard.down(keys[k % keys.length]); await wait(90); await p.keyboard.up(keys[k % keys.length]); } };
for (let k = 0; k < 80 && !(await pa.evaluate(() => !!document.querySelector('.versus-result'))); k++) await wait(250);
for (let k = 0; k < 40 && !(await pb.evaluate(() => !!document.querySelector('.versus-result'))); k++) await wait(250);
R.match1 = await Promise.all([pa, pb].map(p => p.evaluate(() => document.querySelector('.versus-result')?.innerText.slice(0, 80) ?? null)));
// Rematch, then play a few seconds of match 2.
for (const p of [pa, pb]) await clickText(p, 'button', 'Rematch');
await wait(600); await pickReady();
await Promise.all([mash(pa, ['d', 'j', 'd', 'k'], 40), mash(pb, ['a', 'j', 'l', 'a'], 40)]);
await wait(1500);
R.match2 = await Promise.all([pa, pb].map(p => p.evaluate(() => ({ desyncFlag: window.__fight?.driver?.desync, frame: window.__fight?.driver?.state.frame, sums: window.__fight?.driver ? [...window.__fight.driver.sums.entries()].slice(-2) : null, ui: document.body.innerText.includes('Desync') }))));
R.match2Agree = R.match2[0].sums?.filter(([f, s]) => R.match2[1].sums?.some(([g, t]) => g === f && t === s)).length ?? 0;
R.errors = logs;
console.log(JSON.stringify(R, null, 1));
const ok = R.match1.every(Boolean) && R.match2.every(m => !m.desyncFlag && !m.ui) && R.match2Agree > 0;
console.log(ok ? 'no errors' : 'FAILED');
await bA.close(); await bB.close();
process.exit(ok ? 0 : 1);
