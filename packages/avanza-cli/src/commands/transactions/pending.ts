import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Pending extends ApiRequestCommand {
  public static override summary = 'List pending withdrawals and internal transfers';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Pending);
    await this.request(flags, (client) => client.transactions.pending(), true);
  }
}
