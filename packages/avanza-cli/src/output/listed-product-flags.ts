import { Flags } from '@oclif/core';
import type { ListedProductFilter, ScreenListedProductsOptions } from 'avanza-ts';

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
  let filter: unknown;
  try {
    filter = flags.filter === undefined ? {} : JSON.parse(flags.filter);
  } catch {
    filter = undefined;
  }
  if (typeof filter !== 'object' || filter === null || Array.isArray(filter)) {
    throw new Error('--filter must be a JSON object.');
  }
  return {
    filter: filter as ListedProductFilter,
    offset: flags.offset,
    limit: flags.limit,
    ...(flags['sort-field'] === undefined
      ? {}
      : { sortBy: { field: flags['sort-field'], order: flags.order === 'asc' ? 'asc' : 'desc' } }),
  };
}
