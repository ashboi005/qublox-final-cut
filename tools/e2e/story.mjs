// Story menu: Continue remembers cleared episodes; casting goes back to Story; glossary plays recorded voice lines.
import puppeteer from 'puppeteer-core';
const OUT = process.env.SHOT_DIR ?? '/tmp';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const wait = ms => new Promise(r => setTimeout(r, ms));
await p.goto((process.env.GAME_URL ?? 'http://localhost:5173') + '/', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.setItem('qublox-progress-v1', JSON.stringify({ cleared: [0] })));
await p.reload({ waitUntil: 'networkidle0' }); await wait(700);
await p.screenshot({ path: OUT + '/title2.png' });
const label = await p.evaluate(() => document.querySelector('.is-story .title-place')?.textContent);
await p.keyboard.press('Enter'); await wait(500);
await p.screenshot({ path: OUT + '/story.png' });
const sel = await p.evaluate(() => document.querySelector('.story .is-sel .title-name')?.textContent);
await p.keyboard.press('Enter'); await wait(500);
const studio = await p.evaluate(() => !!document.querySelector('.studio'));
await p.keyboard.press('Escape'); await wait(400);
const backToStory = await p.evaluate(() => !!document.querySelector('.story'));
// Glossary voice button
await p.keyboard.press('Escape'); await wait(300);
await p.evaluate(() => [...document.querySelectorAll('.title-item')].find(x => x.textContent.includes('The Crew')).click()); await wait(400);
for (let i = 0; i < 7; i++) { await p.keyboard.press('ArrowRight'); await wait(150); }
await wait(600);
const voiceButtons = await p.evaluate(() => [...document.querySelectorAll('.gloss-voice')].map(x => x.textContent));
await p.screenshot({ path: OUT + '/gloss-brahmansh.png' });
console.log(JSON.stringify({ label, sel, studio, backToStory, voiceButtons, errs }));
await b.close();
