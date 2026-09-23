import { Flags } from '@oclif/core';
import { screenerTabsSchema } from 'avanza-ts';

import { ApiRequestCommand } from '../../../output/api-request-command.js';
import { parseJsonArray } from '../../../output/json-array.js';

export default class Save extends ApiRequestCommand {
  public static override summary = 'Replace saved stock screener tabs';
  public static override flags = {
    ...ApiRequestCommand.flags,
    data: Flags.string({ description: 'JSON array of tabs', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Save);
    const { tabs } = screenerTabsSchema.parse({ tabs: parseJsonArray(flags.data) });
    await this.request(flags, (client) => client.instruments.saveStockScreenerTabs(tabs), true);
  }
}
