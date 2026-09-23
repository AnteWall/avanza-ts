import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class PensionDistribution extends ApiRequestCommand {
  public static override summary = 'Read fund allocation for pension premiums';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Numeric pension account ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(PensionDistribution);
    await this.request(
      flags,
      (client) => client.savings.pensionDistribution(flags['account-id']),
      true,
    );
  }
}
