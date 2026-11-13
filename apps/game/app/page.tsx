import GameShell from '@/ui/GameShell';
import { partyFromQuery } from '@/game/party';

// ?level=ep0-r01&party=ashwath,sayam,tushar   (party only overrides when given)
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const party = one(q.party);
  return <GameShell level={one(q.level) ?? 'ep0-r01'} party={party ? partyFromQuery(party) : []} direct={!!one(q.level)} />;
}
