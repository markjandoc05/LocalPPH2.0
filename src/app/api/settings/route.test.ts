import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { NextResponse } from 'next/server';
import ts from 'typescript';
import { toPublicSettings, type PublicIntegrationSettings } from '../../../lib/settings/public-settings';

// Execute the actual route with its settings service replaced before import.
// No database, authentication, SMTP, or environment configuration is loaded.
const loadRoute = (getSettings: () => Promise<unknown>) => {
  const source = readFileSync(new URL('./route.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {} as { GET: (request: Request) => Promise<Response> };
  runInNewContext(outputText, {
    exports,
    require: (specifier: string) => {
      if (specifier === 'next/server') return { NextResponse };
      if (specifier === '@/lib/settings/settings-service') return { getSettings };
      if (specifier === '@/lib/settings/public-settings') return { toPublicSettings };
      throw new Error(`Unexpected route dependency: ${specifier}`);
    },
    console: { error: () => {} },
  }, { filename: 'public-settings-route.ts' });
  return exports;
};

const publicSettings: PublicIntegrationSettings = {
  googleAnalytics: { enabled: true, measurementId: 'G-SYNTHETIC' },
  searchConsole: { enabled: true, verificationTag: '<meta name="google-site-verification" content="synthetic-public-tag">' },
  tagManager: { enabled: true, containerId: 'GTM-SYNTHETIC' },
  clarity: { enabled: true, projectId: 'synthetic-clarity' },
  metaPixel: { enabled: true, pixelId: '123456789' },
  cookieConsent: { enabled: true, message: 'Synthetic consent message', privacyPolicyUrl: '/privacy' },
  sitemap: { enabled: true, url: '/sitemap.xml', autoGenerate: true },
  robots: { enabled: true, url: '/robots.txt', status: 'Allowed' },
  openGraph: { enabled: true, title: 'Synthetic title', description: 'Synthetic description', imageUrl: '/synthetic-og.png' },
  favicon: { enabled: true, url: '/synthetic-favicon.ico' },
};

const privateMarker = 'SYNTHETIC_PRIVATE_CREDENTIAL_DO_NOT_RETURN';
const storedSettings = {
  ...publicSettings,
  smtp: { enabled: true, host: 'smtp.invalid', port: '465', secure: true, user: 'synthetic@example.invalid', password: privateMarker, from: 'synthetic@example.invalid', rejectUnauthorized: true },
  emailTemplates: { inquiryReplyUser: { enabled: true, subject: privateMarker, body: privateMarker } },
  unexpectedPrivateField: { apiKey: privateMarker },
  googleAnalytics: { ...publicSettings.googleAnalytics, lastChecked: '2026-01-01', privateCredential: privateMarker },
  cookieConsent: { ...publicSettings.cookieConsent, privateCredential: privateMarker },
};

const anonymousRequest = () => new Request('http://localhost/api/settings');

test('anonymous settings route excludes SMTP, templates, and unexpected private fields', async () => {
  const response = await loadRoute(async () => storedSettings).GET(anonymousRequest());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(JSON.stringify(body).includes(privateMarker), false);
  assert.deepEqual(Object.keys(body).sort(), Object.keys(publicSettings).sort());
  assert.equal('smtp' in body, false);
  assert.equal('emailTemplates' in body, false);
  assert.equal('lastChecked' in body.googleAnalytics, false);
  assert.equal('privateCredential' in body.googleAnalytics, false);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('anonymous settings route preserves every public integration field', async () => {
  const response = await loadRoute(async () => storedSettings).GET(anonymousRequest());
  assert.deepEqual(await response.json(), publicSettings);
});

test('missing settings produce disabled public integrations without private fields', async () => {
  for (const settings of [undefined, null, {}]) {
    const response = await loadRoute(async () => settings).GET(anonymousRequest());
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), Object.keys(publicSettings).sort());
    assert.equal(Object.values(body).every((service) => (service as { enabled: boolean }).enabled === false), true);
    assert.deepEqual(body.googleAnalytics, { enabled: false, measurementId: '' });
  }
});

test('malformed public fields cannot serialize private objects or enable tracking', async () => {
  const response = await loadRoute(async () => ({
    googleAnalytics: { enabled: privateMarker, measurementId: { password: privateMarker } },
    searchConsole: null,
    favicon: { enabled: false, url: { password: privateMarker } },
  })).GET(anonymousRequest());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.googleAnalytics, { enabled: false, measurementId: '' });
  assert.deepEqual(body.searchConsole, { enabled: false, verificationTag: '' });
  assert.deepEqual(body.favicon, { enabled: false, url: '' });
  assert.equal(JSON.stringify(body).includes(privateMarker), false);
});

test('settings service failures return only a generic uncached error', async () => {
  const response = await loadRoute(async () => { throw new Error(privateMarker); }).GET(anonymousRequest());
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { error: 'Failed to load site configurations' });
});
