// VERSUS finisher: KO the CPU twice, then ↓ + I during FINAL CUT IT! → the finisher cinematic + credit on the result screen.
import puppeteer from 'puppeteer-core';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173', OUT = process.env.SHOT_DIR ?? 'tools/e2e/shots';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const wait = ms => new Promise(r => setTimeout(r, ms));
const clickText = (sel, text) => p.evaluate((sel, text) => { const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text)); el?.click(); return !!el; }, sel, text);
const st = () => p.evaluate(() => { const s = window.__fight?.last; return s ? { phase: s.phase, wins: s.wins, finisher: s.finisher } : null; });
await p.goto(BASE + '/', { waitUntil: 'networkidle0' }); await wait(800);
await clickText('button', 'Versus'); await wait(300); await clickText('button', 'Vs CPU'); await wait(300);
await clickText('.studio-card', process.env.CREW ?? 'Mishthi');
for (let k = 0; k < 40 && !(await st()); k++) await wait(250);
for (let r = 0; r < 2; r++) {
  for (let k = 0; k < 60 && (await st())?.phase !== 'fight'; k++) await wait(250);
  await p.evaluate(() => { window.__fight.driver.state.fighters[1].hp = 0; });
  for (let k = 0; k < 60 && (await st())?.wins[0] <= r; k++) await wait(250);
}
for (let k = 0; k < 60 && (await st())?.phase !== 'finish'; k++) await wait(200);
const R = { finishPhase: (await st())?.phase };
await p.screenshot({ path: `${OUT}/finish-prompt.png` });
await p.keyboard.down('s'); await wait(100); await p.keyboard.down('i'); await wait(150); await p.keyboard.up('i'); await p.keyboard.up('s');
await wait(1300);
await p.screenshot({ path: `${OUT}/finisher.png` });
R.after = await st();
for (let k = 0; k < 40 && !(await p.evaluate(() => !!document.querySelector('.versus-result'))); k++) await wait(250);
R.result = await p.evaluate(() => document.querySelector('.versus-finisher')?.textContent ?? null);
console.log(JSON.stringify({ ...R, errs }));
await b.close();
