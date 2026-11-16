// Which recorded line answers which moment (a "cue"). Pure data, no browser APIs, so `bun run validate` can check
// that EVERY clip in apps/game/public/voice/index.json is used by at least one cue (and every cue's clip exists).
// Slugs are the clip file names, from the user's labels in voicelines/<crew>/. The player is in voice.ts.
import type { CrewId } from '@qublox/shared';

export type VoiceCue = 'tagin' | 'kill' | 'clear' | 'hurt' | 'low' | 'flaw' | 'annoyed' | 'special' | 'ability' | 'intro' | 'win' | 'ko' | 'couple';

export const CUES: Partial<Record<CrewId, Partial<Record<VoiceCue, string[]>>>> = {
  ashwath: {
    intro: ['khel-khtm', 'dost'],              // canon: a fight starts → "khel khtm"
    kill: ['khel-khtm'],
    clear: ['khel-khtm'],
    win: ['khel-khtm', 'dost'],
    low: ['ghee-khtm'],                        // canon: things go south → "ghee khtm" (low HP)
    ko: ['ghee-khtm'],
    flaw: ['ghee-khtm'],                       // MERGE CONFLICT
    special: ['ts-pmo-sm-gng-icl-ong-fr'],     // INFO DUMP: a four-second rant is the psychic damage
    ability: ['oye-pagal'],                    // HACK: "oye pagal" at whatever he just took over
    hurt: ['oye-pagal'],
    tagin: ['dost'],
  },
  brahmansh: {
    kill: ['parlaug-bire'],                 // "parlok, bire": sending them off
    clear: ['gg-thaa'],                     // room / boss cleared
    win: ['gg-thaa'],                       // VERSUS win
    special: ['house-of-shakes'],           // UNHINGED: the whole screen shakes
    annoyed: ['kutti-jaat-lubaane'],        // EASILY ANNOYED triggers
    intro: ['house-of-shakes', 'parlaug-bire'],
    tagin: ['gg-thaa', 'parlaug-bire'],
    ability: ['parlaug-bire'],
    hurt: ['kutti-jaat-lubaane'],
    ko: ['gg-thaa'],
  },
  sehaj: {
    tagin: ['vajj'],
    ability: ['vajj'],
    ko: ['random-weird-laugh'],
    kill: ['vajj', 'random-weird-laugh'],
    special: ['vajj'],                                  // BEAST MODE boulder
    hurt: ['ferr-khende-bohota-galla-kad-da'],          // "then you say I abuse a lot"
    flaw: ['ferr-khende-bohota-galla-kad-da'],          // GYM WEIGHT: the catwalk gives way
    clear: ['random-weird-laugh'],
    couple: ['random-weird-laugh'],
    intro: ['vajj', 'ferr-khende-bohota-galla-kad-da'],
    win: ['random-weird-laugh', 'vajj'],
  },
  mansukh: {
    special: ['babymonster1', 'babymonster2'],          // STAN MODE: the playlist comes on
    intro: ['babymonster1', 'singh'],
    win: ['babymonster2', 'babymonster1'],
    clear: ['babymonster2'],
    tagin: ['singh', 'oyehhh'],                         // tags in already ragebaiting
    ability: ['singh'],                                 // PEN TOOL
    kill: ['oyehhh'],
    hurt: ['oyehhh'],
    flaw: ['oyehhh'],                                   // CLIENT FEEDBACK
    couple: ['babymonster2'],
    ko: ['oyehhh'],
  },
  manya: {
    ability: ['look-what-i-made'],                      // FILL: "LOOK WHAT I MADE!"
    special: ['look-what-i-made'],                      // THE WORLD INSIDE MY JOURNAL
    clear: ['look-what-i-made'],
    win: ['look-what-i-made'],
    couple: ['look-what-i-made'],
    tagin: ['look-what-i-made', 'dont-irritate-me'],
    intro: ['dont-irritate-me', 'look-what-i-made'],
    flaw: ['phele-khana', 'last-warning'],              // HANGRY: DO NOT DISTURB (and FILL locked: "PEHLE KHANA!")
    hurt: ['tang-mat-kar', 'dont-irritate-me', 'i-need-my-space'],
    kill: ['tang-mat-kar', 'last-warning'],
    low: ['its-fine'],                                  // it is not fine
    ko: ['its-fine'],
  },
  mishthi: {
    intro: ['oh-my-god-bhai', 'tujhe-to-me-btati-hu'],
    tagin: ['oh-my-god-bhai'],                          // her catchphrase: "Oh my god wtf bhai."
    clear: ['oh-my-god-bhai'],
    win: ['oh-my-god-bhai', 'tujhe-to-me-btati-hu'],
    ability: ['tujhe-to-me-btati-hu'],                  // MASTERPIECE: "I'll show you"
    kill: ['tujhe-to-me-btati-hu'],
    special: ['yaar-tang-mat-kr-bhai'],                 // AS IF I CARE?: can't be bothered
    hurt: ['yaar-tang-mat-kr-bhai', 'behes-ki-ankh'],
    flaw: ['behes-ki-ankh'],                            // CREATIVE BLOCK
    low: ['behes-ki-ankh'],
    ko: ['behes-ki-ankh'],
  },
};

/** Captions for clips whose file label isn't the words spoken. */
export const CAPTIONS: Record<string, string> = {
  'ashwath/oye-pagal': 'Oyee pagalll!',   // his catchphrase as the glossary spells it
  'sehaj/random-weird-laugh': '*weird laugh*',
  'sehaj/ferr-khende-bohota-galla-kad-da': 'Fir khende bohota galla kad da',
  'mansukh/babymonster1': 'Babymonnsterrr!',
  'mansukh/babymonster2': 'BABYMONSTERRR!',
  'mansukh/oyehhh': 'Oyehhh!',
  'mansukh/singh': 'Singh!',
  'manya/look-what-i-made': 'LOOK WHAT I MADE!',
  'manya/dont-irritate-me': 'Don’t irritate me.',
  'manya/phele-khana': 'PEHLE KHANA!',
  'manya/last-warning': 'LAST WARNING.',
  'manya/tang-mat-kar': 'Tang mat kar.',
  'manya/i-need-my-space': 'I NEED MY SPACE.',
  'manya/its-fine': 'It’s fine.',
  'mishthi/oh-my-god-bhai': 'Oh my god bhai!',
  'mishthi/tujhe-to-me-btati-hu': 'Tujhe toh main batati hu!',
  'mishthi/yaar-tang-mat-kr-bhai': 'Yaar, tang mat kar bhai.',
  'mishthi/behes-ki-ankh': 'Behes ki ankh!',
};
