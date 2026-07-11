-- docs/16-database-schema.md §2.1: RFC 9562 UUIDv7 generator. Postgres
-- has no native UUIDv7 generator until PG18, so this installs a
-- ~15-line SQL function combining a 48-bit big-endian millisecond Unix
-- timestamp with 74 bits of gen_random_uuid() entropy, in a dedicated
-- `concourse` schema kept separate from `public`. Every Drizzle-side id
-- default calls this function; ids are never generated in TypeScript.
--
-- NOTE: this bit-manipulation has not been executed against a live
-- Postgres in this environment (no Docker/Postgres available in the
-- authoring sandbox). Before relying on it, run:
--   SELECT concourse.uuid_generate_v7();  -- ten times, confirm the
--   13th hex character is always '7' (version) and the 17th is '8',
--   '9', 'a', or 'b' (variant), and that values are monotonically
--   increasing when generated in a tight loop.

CREATE SCHEMA IF NOT EXISTS concourse;

CREATE OR REPLACE FUNCTION concourse.uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  unix_ts_ms bytea := substring(
    int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint)
    FROM 3 FOR 6
  );
  result bytea := overlay(uuid_send(gen_random_uuid()) PLACING unix_ts_ms FROM 1 FOR 6);
BEGIN
  -- byte 6, high nibble = version (0111 = 7); low nibble kept from the
  -- random source.
  result := set_byte(result, 6, (b'0111' || get_byte(result, 6)::bit(4))::bit(8)::int);
  -- byte 8, top 2 bits = variant (10); low 6 bits kept from the random
  -- source.
  result := set_byte(result, 8, (b'10' || get_byte(result, 8)::bit(6))::bit(8)::int);
  RETURN encode(result, 'hex')::uuid;
END;
$$;
