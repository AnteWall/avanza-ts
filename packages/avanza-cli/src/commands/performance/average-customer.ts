import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class AverageCustomer extends ApiRequestCommand {
  public static override summary = 'Read the development of the average Avanza customer';
  public static override flags = {
    ...ApiRequestCommand.flags,
    from: Flags.string({ required: true, description: 'Range start (yyyy-MM-dd)' }),
    to: Flags.string({ required: true, description: 'Range end (yyyy-MM-dd)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AverageCustomer);
    await this.request(
      flags,
      (client) => client.performance.averageCustomerChart({ from: flags.from, to: flags.to }),
      true,
    );
  }
}
