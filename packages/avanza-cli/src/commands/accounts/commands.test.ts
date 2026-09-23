import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import PositionsList from '../positions/list.js';
import List from './list.js';

const root = resolve(import.meta.dirname, '../../..');

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
  mocks.saveSession.mockReset();
});

it('uses the stored session and account ID for positions', async () => {
  mocks.loadSession.mockResolvedValue({
    mode: 'totp',
    authenticationSession: 'session',
    securityToken: 'token',
  });
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          withOrderbook: [],
          withoutOrderbook: [],
          cashPositions: [],
          withCreditAccount: false,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
  );
  vi.spyOn(PositionsList.prototype, 'log').mockImplementation(() => undefined);

  await PositionsList.run(['--account-id', 'abc', '--json'], { root });

  expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(
    '/_api/position-data/positions/abc',
  );
  expect(fetch.mock.calls[0]![1]?.method).toBe('GET');
  expect(new Headers(fetch.mock.calls[0]![1]?.headers).get('X-AuthenticationSession')).toBe(
    'session',
  );
});

it('does not request private account data without a session', async () => {
  mocks.loadSession.mockResolvedValue(undefined);
  const fetch = vi.spyOn(globalThis, 'fetch');

  await expect(List.run([], { root })).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});
