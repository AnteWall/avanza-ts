import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class WarrantOptions extends ApiRequestCommand {
  public static override summary = 'List warrant filter options';

  public async run(): Promise<void> {
    const { flags } = await this.parse(WarrantOptions);
    await this.request(flags, (client) => client.instruments.getWarrantFilterOptions());
  }
}
