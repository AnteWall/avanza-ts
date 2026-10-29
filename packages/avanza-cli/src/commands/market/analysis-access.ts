import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class AnalysisAccess extends ApiRequestCommand {
  public static override summary = 'Show which gated analysis providers you can read';
  public static override flags = { ...ApiRequestCommand.flags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AnalysisAccess);
    await this.request(flags, (client) => client.market.analysisAccess(), true);
  }
}
