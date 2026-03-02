import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const sqlPath = path.resolve(__dirname, '../../eventdb/mvp-node/custom-json/fitness-read-model.postgres.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await pool.query(sql);
  // eslint-disable-next-line no-console
  console.log(`Read model schema applied: ${sqlPath}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
