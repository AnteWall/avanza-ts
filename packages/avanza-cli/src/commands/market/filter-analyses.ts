import { Flags } from '@oclif/core';
import { analysisProviders } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class FilterAnalyses extends ApiRequestCommand {
  public static override summary = "Filter a provider's analyses, newest first";
  public static override flags = {
    ...ApiRequestCommand.flags,
    provider: Flags.option({ options: analysisProviders, default: 'placera' })(),
    name: Flags.string({ description: 'Instrument name contains' }),
    sectors: Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated sector values from filterOptions.sectors',
    }),
    markets: Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated market values, for example se/xsto',
    }),
    recommendations: Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated recommendations, for example buy,hold',
    }),
    offset: Flags.integer({ default: 0, min: 0 }),
    limit: Flags.integer({ default: 20, min: 1 }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(FilterAnalyses);
    await this.request(
      flags,
      (client) =>
        client.market.filterAnalyses(flags.provider, {
          name: flags.name,
          sectors: flags.sectors,
          countryMarkets: flags.markets,
          recommendations: flags.recommendations,
          offset: flags.offset,
          limit: flags.limit,
        }),
      true,
    );
  }
}
