import { describe, expect, it } from 'vitest';

import { redactFields } from './api-output.js';

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
