import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class DerivativeOptions extends ApiRequestCommand {
  public static override summary = 'List option, future, and forward filter options';

  public async run(): Promise<void> {
    const { flags } = await this.parse(DerivativeOptions);
    await this.request(flags, (client) => client.instruments.getOptionFutureForwardFilterOptions());
  }
}
