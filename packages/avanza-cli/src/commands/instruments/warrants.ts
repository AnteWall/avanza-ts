import { ApiRequestCommand } from '../../output/api-request-command.js';
import { listedProductFlags, listedProductOptions } from '../../output/listed-product-flags.js';

export default class Warrants extends ApiRequestCommand {
  public static override summary = 'Screen warrants by filter, sort order, and page';
  public static override flags = { ...ApiRequestCommand.flags, ...listedProductFlags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Warrants);
    const options = listedProductOptions(flags);
    await this.request(flags, (client) => client.instruments.screenWarrants(options));
  }
}
