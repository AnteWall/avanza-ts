import { Flags } from '@oclif/core';
import { chartPeriods } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Chart extends ApiRequestCommand {
  public static override summary = 'Read a fund return chart';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
    period: Flags.option({ options: chartPeriods, default: 'one_year' as const })({
      description: 'Time period',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Chart);
    await this.request(flags, (client) => client.funds.chart(flags['orderbook-id'], flags.period));
  }
}
