import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
}));
vi.mock('../services/session/session-store.js', () => mocks);

import Calendar from '../commands/news/calendar.js';
import TabsList from '../commands/instruments/tabs/list.js';

const root = resolve(import.meta.dirname, '../..');

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it('rejects authenticated commands without a session before sending a request', async () => {
  mocks.loadSession.mockResolvedValue(undefined);
  const fetch = vi.spyOn(globalThis, 'fetch');
  const calendarError = vi.spyOn(Calendar.prototype, 'logToStderr').mockImplementation(() => undefined);
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
