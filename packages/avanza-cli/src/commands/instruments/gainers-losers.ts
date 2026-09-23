import { Flags } from '@oclif/core';
import { stockFilterSchema, type StockFilter } from 'avanza-ts';

import { InstrumentsCommand } from '../../output/instruments-command.js';

export default class GainersLosers extends InstrumentsCommand {
  public static override summary = 'List stock market gainers and losers';
  public static override flags = {
    ...InstrumentsCommand.flags,
    filter: Flags.string({ description: 'Stock filter as JSON' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GainersLosers);
    let filter: StockFilter | undefined;
    if (flags.filter !== undefined) {
      try {
        filter = stockFilterSchema.parse(JSON.parse(flags.filter) as unknown);
      } catch {
        this.error('--filter must be a JSON object.');
      }
    }
    await this.request(flags, (client) => client.instruments.getGainersLosers(filter));
  }
}
