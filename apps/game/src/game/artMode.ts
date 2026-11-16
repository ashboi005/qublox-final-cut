// Art style: HD (default, the clean comic redraw, ART_SPEC § HD) or the original pixel art. Kept free of Phaser so React can read it.
// The choice lives in localStorage (title-screen toggle); `?art=hd` / `?art=pixel` in the URL wins and is remembered.
// Textures load once at boot, so switching reloads the page.
const KEY = 'qublox-art';
type Art = 'hd' | 'pixel';

function readArt(): Art {
  if (typeof window === 'undefined') return 'hd';
  const q = new URLSearchParams(window.location.search).get('art');
  if (q === 'hd' || q === 'pixel') { try { localStorage.setItem(KEY, q); } catch { /* private mode */ } return q; }
  try { return localStorage.getItem(KEY) === 'pixel' ? 'pixel' : 'hd'; } catch { return 'hd'; }
}

export const HD = readArt() === 'hd';

/** Switch style and reload. The URL keeps `?art=` too, so it works even where storage is blocked. */
export function setArtMode(hd: boolean) {
  const art: Art = hd ? 'hd' : 'pixel';
  try { localStorage.setItem(KEY, art); } catch { /* private mode */ }
  const url = new URL(window.location.href);
  url.searchParams.set('art', art);
  window.location.replace(url.toString());
}
