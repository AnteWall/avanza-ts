import { describe, expect, it } from 'vitest';

import type { BankIdSession } from '../auth/session.js';
import { loadJsonFixture } from '../test-utils/http.js';
import { CookieStore } from './cookie-store.js';

describe('CookieStore', () => {
  it('omits expired deletion markers from serialized sessions', () => {
    const store = new CookieStore();
    const url = new URL('https://www.avanza.se');

    store.set('session=credential; Path=/; Secure; HttpOnly', url);
    store.set('AZABANKIDTRANSID=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax', url);

    expect(store.serialize()).toEqual([
      expect.objectContaining({ key: 'session', value: 'credential' }),
    ]);
  });

  it('rehydrates the recorded BankID session without its deletion marker', () => {
    const session = fixtureSession();
    const store = new CookieStore(session.cookies);

    expect(store.serialize()).toHaveLength(3);
    expect(store.getHeader(new URL('https://www.avanza.se'))).not.toContain('AZABANKIDTRANSID');
  });
});

function fixtureSession(): BankIdSession {
  const fixture = loadJsonFixture<{ session: BankIdSession }>('auth/fixtures/bankid/session.json');
  return fixture.session;
}
