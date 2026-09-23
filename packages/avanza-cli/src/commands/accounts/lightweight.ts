import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Lightweight extends ApiRequestCommand {
  public static override summary = 'Read lightweight account summaries';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Lightweight);
    await this.request(flags, (client) => client.accounts.lightweightAccounts(), true);
  }
}
