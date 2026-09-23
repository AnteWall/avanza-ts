import { Flags } from '@oclif/core';
import { listedInstrumentTypes } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class InstrumentDetails extends ApiRequestCommand {
  public static override summary =
    'Read issuer, documents, order depth, and trades for a listed product';
  public static override flags = {
    ...ApiRequestCommand.flags,
    type: Flags.option({ options: listedInstrumentTypes, required: true })({
      description: 'Product type',
    }),
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstrumentDetails);
    await this.request(flags, (client) =>
      client.market.instrumentDetails(flags.type, flags['orderbook-id']),
    );
  }
}
