import { sql } from './packages/backend/dist/db/client.js';

async function run() {
  const items = await sql`SELECT metadata FROM items WHERE metadata::text LIKE '%substats%' LIMIT 5`;
  console.log(items);
  process.exit();
}
run();
