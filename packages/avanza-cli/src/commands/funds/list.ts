import { Flags } from '@oclif/core';
import type { FundListOptions } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { parseJsonObject } from '../../output/json-array.js';

export default class List extends ApiRequestCommand {
  public static override summary = 'List funds by filter, sort order, and page';
  public static override flags = {
    ...ApiRequestCommand.flags,
    name: Flags.string({ description: 'Fund name filter' }),
    filter: Flags.string({
      description: 'Filters as JSON, for example {"riskFilter":["2"]}; see filterCounts',
    }),
    'sort-field': Flags.string({ default: 'developmentThreeYears', description: 'Sort field' }),
    order: Flags.option({ options: ['asc', 'desc'] as const })({ default: 'desc' }),
    offset: Flags.integer({ default: 0, min: 0 }),
    limit: Flags.integer({ default: 20, min: 1 }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);
    const filter = flags.filter === undefined ? {} : parseJsonObject(flags.filter, '--filter');
    await this.request(flags, (client) =>
      client.funds.list({
        name: flags.name,
        filter: filter as FundListOptions['filter'],
        sortField: flags['sort-field'],
        sortDirection: flags.order === 'asc' ? 'ASCENDING' : 'DESCENDING',
        startIndex: flags.offset,
        maxNoResults: flags.limit,
      }),
    );
  }
}
