import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Count extends ApiRequestCommand {
  public static override summary = 'Count active orders';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Count);
    await this.request(flags, (client) => client.orders.orderCount(), true);
  }
}
