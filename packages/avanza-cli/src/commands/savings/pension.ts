import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Pension extends ApiRequestCommand {
  public static override summary = 'Read pension insurance details';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Numeric pension account ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Pension);
    await this.request(flags, (client) => client.savings.pensionDetails(flags['account-id']), true);
  }
}
