// Feature checks: tag hop height, Lost Footage pickup + archive, "on comms" dialogue tag.
import puppeteer from 'puppeteer-core';
const BASE = process.env.GAME_URL ?? 'http://localhost:5173';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const logs = []; page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
const wait = ms => new Promise(r => setTimeout(r, ms));
const g = fn => page.evaluate(fn);
const skipDialogue = async () => { for (let i = 0; i < 40 && await g(() => !!document.querySelector('.dialogue')); i++) { await page.keyboard.press('Escape'); await wait(80); } };
const tp = (tx, ty) => page.evaluate((tx, ty) => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(tx * 16 + 8, (ty + 1) * 16); s.avatar.pbody.setVelocity(0, 0); }, tx, ty);
const R = {};

await page.goto(BASE + '/?level=ep0-r05', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.removeItem('qublox-achievements-v1'));
await page.reload({ waitUntil: 'networkidle0' });
await wait(1800); await skipDialogue();
const apex = async (hop) => {
  await tp(10, 13); await wait(400);
  const y0 = await g(() => window.__qublox.scene.getScene('game').avatar.y);
  await page.keyboard.down('Space');
  let min = y0;
  for (let i = 0; i < 40; i++) {
    await wait(25);
    const { y, vy } = await g(() => { const a = window.__qublox.scene.getScene('game').avatar; return { y: a.y, vy: a.pbody.velocity.y }; });
    min = Math.min(min, y);
    if (hop && vy > -40 && !apex.hopped) { apex.hopped = true; await page.keyboard.press('2'); }
  }
  await page.keyboard.up('Space'); apex.hopped = false; await wait(600);
  return Math.round(y0 - min);
};
R.jumpPx = await apex(false);
R.hopPx = await apex(true);

// Tape on the truss end (40,6): teleport onto it.
await tp(40, 6); await wait(500);
R.tapeToast = await g(() => document.querySelector('.toast')?.textContent ?? document.body.innerText.match(/📼[^\n]*/)?.[0] ?? null);
R.tapesSaved = await g(() => JSON.parse(localStorage.getItem('qublox-achievements-v1') ?? '{}').sets?.tapes ?? null);

// On comms: ep2-r01 is Tushar solo; the green-screen scene has Sayam + Sehaj on comms.
await page.goto(BASE + '/?level=ep2-r01', { waitUntil: 'networkidle0' });
await wait(1800); await skipDialogue();
await tp(13, 13); await wait(600);
const names = [];
for (let i = 0; i < 6 && await g(() => !!document.querySelector('.dialogue')); i++) {
  names.push(await g(() => document.querySelector('.dialogue-name')?.textContent));
  await page.keyboard.press('Enter'); await wait(60); await page.keyboard.press('Enter'); await wait(150);
}
R.commsNames = names;
await page.screenshot({ path: 'tools/e2e/shots/features-comms.png' });
// Manvi joins after EP1 r06's waves (replacing Tushar, never Ashwath/Sehaj), then the Sehaj ⇄ Manvi couple move + MIND GAMES.
await page.goto(BASE + '/?level=ep1-r06&party=ashwath,tushar,sehaj', { waitUntil: 'networkidle0' });
await wait(1800); await skipDialogue();
for (let w = 0; w < 4; w++) { await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.hit(999, 0); }); await wait(1600); await skipDialogue(); }
await wait(1200); await skipDialogue(); await wait(600);
R.partyAfterJoin = await g(() => window.__qublox.scene.getScene('game').avatar.members.map(m => m.def.id).join(','));
const slotOf = id => page.evaluate(id => window.__qublox.scene.getScene('game').avatar.members.findIndex(m => m.def.id === id), id);
await page.keyboard.press(String((await slotOf('sehaj')) + 1)); await wait(300);
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); for (const dx of [-40, 40, 60]) s.spawnEnemy('stock-intern', s.avatar.x + dx, s.avatar.y); });
await wait(200);
const hpBefore = await g(() => window.__qublox.scene.getScene('game').liveEnemies().reduce((n, e) => n + e.hp, 0));
await page.keyboard.press(String((await slotOf('manvi')) + 1)); await wait(900);
R.coupleDamage = hpBefore - await g(() => window.__qublox.scene.getScene('game').liveEnemies().reduce((n, e) => n + e.hp, 0));
R.coupleAchievement = await g(() => !!JSON.parse(localStorage.getItem('qublox-achievements-v1') ?? '{}').unlocked?.['couple-goals']);
await page.keyboard.press('k'); await wait(300);
R.confused = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.liveEnemies().filter(e => e.confusedUntil > s.time.now).length; });
await page.screenshot({ path: 'tools/e2e/shots/features-manvi.png' });
// Sehaj's BEAST MODE: hold J, the boulder smashes the cracked wall in EP1 r05's gym nook.
await page.goto(BASE + '/?level=ep1-r05&party=ashwath,sehaj', { waitUntil: 'networkidle0' });
await wait(1800); await skipDialogue();
await page.keyboard.press('2'); await wait(300);
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); s.avatar.setPosition(9 * 16 + 8, 11 * 16); s.avatar.facing = -1; s.avatar.setFlipX(true); });
await wait(300);
R.wallsBefore = await g(() => window.__qublox.scene.getScene('game').cracked.length);
await page.keyboard.down('j'); await wait(800); await page.keyboard.up('j'); await wait(1500);
R.wallsAfter = await g(() => window.__qublox.scene.getScene('game').cracked.length);
// Ashwath's INFO DUMP (hold J): psychic ticks + enemies back off. Then a Sprite can recharges his ability.
await page.goto(BASE + '/?level=ep0-r03&party=ashwath,sayam', { waitUntil: 'networkidle0' });
await wait(1800); await skipDialogue();
await tp(22, 13); await wait(300);
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); for (const e of s.liveEnemies()) e.destroy(); for (const dx of [-50, 50]) s.spawnEnemy('stock-intern', s.avatar.x + dx, s.avatar.y); });
await wait(200);
const hp0 = await g(() => window.__qublox.scene.getScene('game').liveEnemies().reduce((n, e) => n + e.hp, 0));
await page.keyboard.down('j'); await wait(800); await page.keyboard.up('j'); await wait(1800);
R.infoDumpDamage = hp0 - await g(() => window.__qublox.scene.getScene('game').liveEnemies().reduce((n, e) => n + e.hp, 0));
await page.evaluate(() => { const s = window.__qublox.scene.getScene('game'); s.avatar.member.abilityReadyAt = s.time.now + 5000; });
R.cooldownBeforeCan = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.avatar.member.abilityReadyAt > s.time.now; });
await tp(26, 13); await wait(400);
R.cooldownAfterCan = await g(() => { const s = window.__qublox.scene.getScene('game'); return s.avatar.member.abilityReadyAt > s.time.now; });
console.log(JSON.stringify(R, null, 1));
console.log(logs.length ? logs.join('\n') : 'no errors');
await browser.close();
