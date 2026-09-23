import { Flags } from '@oclif/core';

import { InstrumentsCommand } from '../../output/instruments-command.js';

export default class ThemeStocks extends InstrumentsCommand {
  public static override summary = 'List themed stocks by orderbook ID';
  public static override flags = {
    ...InstrumentsCommand.flags,
    'orderbook-ids': Flags.string({ description: 'Comma-separated orderbook IDs', required: true }),
    'sort-field': Flags.string({ default: 'numberOfOwners' }),
    order: Flags.string({ options: ['asc', 'desc'], default: 'desc' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ThemeStocks);
    const orderbookIds = flags['orderbook-ids'].split(',').map((id) => id.trim());
    if (orderbookIds.some((id) => !id)) this.error('--orderbook-ids must contain nonempty IDs.');

    await this.request(flags, (client) =>
      client.instruments.getThemeStocks(orderbookIds, {
        field: flags['sort-field'],
        order: flags.order === 'asc' ? 'asc' : 'desc',
      }),
    );
  }
}
