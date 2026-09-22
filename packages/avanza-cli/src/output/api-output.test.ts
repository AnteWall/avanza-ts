import { describe, expect, it } from 'vitest';

import { redactFields, selectJsonFields } from './api-output.js';

describe('redactFields', () => {
  it('only replaces explicitly listed nested fields without changing the response', () => {
    const response = {
      securityToken: 'outside',
      user: { greetingName: 'Anna', securityToken: 'secret', loggedIn: true },
    };

    expect(
      redactFields(response, [
        ['user', 'securityToken'],
        ['missing', 'securityToken'],
      ]),
    ).toEqual({
      securityToken: 'outside',
      user: { greetingName: 'Anna', securityToken: '<redacted>', loggedIn: true },
    });
    expect(response.user.securityToken).toBe('secret');
  });
});

describe('selectJsonFields', () => {
  it('selects top-level and nested array fields without changing the response', () => {
    const response = {
      stocks: [
        { name: 'Example A', lastPrice: 1, numberOfOwners: 20 },
        { name: 'Example B', lastPrice: 2 },
      ],
      totalNumberOfOrderbooks: 2,
      filterOptions: { sectors: [], marketPlaces: [] },
    };

    expect(
      selectJsonFields(response, 'stocks.name, stocks.lastPrice, totalNumberOfOrderbooks'),
    ).toEqual({
      stocks: [
        { name: 'Example A', lastPrice: 1 },
        { name: 'Example B', lastPrice: 2 },
      ],
      totalNumberOfOrderbooks: 2,
    });
    expect(response.stocks[0]?.numberOfOwners).toBe(20);
    expect(selectJsonFields(response, 'stocks.name,stocks')).toEqual({ stocks: response.stocks });
    expect(selectJsonFields(response, 'stocks,stocks.name')).toEqual({ stocks: response.stocks });
  });

  it('projects top-level arrays and tolerates empty arrays', () => {
    expect(selectJsonFields([{ sectorId: '38', sectorName: 'Technology' }], 'sectorId')).toEqual([
      { sectorId: '38' },
    ]);
    expect(selectJsonFields({ stocks: [] }, 'stocks.name')).toEqual({ stocks: [] });
  });

  it('rejects unknown or malformed paths', () => {
    for (const fields of ['unknown', 'stocks.notPresent', 'stocks.', 'stocks,,name', '']) {
      expect(() => selectJsonFields({ stocks: [{ name: 'Example' }] }, fields)).toThrow();
    }
  });
});
