// Crew Glossary: opens from the title, shows every crew member's dossier (sprite, story powers, versus moves).
import puppeteer from 'puppeteer-core';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173', OUT = process.env.SHOT_DIR ?? '/tmp';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const logs = []; page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
const wait = ms => new Promise(r => setTimeout(r, ms));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await wait(800);
await page.screenshot({ path: `${OUT}/title.png` });
await page.evaluate(() => [...document.querySelectorAll('.title-item')].find(b => b.textContent.includes('The Crew')).click());
await wait(600);
const R = { opened: await page.evaluate(() => !!document.querySelector('.gloss')), crew: [] };
for (let i = 0; i < 9; i++) {
  await wait(500);
  R.crew.push(await page.evaluate(() => ({ name: document.querySelector('.gloss-id h3')?.textContent, story: document.querySelectorAll('.gloss-moves:not(.is-vs) li').length, vs: document.querySelectorAll('.gloss-moves.is-vs li').length, sprite: !!document.querySelector('.gloss-sprite'), anims: document.querySelectorAll('.gloss-anims button').length })));
  if (i === 0 || i === 3 || i === 5) await page.screenshot({ path: `${OUT}/gloss-${i}.png` });
  await page.keyboard.press('ArrowRight');
}
await page.keyboard.press('Escape'); await wait(300);
R.backToTitle = await page.evaluate(() => !!document.querySelector('.title'));
console.log(JSON.stringify(R));
console.log(logs.length ? logs.join('\n') : 'no errors');
await browser.close();
