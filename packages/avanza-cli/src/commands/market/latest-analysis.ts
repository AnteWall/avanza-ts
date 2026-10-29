import { Flags } from '@oclif/core';
import { analysisProviders } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class LatestAnalysis extends ApiRequestCommand {
  public static override summary = "Read a provider's latest analysis of a stock";
  public static override flags = {
    ...ApiRequestCommand.flags,
    provider: Flags.option({ options: analysisProviders, default: 'placera' })(),
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LatestAnalysis);
    await this.request(
      flags,
      (client) => client.market.latestAnalysis(flags.provider, flags['orderbook-id']),
      true,
    );
  }
}
