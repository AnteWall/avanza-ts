import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class StopLoss extends ApiRequestCommand {
  public static override summary = 'Read a stop-loss order';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Account URL parameter ID' }),
    'stop-loss-id': Flags.string({ required: true, description: 'Stop-loss ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(StopLoss);
    await this.request(
      flags,
      (client) => client.orders.stopLoss(flags['account-id'], flags['stop-loss-id']),
      true,
    );
  }
}
