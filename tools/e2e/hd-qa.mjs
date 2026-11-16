// HD art QA: loads rooms across every district with ?art=hd, screenshots each, and reports page errors, [art] warnings and placeholder textures.
import puppeteer from 'puppeteer-core';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173';
const OUT = process.env.SHOTS ?? 'tools/e2e/shots';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const logs = [];
page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
page.on('console', m => { const t = m.text(); if (/\[art\]|failed|error/i.test(t)) logs.push(m.type() + ' ' + t.slice(0, 200)); });
page.on('requestfailed', r => logs.push('REQFAIL ' + r.url()));
page.on('response', r => { if (r.status() >= 400) logs.push('HTTP ' + r.status() + ' ' + r.url()); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const skip = async () => { for (let i = 0; i < 40 && await page.evaluate(() => !!document.querySelector('.dialogue')); i++) { await page.keyboard.press('Escape'); await wait(80); } };
const rooms = [
  ['ep0-r03', 'ashwath,sayam,manya'], ['ep1-r04', 'sehaj,manvi,mansukh'], ['ep1-r07', 'ashwath,sayam,tushar'],
  ['ep2-r03', 'tushar,brahmansh,kanishk'], ['ep3-r04', 'manya,mansukh,sehaj'], ['ep3-r07', 'sayam,tushar,brahmansh'],
  ['ep4-r02', 'kanishk,manvi,ashwath'], ['ep4-r07', 'ashwath,manya,brahmansh'],
];
const R = {};
await page.goto(BASE + '/?art=hd', { waitUntil: 'networkidle0' }); await wait(1500);
await page.screenshot({ path: `${OUT}/hd-title.png` });
for (const [lvl, party] of rooms) {
  await page.goto(`${BASE}/?art=hd&level=${lvl}&party=${party}`, { waitUntil: 'networkidle0' });
  await wait(1800); await skip(); await wait(600);
  R[lvl] = await page.evaluate(() => {
    const g = window.__qublox; const s = g?.scene.getScene('game');
    const ph = g ? Object.keys(g.textures.list).filter(k => /placeholder|-ph$/.test(k)) : null;
    return { scene: !!s?.sys.isActive(), placeholders: ph };
  });
  await page.screenshot({ path: `${OUT}/hd-${lvl}.png` });
}
await browser.close();
console.log(JSON.stringify({ rooms: R, logs: [...new Set(logs)].slice(0, 40) }, null, 1));
