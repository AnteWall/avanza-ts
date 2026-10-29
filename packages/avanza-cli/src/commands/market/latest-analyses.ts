import { Flags } from '@oclif/core';
import { analysisProviders } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class LatestAnalyses extends ApiRequestCommand {
  public static override summary = 'List the latest analyses from a provider';
  public static override flags = {
    ...ApiRequestCommand.flags,
    provider: Flags.option({ options: analysisProviders, default: 'placera' })(),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LatestAnalyses);
    await this.request(flags, (client) => client.market.latestAnalyses(flags.provider), true);
  }
}
