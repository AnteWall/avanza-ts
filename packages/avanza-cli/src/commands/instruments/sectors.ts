import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Sectors extends ApiRequestCommand {
  public static override summary = 'List stock sectors';
  public static override flags = {
    ...ApiRequestCommand.flags,
    popular: Flags.boolean({ description: 'Show popular sectors only' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Sectors);
    await this.request(flags, (client) =>
      flags.popular
        ? client.instruments.getPopularStockSectors()
        : client.instruments.getAllStockSectors(),
    );
  }
}
