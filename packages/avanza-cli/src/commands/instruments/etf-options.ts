import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class EtfOptions extends ApiRequestCommand {
  public static override summary = 'List ETF filter options';

  public async run(): Promise<void> {
    const { flags } = await this.parse(EtfOptions);
    await this.request(flags, (client) => client.instruments.getEtfFilterOptions());
  }
}
