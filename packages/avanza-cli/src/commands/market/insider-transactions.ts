import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { chartPeriod, chartPeriodFlags } from '../../output/chart-period-flags.js';

export default class InsiderTransactions extends ApiRequestCommand {
  public static override summary = 'Summarize insider transactions for a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...chartPeriodFlags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(InsiderTransactions);
    await this.request(flags, (client) =>
      client.market.insiderTransactions(flags['orderbook-id'], chartPeriod(flags, 'one_year')),
    );
  }
}
