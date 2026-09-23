import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Deals extends ApiRequestCommand {
  public static override summary = "List today's deals";

  public async run(): Promise<void> {
    const { flags } = await this.parse(Deals);
    await this.request(flags, (client) => client.orders.deals(), true);
  }
}
