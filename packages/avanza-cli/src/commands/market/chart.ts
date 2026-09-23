import { Flags } from '@oclif/core';
import { chartPeriods } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Chart extends ApiRequestCommand {
  public static override summary = 'Read the relative market overview chart for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
    period: Flags.option({ options: chartPeriods, default: 'today' })({
      description: 'Time period',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Chart);
    await this.request(flags, (client) =>
      client.market.overviewChart(flags['orderbook-id'], flags.period),
    );
  }
}
