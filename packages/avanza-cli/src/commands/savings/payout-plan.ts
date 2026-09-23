import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class PayoutPlan extends ApiRequestCommand {
  public static override summary = 'Read the payout plan for a pension account';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Numeric pension account ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(PayoutPlan);
    await this.request(flags, (client) => client.savings.payoutPlan(flags['account-id']), true);
  }
}
