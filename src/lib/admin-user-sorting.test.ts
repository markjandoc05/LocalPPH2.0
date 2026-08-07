import assert from 'node:assert/strict';
import test from 'node:test';

import { compareUsersByRegistration, getRegistrationTime } from './admin-user-sorting';

const users = [
  { id: 'middle', email: 'middle@example.com', createdAt: '2026-02-01T00:00:00.000Z' },
  { id: 'first', email: 'first@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'newest', email: 'newest@example.com', createdAt: '2026-03-01T00:00:00.000Z' },
  { id: 'unknown', email: 'unknown@example.com' },
];

test('sorts the first registered users before newer users', () => {
  const sorted = [...users].sort((a, b) => compareUsersByRegistration(a, b, 'asc'));
  assert.deepEqual(sorted.map((user) => user.id), ['first', 'middle', 'newest', 'unknown']);
});

test('sorts the newest registered users first by default', () => {
  const sorted = [...users].sort((a, b) => compareUsersByRegistration(a, b, 'desc'));
  assert.deepEqual(sorted.map((user) => user.id), ['newest', 'middle', 'first', 'unknown']);
});

test('rejects missing or invalid registration timestamps', () => {
  assert.equal(getRegistrationTime(undefined), null);
  assert.equal(getRegistrationTime('not-a-date'), null);
});
