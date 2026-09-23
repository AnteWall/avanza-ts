import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class PayoutPlans extends ApiRequestCommand {
  public static override summary = 'List pension payout plans';

  public async run(): Promise<void> {
    const { flags } = await this.parse(PayoutPlans);
    await this.request(flags, (client) => client.savings.payoutPlans(), true);
  }
}
