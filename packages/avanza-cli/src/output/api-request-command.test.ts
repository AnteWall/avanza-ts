import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
}));
vi.mock('../services/session/session-store.js', () => mocks);

import TabsList from '../commands/instruments/tabs/list.js';
import Calendar from '../commands/news/calendar.js';
import Screen from '../commands/news/screen.js';
import ScreenerFilters from '../commands/news/screener-filters.js';

const root = resolve(import.meta.dirname, '../..');

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it('rejects authenticated commands without a session before sending a request', async () => {
  mocks.loadSession.mockResolvedValue(undefined);
  const fetch = vi.spyOn(globalThis, 'fetch');
  const calendarError = vi
    .spyOn(Calendar.prototype, 'logToStderr')
    .mockImplementation(() => undefined);
  const tabsError = vi.spyOn(TabsList.prototype, 'logToStderr').mockImplementation(() => undefined);

  await expect(Calendar.run([], { root })).rejects.toMatchObject({ oclif: { exit: 1 } });
  await expect(TabsList.run([], { root })).rejects.toMatchObject({ oclif: { exit: 1 } });
  expect(calendarError).toHaveBeenCalledWith(
    'Not signed in. Run avanza auth bankid or avanza auth totp.',
  );
  expect(tabsError).toHaveBeenCalledWith(
    'Not signed in. Run avanza auth bankid or avanza auth totp.',
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('clears a rejected session and reports that sign-in is needed', async () => {
  mocks.loadSession.mockResolvedValue({
    mode: 'totp',
    authenticationSession: 'session',
    securityToken: 'token',
  });
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
  const error = vi.spyOn(Calendar.prototype, 'logToStderr').mockImplementation(() => undefined);

  await expect(Calendar.run([], { root })).rejects.toMatchObject({ oclif: { exit: 1 } });
  expect(error).toHaveBeenCalledWith(
    'Session expired. Run avanza auth bankid or avanza auth totp.',
  );
  expect(fetch).toHaveBeenCalledOnce();
  expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(
    '/_api/customer-calendar/calendar',
  );
  expect(mocks.deleteSession).toHaveBeenCalledOnce();
});

it('uses a stored session only when one exists for optional commands', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({}));
  vi.spyOn(ScreenerFilters.prototype, 'log').mockImplementation(() => undefined);

  mocks.loadSession.mockResolvedValue(undefined);
  await ScreenerFilters.run(['--json'], { root });
  mocks.loadSession.mockResolvedValue({
    mode: 'totp',
    authenticationSession: 'session',
    securityToken: 'token',
  });
  await ScreenerFilters.run(['--json'], { root });

  expect(
    fetch.mock.calls.map(([, init]) => new Headers(init?.headers).get('X-AuthenticationSession')),
  ).toEqual([null, 'session']);
});

it('screens news without a session unless account or watchlist filters are given', async () => {
  mocks.loadSession.mockResolvedValue(undefined);
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => Response.json({ articles: [] }));
  vi.spyOn(Screen.prototype, 'log').mockImplementation(() => undefined);
  vi.spyOn(Screen.prototype, 'logToStderr').mockImplementation(() => undefined);

  await Screen.run(['--companies', '5269,5247', '--news-types', '2', '--json'], { root });
  await expect(Screen.run(['--watchlists', 'w'], { root })).rejects.toMatchObject({
    oclif: { exit: 1 },
  });

  expect(fetch).toHaveBeenCalledOnce();
  const url = new URL(fetch.mock.calls[0]![0].toString());
  expect(url.pathname).toBe('/_api/news-screener/results');
  expect(Object.fromEntries(url.searchParams)).toEqual({ companies: '5269,5247', newsTypes: '2' });
  expect(mocks.loadSession).toHaveBeenCalledOnce();
});
