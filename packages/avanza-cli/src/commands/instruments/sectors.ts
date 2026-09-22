import { Flags } from '@oclif/core';

import { InstrumentsCommand } from '../../output/instruments-command.js';

export default class Sectors extends InstrumentsCommand {
  public static override summary = 'List stock sectors';
  public static override flags = {
    ...InstrumentsCommand.flags,
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
