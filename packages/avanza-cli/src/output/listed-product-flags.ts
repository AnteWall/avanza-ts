import { Flags } from '@oclif/core';
import type { ListedProductFilter, ScreenListedProductsOptions } from 'avanza-ts';

import { parseJsonObject } from './json-array.js';

export const listedProductFlags = {
  filter: Flags.string({ description: 'Filter as JSON; keys and values from the options command' }),
  offset: Flags.integer({ default: 0, min: 0 }),
  limit: Flags.integer({ default: 20, min: 1 }),
  'sort-field': Flags.string({ description: 'Sort field; defaults per product' }),
  order: Flags.string({ options: ['asc', 'desc'], default: 'desc' }),
};

export function listedProductOptions(flags: {
  filter: string | undefined;
  offset: number;
  limit: number;
  'sort-field': string | undefined;
  order: string;
}): ScreenListedProductsOptions {
  const filter = flags.filter === undefined ? {} : parseJsonObject(flags.filter, '--filter');
  return {
    filter: filter as ListedProductFilter,
    offset: flags.offset,
    limit: flags.limit,
    ...(flags['sort-field'] === undefined
      ? {}
      : { sortBy: { field: flags['sort-field'], order: flags.order === 'asc' ? 'asc' : 'desc' } }),
  };
}
