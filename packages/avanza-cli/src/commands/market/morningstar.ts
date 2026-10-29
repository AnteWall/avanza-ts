import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Morningstar extends ApiRequestCommand {
  public static override summary = 'Read Morningstar fair value, moat, and bull and bear case';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Morningstar);
    await this.request(
      flags,
      (client) => client.market.morningstarAnalysis(flags['orderbook-id']),
      true,
    );
  }
}
