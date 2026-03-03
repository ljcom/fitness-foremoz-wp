import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveCustomJsonDir() {
  const defaultDir = path.resolve(__dirname, '../../eventdb/mvp-node/custom-json');
  const configured = process.env.CUSTOM_JSON_DIR;
  if (!configured) return defaultDir;

  const candidates = [
    path.resolve(configured),
    path.resolve(process.cwd(), configured),
    path.resolve(__dirname, configured)
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }

  return path.resolve(process.cwd(), configured);
}

async function main() {
  const customJsonDir = await resolveCustomJsonDir();
  const sqlPath = path.resolve(customJsonDir, 'fitness-read-model.postgres.sql');
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
