import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Closed extends ApiRequestCommand {
  public static override summary = 'List closed accounts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Closed);
    await this.request(flags, (client) => client.accounts.closed(), true);
  }
}
