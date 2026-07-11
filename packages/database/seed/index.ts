import { db } from '../src/client';

// Idempotent seed script stub. Real seeding (plans catalog, help
// content, fixture event, per doc 37 §6.2) lands in a later milestone.
async function main() {
  void db; // exercises the client import so this stays a real, connectable stub
  console.log('seed: no-op, plans catalog / help content / fixture event seeding lands in a later milestone');
}

main();
