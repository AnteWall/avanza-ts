import { Flags } from '@oclif/core';
import { chartResolutions } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { chartPeriod, chartPeriodFlags } from '../../output/chart-period-flags.js';

export default class TechnicalAnalysis extends ApiRequestCommand {
  public static override summary = 'Read OHLC lookback points before a price chart period';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...chartPeriodFlags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
    points: Flags.integer({ required: true, min: 1, description: 'Number of lookback points' }),
    resolution: Flags.option({ options: chartResolutions })({
      description: 'Candle resolution; defaults to the period default',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TechnicalAnalysis);
    await this.request(flags, (client) =>
      client.market.technicalAnalysisPoints(
        flags['orderbook-id'],
        chartPeriod(flags, 'one_year'),
        flags.points,
        { resolution: flags.resolution },
      ),
    );
  }
}
