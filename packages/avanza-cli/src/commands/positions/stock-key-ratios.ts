import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class StockKeyRatios extends ApiRequestCommand {
  public static override summary = 'Read dividend and valuation ratios for stock positions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Optional account URL parameter ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(StockKeyRatios);
    await this.request(
      flags,
      (client) => client.positions.stockKeyRatios(flags['account-id']),
      true,
    );
  }
}
