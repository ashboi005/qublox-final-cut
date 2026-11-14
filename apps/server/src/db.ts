import postgres from 'postgres';

export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://qublox:qublox@localhost:5433/qublox';
export const sql = postgres(DATABASE_URL, { max: 5, onnotice: () => {} });

/** Idempotent schema setup for the game's own tables, run on boot (Better Auth migrates its tables separately). */
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
  // Runs posted since accounts arrived carry their Better Auth user id (older anonymous runs keep null).
  await sql`alter table runs add column if not exists user_id text`;
  await sql`create index if not exists runs_episode_time on runs (episode, time_ms)`;
  await sql`create index if not exists runs_episode_style on runs (episode, style desc)`;
  // One cloud save per account: story progress + achievements, merged on every write.
  await sql`
    create table if not exists saves (
      user_id     text primary key,
      data        jsonb       not null,
      updated_at  timestamptz not null default now()
    )`;
}
