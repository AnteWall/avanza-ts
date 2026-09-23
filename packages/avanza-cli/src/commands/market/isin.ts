import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Isin extends ApiRequestCommand {
  public static override summary = 'Look up an instrument by ISIN';
  public static override flags = {
    ...ApiRequestCommand.flags,
    isin: Flags.string({ required: true, description: 'ISIN' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Isin);
    await this.request(flags, (client) => client.market.instrumentByIsin(flags.isin));
  }
}
