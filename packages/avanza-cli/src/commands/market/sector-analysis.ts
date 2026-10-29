import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class SectorAnalysis extends ApiRequestCommand {
  public static override summary = "Read key ratios for a stock's sector";
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(SectorAnalysis);
    await this.request(flags, (client) => client.market.sectorAnalysis(flags['orderbook-id']));
  }
}
