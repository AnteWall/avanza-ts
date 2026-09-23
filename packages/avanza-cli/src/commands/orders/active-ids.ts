import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ActiveIds extends ApiRequestCommand {
  public static override summary = 'List IDs of active orders';

  public async run(): Promise<void> {
    const { flags } = await this.parse(ActiveIds);
    await this.request(flags, (client) => client.orders.activeOrderIds(), true);
  }
}
