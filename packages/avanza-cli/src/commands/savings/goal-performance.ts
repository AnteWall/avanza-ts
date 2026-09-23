import { Flags } from '@oclif/core';
import { savingsGoalPeriods } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class GoalPerformance extends ApiRequestCommand {
  public static override summary = 'Read savings goal performance over time';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'category-id': Flags.string({ required: true, description: 'Savings category ID' }),
    period: Flags.option({ options: savingsGoalPeriods, default: 'ONE_YEAR' as const })({
      description: 'Time period',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GoalPerformance);
    await this.request(
      flags,
      (client) => client.savings.goalPerformance(flags['category-id'], flags.period),
      true,
    );
  }
}
