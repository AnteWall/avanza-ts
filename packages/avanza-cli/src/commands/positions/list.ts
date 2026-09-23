import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class List extends ApiRequestCommand {
  public static override summary = 'Read positions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Optional account URL parameter ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);
    await this.request(flags, (client) => client.positions.list(flags['account-id']), true);
  }
}
