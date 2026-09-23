import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class TotalValues extends ApiRequestCommand {
  public static override summary = 'Read total values, buying power, and development';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TotalValues);
    await this.request(
      flags,
      (client) => client.performance.totalValues(flags['account-ids']),
      true,
    );
  }
}
