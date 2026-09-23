import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class EtfDetails extends ApiRequestCommand {
  public static override summary = 'Read ETF details, exposures, and trading data';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EtfDetails);
    await this.request(flags, (client) => client.market.etfDetails(flags['orderbook-id']));
  }
}
