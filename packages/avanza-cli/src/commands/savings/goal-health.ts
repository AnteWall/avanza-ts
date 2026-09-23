import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class GoalHealth extends ApiRequestCommand {
  public static override summary = 'Compare savings goal progress with its targets';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'category-id': Flags.string({ required: true, description: 'Savings category ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GoalHealth);
    await this.request(flags, (client) => client.savings.goalHealth(flags['category-id']), true);
  }
}
