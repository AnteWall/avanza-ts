import { ApiRequestCommand } from '../../output/api-request-command.js';
import { listedProductFlags, listedProductOptions } from '../../output/listed-product-flags.js';

export default class Etfs extends ApiRequestCommand {
  public static override summary = 'Screen ETFs by filter, sort order, and page';
  public static override flags = { ...ApiRequestCommand.flags, ...listedProductFlags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Etfs);
    const options = listedProductOptions(flags);
    await this.request(flags, (client) => client.instruments.screenEtfs(options));
  }
}
