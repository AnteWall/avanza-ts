import { Flags } from '@oclif/core';
import { chartResolutions } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { chartPeriod, chartPeriodFlags } from '../../output/chart-period-flags.js';

export default class PriceChart extends ApiRequestCommand {
  public static override summary = 'Read OHLC price history for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...chartPeriodFlags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
    resolution: Flags.option({ options: chartResolutions })({
      description: 'Candle resolution; defaults to the period default',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(PriceChart);
    await this.request(flags, (client) =>
      client.market.priceChart(flags['orderbook-id'], chartPeriod(flags, 'one_year'), {
        resolution: flags.resolution,
      }),
    );
  }
}
