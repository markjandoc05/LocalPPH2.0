import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { extractAdSensePublisherId } from '../integrations/adsense';

const load = (path: string, dependencies: Record<string, unknown>) => {
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, process: { env: {} }, console: { error: () => {}, warn: () => {}, info: () => {} }, require: (name: string) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unmocked notification dependency: ${name}`);
  } });
  return exports;
};
const { DEFAULT_EMAIL_TEMPLATES } = load('../settings/settings-service.ts', {
  '@/db': { db: {} },
  '@/db/schema': { siteSettings: {} },
  '@/lib/integrations/adsense': { extractAdSensePublisherId },
  'drizzle-orm': {},
});

const fixture = (enabled = true, configured = true) => {
  const sent: Array<{ subject: string; text: string; html: string }> = [];
  const smtp = configured ? { enabled: true, host: 'synthetic.invalid', port: 587, user: 'synthetic@example.invalid', password: 'synthetic-fixture-value', from: 'synthetic@example.invalid' } : undefined;
  const notifications = load('./notifications.ts', {
    nodemailer: { default: { createTransport: () => ({ sendMail: async (message: typeof sent[number]) => { sent.push(message); return { accepted: ['owner@example.invalid'], rejected: [], messageId: 'synthetic-mail-id' }; } }) } },
    '@/lib/seo/metadata': { SITE_URL: 'https://synthetic.invalid' },
    '@/lib/settings/settings-service': { DEFAULT_EMAIL_TEMPLATES, getSettings: async () => ({ smtp, emailTemplates: {
      ...DEFAULT_EMAIL_TEMPLATES, listingRejectedOwner: { ...DEFAULT_EMAIL_TEMPLATES.listingRejectedOwner, enabled }, listingSuspendedOwner: { ...DEFAULT_EMAIL_TEMPLATES.listingSuspendedOwner, enabled },
    } }) },
  });
  return { sent, notify: notifications.notifyUserOfListingModeration };
};
test('rejection and suspension notifications use the real templates, owner reason, review link and escaped HTML', async () => {
  for (const status of ['REJECTED', 'SUSPENDED']) {
    const f = fixture();
    const result = await f.notify({ email: 'owner@example.invalid', name: 'Synthetic owner' }, { id: 'synthetic-listing', businessName: 'Synthetic business', status, moderationReason: 'Owner-facing reason <script>unsafe()</script>' });
    assert.equal(result.sent, true); assert.equal(f.sent.length, 1);
    assert.ok(f.sent[0].subject.includes(status === 'REJECTED' ? 'rejected' : 'suspended'));
    assert.ok(f.sent[0].text.includes('https://synthetic.invalid/business/listings/synthetic-listing/edit'));
    assert.ok(f.sent[0].text.includes('Owner-facing reason'));
    assert.equal(f.sent[0].html.includes('<script>'), false); assert.ok(f.sent[0].html.includes('&lt;script&gt;'));
    assert.equal(f.sent[0].text.includes('reviewerId'), false);
  }
});
test('disabled moderation templates return a delivery failure without attempting SMTP', async () => {
  const f = fixture(false);
  const result = await f.notify({ email: 'owner@example.invalid' }, { id: 'synthetic', businessName: 'Synthetic', status: 'REJECTED', moderationReason: 'Synthetic reason' });
  assert.equal(result.sent, false); assert.equal(result.reason, 'template_disabled'); assert.equal(f.sent.length, 0);
});
test('missing SMTP configuration returns a delivery failure without an external connection', async () => {
  const f = fixture(true, false);
  const result = await f.notify({ email: 'owner@example.invalid' }, { id: 'synthetic', businessName: 'Synthetic', status: 'SUSPENDED', moderationReason: 'Synthetic reason' });
  assert.equal(result.sent, false); assert.equal(result.reason, 'missing_smtp_config'); assert.equal(f.sent.length, 0);
});
