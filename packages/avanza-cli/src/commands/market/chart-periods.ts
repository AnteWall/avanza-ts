import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ChartPeriods extends ApiRequestCommand {
  public static override summary = 'Read price changes per chart period';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ChartPeriods);
    await this.request(flags, (client) =>
      client.market.overviewChartPeriods(flags['orderbook-id']),
    );
  }
}
