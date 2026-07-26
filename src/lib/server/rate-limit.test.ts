import assert from 'node:assert/strict';
import test from 'node:test';
import { consumeRateLimit, getRequestClientIp } from './rate-limit';

test('rate limit blocks requests above the fixed-window allowance and then resets', () => {
  const key = `test-${Math.random()}`;

  assert.equal(consumeRateLimit(key, 2, 1_000, 100).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 1_000, 200).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 1_000, 300).allowed, false);
  assert.equal(consumeRateLimit(key, 2, 1_000, 1_101).allowed, true);
});

test('client IP uses the proxy-provided first address', () => {
  const request = new Request('https://localpages.ph/api/public/data', {
    headers: {
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
    },
  });

  assert.equal(getRequestClientIp(request), '203.0.113.10');
});
