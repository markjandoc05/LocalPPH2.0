import assert from 'node:assert/strict';
import test from 'node:test';
import { extractAdSensePublisherId, isValidAdSenseSnippet } from './adsense';

const validSnippet = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456" crossorigin="anonymous"></script>';

test('extracts a publisher ID from the official AdSense snippet', () => {
  assert.equal(extractAdSensePublisherId(validSnippet), 'ca-pub-1234567890123456');
  assert.equal(isValidAdSenseSnippet(validSnippet), true);
});

test('rejects arbitrary scripts and publisher IDs without the official loader', () => {
  assert.equal(extractAdSensePublisherId('ca-pub-1234567890123456'), '');
  assert.equal(extractAdSensePublisherId('<script src="https://example.com/ads.js?client=ca-pub-1234567890123456"></script>'), '');
  assert.equal(isValidAdSenseSnippet('<script>alert("not allowed")</script>'), false);
});
