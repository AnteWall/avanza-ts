import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class MarketStatus extends ApiRequestCommand {
  public static override summary = 'Read whether a market is open';
  public static override flags = {
    ...ApiRequestCommand.flags,
    country: Flags.string({ default: 'SE', description: 'Country code, for example SE or US' }),
    date: Flags.string({ description: 'Date (yyyy-MM-dd); defaults to today' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MarketStatus);
    await this.request(
      flags,
      (client) => client.orders.marketStatus(flags.country, flags.date),
      true,
    );
  }
}
