import { isCrewId, type CrewId } from '@qublox/shared';
import { DEFAULT_PARTY, PARTY_MAX } from './crew';

/** "ashwath,sehaj,tushar" → a valid party of 1-4 unique crew, or the default. */
export function partyFromQuery(q: string | null): CrewId[] {
  const ids = (q ?? '').split(',').map(s => s.trim()).filter(isCrewId);
  return ids.length ? [...new Set(ids)].slice(0, PARTY_MAX) : DEFAULT_PARTY;
}
