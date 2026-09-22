import { describe, expect, it, vi } from 'vitest';

import { recordFixture } from './http-fixture.js';

describe('recordFixture', () => {
  it('captures one raw exchange without consuming the response or recording headers', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(
      async () =>
        new Response('{"state":"COMPLETE","token":"secret"}', {
          headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'session=secret' },
          status: 202,
        }),
    );
    const recorder = recordFixture(true, fetch);
    const response = await recorder.fetch(
      new URL('https://example.test/_api/example?account=secret'),
      {
        body: '{"id":"secret"}',
        headers: { Authorization: 'secret' },
        method: 'POST',
      },
    );

    expect(await response.json()).toEqual({ state: 'COMPLETE', token: 'secret' });
    expect(recorder.latest()).toEqual({
      request: {
        body: { id: 'secret' },
        method: 'POST',
        path: '/_api/example?account=secret',
      },
      response: {
        body: { state: 'COMPLETE', token: 'secret' },
        status: 202,
      },
    });
    expect(JSON.stringify(recorder.latest())).not.toContain('session=secret');
  });

  it('does not capture non-JSON responses', async () => {
    const recorder = recordFixture(true, async () => new Response('not json'));
    expect(await (await recorder.fetch('https://example.test')).text()).toBe('not json');
    expect(recorder.latest()).toBeUndefined();
  });
});
