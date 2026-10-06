import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('moderation invalidates all public listing entry points on the main application', () => {
  const calls: Array<[string, string | undefined]> = [];
  const exports: Record<string, () => void> = {};
  const source = ts.transpileModule(readFileSync(new URL('./public-cache-invalidation.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  runInNewContext(source, { exports, require: (name: string) => {
    if (name === 'next/cache') return { revalidatePath: (path: string, type?: string) => calls.push([path, type]) };
    throw new Error(`Unexpected cache test dependency: ${name}`);
  } });
  for (const page of ['page.tsx', 'search/page.tsx', 'business/[slug]/page.tsx']) {
    assert.equal(existsSync(new URL('../../app/' + page, import.meta.url)), true, 'Invalidation target must be an actual application page');
  }
  exports.expirePublicBusinessCache();
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['/', null], ['/search', null], ['/business/[slug]', 'page']]);
});
