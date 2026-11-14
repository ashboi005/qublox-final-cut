// ASCII level format (content/levels/*.txt). Agent-friendly: readable and diffable.
//
// Metadata lines:
//   @name <text>                       room title (toast on enter)
//   @episode <n>                       episode number (picks music "ep<n>" and NPC dialogue "ep<n>-npc-<id>")
//   @tileset <key>                     manifest tileset (falls back to placeholder)
//   @music <song id>                   overrides the default "ep<n>" song
//   @dialogue <id>                     plays when the room starts
//   @party <id,id>                     party when an episode starts here (otherwise carried from the last room)
//   @next <level key>                  the exit X leads here; no @next = episode complete
//   @hint <tx> <ty> <text>             floating tutorial text
//   @sign <tx> <ty> <text>             in-world CRT sign (Gemini's signage)
//   @npc <tx> <ty> <cast-id>           talkable NPC (press ENTER/F nearby)
//   @trigger <tx> <ty> <w> <h> <id>    plays dialogue <id> once when the player enters the tile box
//   @join <crew-id[,crew-id]> <dialogue-id>   when every enemy in the room is down: play dialogue, crew joins
//   @boss <id> <dialogue-intro> <dialogue-outro>   boss room (B marks the spawn, arena = whole room)
//   @backdrop <name>                   parallax set: images bg-<name>-{far,mid,near}-{drained,saturated} (default neo-amritsar)
//   @scroll <px/s> [delay ms]          the floor of deleted posts rises from the bottom (EP3); touching it hurts
//   @popups-spawn <enemy char>         killing a pop-up ad normally spawns two of these (a JUMP CUT "skips the ad")
//   @decor <key> <tx> <ty>             background decoration (any manifest image/sprite; plays its first anim), feet at the tile bottom
//   @tape <tx> <ty> <tape-id>          a hidden Lost Footage tape (ids in @qublox/shared TAPE_IDS; text in story/footage.json)
//   @wave <n> <tx> <ty> <enemy char>   enemy waves (n = 1, 2, 3…). Wave n+1 spawns when wave n is down; Q doors open after the last
// Lines starting with ; are comments.
//
// Grid legend:
//   #  solid          =  one-way platform    ^  hazard (sparking cable)
//   Z  cracked wall (2 tall; only Sehaj's BEAST MODE boulder smashes it; use for optional secrets)
//   D  door (2 tall, opened by a terminal)   T  terminal (HACK toggles the nearest door/laser)
//   L  laser grid (vertical beam up to the ceiling; terminal toggles it)
//   G  toll gate (2 tall; Sayam's SMOOTH TALK speaker landing next to it opens it for good)
//   F  fan (hazard; CUT! freezes it so you can pass)
//   V  steam vent (bursts every few seconds; CUT! freezes it)
//   W  collapsing catwalk (3 tiles wide from here; crumbles when stood on; Sehaj's CTRL+Z rebuilds it)
//   K  cache block (1 tile; dissolves after you step on it, comes back after a while or on CTRL+Z)
//   <  >  turbine fan blowing left / right (pushes you; CUT! stops it)
//   Q  wave door (2 tall; opens when every @wave is cleared)
//   1 2 3  colour blocks: red (solid), blue (walk through), yellow (bouncy). Manya's FILL repaints a connected group
//   M  make-up mirror: keeps spawning stock interns until you smash it
//   O  boom mic: swings from this ceiling point (hazard at the tip; CUT! freezes it)
//   E  echo emitter: fires shockwave rings that shove you away
//   !  rage-bait mortar: drops angry-emoji fireballs from the ceiling
//   P  spawn   C  checkpoint   X  exit   h  chai (heal)   s  Sprite can (fizzy: instantly recharges the active member's ability)   B  boss spawn
//   i  stock-intern   d  reply-all-drone   m  infinite-monkey   b  corporate-memphis-blob   p  pop-up-ad   w  buffering-wheel-minion

export type Entity = { kind: string; tx: number; ty: number };
export type Hint = { tx: number; ty: number; text: string };
export type Npc = { tx: number; ty: number; id: string };
export type Trigger = { tx: number; ty: number; w: number; h: number; dialogue: string };
export type Wave = { n: number; tx: number; ty: number; kind: string };
export type Level = {
  name: string; episode: number; dialogue: string | null; tileset: string | null; music: string | null;
  party: string[] | null; next: string | null;
  join: { crew: string[]; dialogue: string } | null;
  boss: { id: string; intro: string | null; outro: string | null } | null;
  backdrop: string | null; waves: Wave[];
  scroll: { speed: number; delay: number } | null; popupsSpawn: string | null;
  width: number; height: number; grid: string[];
  entities: Entity[]; hints: Hint[]; signs: Hint[]; npcs: Npc[]; triggers: Trigger[]; tapes: Npc[]; decor: Npc[];
};

