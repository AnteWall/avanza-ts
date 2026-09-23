import { Flags } from '@oclif/core';
import { listedInstrumentTypes } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Instrument extends ApiRequestCommand {
  public static override summary = 'Read a certificate, warrant, future, forward, or option';
  public static override flags = {
    ...ApiRequestCommand.flags,
    type: Flags.option({ options: listedInstrumentTypes, required: true })({
      description: 'Product type',
    }),
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Instrument);
    await this.request(flags, (client) =>
      client.market.instrument(flags.type, flags['orderbook-id']),
    );
  }
}
