import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Show extends ApiRequestCommand {
  public static override summary = 'Inspect one transaction';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Account ID or URL parameter ID' }),
    'transaction-id': Flags.string({ required: true, description: 'Transaction ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Show);
    await this.request(
      flags,
      (client) => client.transactions.transaction(flags['account-id'], flags['transaction-id']),
      true,
    );
  }
}
