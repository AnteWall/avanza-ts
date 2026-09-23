import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Calendar extends ApiRequestCommand {
  public static override summary = 'List upcoming dividends, reports, and other events by month';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Calendar);
    await this.request(flags, (client) => client.news.calendar(), true);
  }
}
