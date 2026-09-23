import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class CategorizedOverview extends ApiRequestCommand {
  public static override summary = 'Read the categorized account overview';

  public async run(): Promise<void> {
    const { flags } = await this.parse(CategorizedOverview);
    await this.request(flags, (client) => client.accounts.categorizedOverview(), true);
  }
}
