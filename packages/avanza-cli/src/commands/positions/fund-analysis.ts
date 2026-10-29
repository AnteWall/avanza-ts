import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class FundAnalysis extends ApiRequestCommand {
  public static override summary =
    'Read a look-through of fund holdings: exposures, fees, risk, and ESG';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(FundAnalysis);
    await this.request(
      flags,
      (client) => client.positions.fundAnalysis(flags['account-ids']),
      true,
    );
  }
}
