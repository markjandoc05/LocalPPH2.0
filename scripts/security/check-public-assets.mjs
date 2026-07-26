import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const publicDirectory = join(process.cwd(), 'public');
const forbiddenExportDirectory = join(publicDirectory, 'exports');

const listFiles = (directory) => {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
};

const exposedFiles = listFiles(forbiddenExportDirectory);

if (exposedFiles.length > 0) {
  console.error('Security check failed: database exports must never be stored under public/exports.');
  for (const filePath of exposedFiles) {
    console.error(`- ${relative(process.cwd(), filePath)}`);
  }
  process.exit(1);
}

console.log('Public asset security check passed.');