const ENTITY_CHARS = new Set(['s', 'Z', 'D', 'T', 'L', 'G', 'F', 'P', 'C', 'X', 'h', 'B', 'V', 'W', 'K', '<', '>', 'Q', '1', '2', '3', 'M', 'O', 'E', '!', 'i', 'd', 'm', 'b', 'p', 'w']);

export function parseLevel(src: string): Level {
  const lvl: Level = {
    name: 'Untitled', episode: 0, dialogue: null, tileset: null, music: null, party: null, next: null, join: null, boss: null, backdrop: null, waves: [], scroll: null, popupsSpawn: null,
    width: 0, height: 0, grid: [], entities: [], hints: [], signs: [], npcs: [], triggers: [], tapes: [], decor: [],
  };
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (!line || line.startsWith(';')) continue;
    if (line.startsWith('@')) {
      const [key, ...rest] = line.slice(1).split(' ');
      const val = rest.join(' ');
      const n = (i: number) => Number(rest[i]);
      switch (key) {
        case 'name': lvl.name = val; break;
        case 'episode': lvl.episode = Number(val) || 0; break;
        case 'dialogue': lvl.dialogue = val || null; break;
        case 'tileset': lvl.tileset = val || null; break;
        case 'music': lvl.music = val || null; break;
        case 'party': lvl.party = val.split(',').map(s => s.trim()).filter(Boolean); break;
        case 'next': lvl.next = val || null; break;
        case 'hint': lvl.hints.push({ tx: n(0), ty: n(1), text: rest.slice(2).join(' ') }); break;
        case 'sign': lvl.signs.push({ tx: n(0), ty: n(1), text: rest.slice(2).join(' ') }); break;
        case 'decor': lvl.decor.push({ id: rest[0] ?? '', tx: n(1), ty: n(2) }); break;
        case 'tape': lvl.tapes.push({ tx: n(0), ty: n(1), id: rest[2] ?? '' }); break;
        case 'npc': lvl.npcs.push({ tx: n(0), ty: n(1), id: rest[2] ?? '' }); break;
        case 'trigger': lvl.triggers.push({ tx: n(0), ty: n(1), w: n(2), h: n(3), dialogue: rest[4] ?? '' }); break;
        case 'join': lvl.join = { crew: (rest[0] ?? '').split(',').filter(Boolean), dialogue: rest[1] ?? '' }; break;
        case 'boss': lvl.boss = { id: rest[0] ?? '', intro: rest[1] ?? null, outro: rest[2] ?? null }; break;
        case 'backdrop': lvl.backdrop = val || null; break;
        case 'scroll': lvl.scroll = { speed: n(0) || 20, delay: Number(rest[1] ?? 3000) }; break;
        case 'popups-spawn': lvl.popupsSpawn = rest[0] ?? 'm'; break;
        case 'wave': lvl.waves.push({ n: n(0), tx: n(1), ty: n(2), kind: rest[3] ?? 'i' }); break;
      }
      continue;
    }
    lvl.grid.push(line);
  }
  lvl.height = lvl.grid.length;
  lvl.width = Math.max(0, ...lvl.grid.map(r => r.length));
  lvl.grid = lvl.grid.map(r => r.padEnd(lvl.width, '.'));
  lvl.grid.forEach((row, ty) => [...row].forEach((c, tx) => { if (ENTITY_CHARS.has(c)) lvl.entities.push({ kind: c, tx, ty }); }));
  return lvl;
}

const solidAt = (l: Level, x: number, y: number) => x < 0 || y < 0 || x >= l.width || y >= l.height || l.grid[y]![x] === '#';

/** Tile indices for a Phaser tilemap, using the 3×3 blob block (0-8) + 9-11 one-way + 12 hazard. -1 = empty. */
export function tileData(l: Level, TILE: { ONEWAY_L: number; ONEWAY_M: number; ONEWAY_R: number; HAZARD: number }): number[][] {
  return l.grid.map((row, y) => [...row].map((c, x) => {
    if (c === '#') {
      const r = !solidAt(l, x, y - 1) ? 0 : !solidAt(l, x, y + 1) ? 2 : 1;
      const col = !solidAt(l, x - 1, y) ? 0 : !solidAt(l, x + 1, y) ? 2 : 1;
      return r * 3 + col;
    }
    if (c === '=') {
      const left = row[x - 1] === '=', right = row[x + 1] === '=';
      return !left ? TILE.ONEWAY_L : !right ? TILE.ONEWAY_R : TILE.ONEWAY_M;
    }
    if (c === '^') return TILE.HAZARD;
    return -1;
  }));
}

/** First solid tile above (tx, ty), used to size laser beams. */
export function ceilingAbove(l: Level, tx: number, ty: number): number {
  for (let y = ty - 1; y >= 0; y--) if (l.grid[y]![tx] === '#') return y;
  return 0;
}
