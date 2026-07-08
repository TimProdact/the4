import localtunnel from 'localtunnel';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.ADMIN_API_PORT || 8787);

const tunnel = await localtunnel({ port: PORT });
writeFileSync(join(ROOT, '.the4-api-url'), tunnel.url);
console.log(tunnel.url);

tunnel.on('close', () => process.exit(1));
