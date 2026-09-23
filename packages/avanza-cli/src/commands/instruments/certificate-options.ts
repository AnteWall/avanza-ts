import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class CertificateOptions extends ApiRequestCommand {
  public static override summary = 'List certificate filter options';

  public async run(): Promise<void> {
    const { flags } = await this.parse(CertificateOptions);
    await this.request(flags, (client) => client.instruments.getCertificateFilterOptions());
  }
}
