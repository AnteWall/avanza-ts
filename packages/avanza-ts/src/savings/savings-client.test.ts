import { expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

it('requires a session', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
  await expect(client.savings.categories()).rejects.toBeInstanceOf(
    AvanzaAuthenticationRequiredError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('sends only GET requests with encoded IDs', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse({}));
  const { savings } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
  const calls = [
    [() => savings.periodicSavings(), '/_api/periodic-fund-saving/get-periodic-savings'],
    [() => savings.recurringDeposits(), '/_api/recurring-deposit/get-recurring-deposits'],
    [() => savings.categories(), '/_api/savings-goals/savings-category/get-accounts-categorized'],
    [() => savings.goalHealth('c/1'), '/_api/savings-goals/insights/get-goal-health-status/c%2F1'],
    [
      () => savings.goalPerformance('c1', 'INFINITY'),
      '/_api/savings-goals/insights/get-goal-performance-time-series/c1?timePeriod=INFINITY',
    ],
    [() => savings.creditAccounts(), '/_api/superloan/analysis/accounts'],
    [() => savings.pensionDetails('1'), '/_api/insurance/details/pension-details/1'],
    [
      () => savings.pensionDistribution('1'),
      '/_api/insurance/pension/distribution/v1/1/with-future',
    ],
    [() => savings.payoutPlans(), '/_api/insurance-payment/v3/accounts/payout-plans'],
    [() => savings.payoutPlan('1'), '/_api/insurance-payment/v3/accounts/1/payout-plan'],
  ] as const;
  await Promise.all(calls.map(([call]) => call()));
  expect(
    fetch.mock.calls.map(([url, init]) => {
      const { pathname, search } = new URL(url.toString());
      return [pathname + search, init?.method];
    }),
  ).toEqual(calls.map(([, path]) => [path, 'GET']));
});

it('resolves an empty payout plan to null', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(new Response(null, { status: 204 }));
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
  await expect(client.savings.payoutPlan('1')).resolves.toBeNull();
});
