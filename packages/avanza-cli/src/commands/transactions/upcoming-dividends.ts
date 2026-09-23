import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class UpcomingDividends extends ApiRequestCommand {
  public static override summary = 'List upcoming dividends for held positions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Account URL parameter ID; defaults to all' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UpcomingDividends);
    await this.request(
      flags,
      (client) => client.transactions.upcomingDividends(flags['account-id']),
      true,
    );
  }
}
