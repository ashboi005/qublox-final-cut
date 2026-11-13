import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL ?? 'postgres://qublox:qublox@localhost:5433/qublox', {
  max: 5,
  onnotice: () => {},
});

/** Idempotent schema setup, run on boot. Swap for real migrations once the schema settles. */
export async function migrate() {
  await sql`
    create table if not exists runs (
      id          serial primary key,
      player      text        not null,
      episode     smallint    not null,
      time_ms     integer     not null,
      style       integer     not null,
      kos         smallint    not null,
      party       text[]      not null,
      created_at  timestamptz not null default now()
    )`;
  await sql`create index if not exists runs_episode_time on runs (episode, time_ms)`;
  await sql`create index if not exists runs_episode_style on runs (episode, style desc)`;
}
