import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class RecurringDeposits extends ApiRequestCommand {
  public static override summary = 'List recurring deposits';

  public async run(): Promise<void> {
    const { flags } = await this.parse(RecurringDeposits);
    await this.request(flags, (client) => client.savings.recurringDeposits(), true);
  }
}
