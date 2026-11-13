// VERSUS: vs CPU plays to a result; then two browsers play ONLINE through a room code and must stay in sync.
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

// ---- vs CPU
const b1 = await launch();
const a = await open(b1, 'A');
await clickText(a, 'button', 'Versus'); await wait(300);
await clickText(a, 'button', 'Vs CPU'); await wait(300);
await clickText(a, '.studio-card', 'Sehaj');
for (let k = 0; k < 40 && !(await state(a)); k++) await wait(250);
R.cpuStart = await state(a);
await a.keyboard.down('d'); for (let k = 0; k < 20; k++) { await a.keyboard.press('j'); await wait(120); } await a.keyboard.up('d');
await a.keyboard.press('l'); await wait(600);
R.cpuMid = await state(a);
await a.screenshot({ path: 'tools/e2e/shots/versus-cpu.png' });
// speed to a result: KO the CPU twice
for (let r = 0; r < 2; r++) {
  for (let k = 0; k < 40 && (await state(a))?.phase !== 'fight'; k++) await wait(250);
  await a.evaluate(() => { window.__fight.driver.state.fighters[1].hp = 0; });
  for (let k = 0; k < 40 && (await state(a))?.wins[0] <= r; k++) await wait(250);
}
for (let k = 0; k < 40 && !(await a.evaluate(() => !!document.querySelector('.versus-result'))); k++) await wait(250);
R.cpuResult = await a.evaluate(() => document.querySelector('.versus-result h2')?.textContent ?? null);
await b1.close();

// ---- online: two separate browsers
const bA = await launch(), bB = await launch();
const pa = await open(bA, 'A'), pb = await open(bB, 'B');
for (const [p, n] of [[pa, 'Ashwath'], [pb, 'Sehaj']]) { await clickText(p, 'button', 'Versus'); await wait(300); await p.evaluate(n => { const i = document.querySelector('.versus-field input'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, n); }
await clickText(pa, 'button', 'Create online room'); await wait(800);
const code = await pa.evaluate(() => document.querySelector('.studio-head h2')?.textContent.match(/[A-Z]{4}$/)?.[0] ?? null);
R.roomCode = code;
await pb.evaluate(code => { const i = document.querySelector('.versus-join input'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, code); i.dispatchEvent(new Event('input', { bubbles: true })); }, code);
await clickText(pb, 'button', 'Join room'); await wait(800);
R.lobbyA = await pa.evaluate(() => document.querySelector('.studio-head h2')?.textContent);
await clickText(pa, '.studio-card', 'Ashwath'); await clickText(pb, '.studio-card', 'Manvi'); await wait(400);
await clickText(pa, 'button', 'Ready'); await clickText(pb, 'button', 'Ready'); await wait(2500);
// Both mash different inputs for ~6s.
const mash = async (p, keys) => { for (let k = 0; k < 30; k++) { await p.keyboard.down(keys[k % keys.length]); await wait(90); await p.keyboard.up(keys[k % keys.length]); } };
await Promise.all([mash(pa, ['d', 'j', 'd', 'k', 'l', 'j']), mash(pb, ['a', 'j', 'l', 'a', 'k', 'j'])]);
await wait(1500);
const [sa, sb] = [await state(pa), await state(pb)];
R.onlineA = sa; R.onlineB = sb;
// Compare the two sims on the same (confirmed) frame using their checksum maps.
R.sync = await Promise.all([pa, pb].map(p => p.evaluate(() => { const d = window.__fight.driver; return { desync: d.desync, rollbacks: d.rollbacks, sums: [...d.sums.entries()].slice(-3) }; })));
const common = R.sync[0].sums.filter(([f, s]) => R.sync[1].sums.some(([g, t]) => g === f && t === s));
R.matchingChecksums = common.length;
await pa.screenshot({ path: 'tools/e2e/shots/versus-online-A.png' }); await pb.screenshot({ path: 'tools/e2e/shots/versus-online-B.png' });
await bA.close(); await bB.close();
console.log(JSON.stringify(R, null, 1));
console.log(logs.length ? logs.slice(0, 10).join('\n') : 'no errors');
