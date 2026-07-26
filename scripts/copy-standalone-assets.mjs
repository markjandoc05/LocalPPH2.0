import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');
const publicTarget = path.join(standaloneDir, 'public');
const staticTarget = path.join(standaloneDir, '.next', 'static');

await mkdir(standaloneDir, { recursive: true });
await Promise.all([
  rm(publicTarget, { recursive: true, force: true }),
  rm(staticTarget, { recursive: true, force: true }),
]);

await Promise.all([
  cp(path.join(root, 'public'), publicTarget, {
    recursive: true,
    force: true,
  }),
  cp(path.join(root, '.next', 'static'), staticTarget, {
    recursive: true,
    force: true,
  }),
]);

console.log('Copied public and static assets into the standalone build.');
