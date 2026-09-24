import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class CreditInfo extends ApiRequestCommand {
  public static override summary = 'Read credit limit, used credit, and interest per account';
  public static override flags = {
    ...ApiRequestCommand.flags,
    type: Flags.option({ options: ['credited', 'uncredited'] as const })({
      default: 'credited',
      description: 'Accounts with or without securities credit',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreditInfo);
    await this.request(flags, (client) => client.savings.creditInfo(flags.type), true);
  }
}
