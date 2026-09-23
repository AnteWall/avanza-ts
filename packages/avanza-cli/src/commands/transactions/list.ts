import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class List extends ApiRequestCommand {
  public static override summary = 'List transactions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    from: Flags.string({ description: 'Start date (yyyy-MM-dd); defaults to one year back' }),
    to: Flags.string({ description: 'End date (yyyy-MM-dd); defaults to today' }),
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs',
    }),
    types: Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated transaction types, for example BUY,SELL,DIVIDEND',
    }),
    isin: Flags.string({ description: 'Instrument ISIN' }),
    'include-cancelled': Flags.boolean({ description: 'Include cancelled transactions' }),
    'include-closed': Flags.boolean({ description: 'Include closed accounts' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);
    await this.request(
      flags,
      (client) =>
        client.transactions.list({
          from: flags.from,
          to: flags.to,
          accountIds: flags['account-ids'],
          transactionTypes: flags.types,
          isin: flags.isin,
          includeCancelled: flags['include-cancelled'],
          includeClosedAccounts: flags['include-closed'],
        }),
      true,
    );
  }
}
