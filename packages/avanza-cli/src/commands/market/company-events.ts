import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { chartPeriod, chartPeriodFlags } from '../../output/chart-period-flags.js';

export default class CompanyEvents extends ApiRequestCommand {
  public static override summary = 'List report dates for a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...chartPeriodFlags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CompanyEvents);
    await this.request(flags, (client) =>
      client.market.companyEvents(flags['orderbook-id'], chartPeriod(flags, 'five_years')),
    );
  }
}
