import { Flags } from '@oclif/core';
import { insightsPeriods } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Insights extends ApiRequestCommand {
  public static override summary = 'Read what positions earned over a period, including dividends';
  public static override flags = {
    ...ApiRequestCommand.flags,
    period: Flags.option({ options: insightsPeriods, default: 'THIS_YEAR' as const })({
      description: 'Time period',
    }),
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Insights);
    await this.request(
      flags,
      (client) => client.performance.insights(flags.period, flags['account-ids']),
      true,
    );
  }
}
