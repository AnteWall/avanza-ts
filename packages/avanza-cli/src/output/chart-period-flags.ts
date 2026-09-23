import { Flags } from '@oclif/core';
import { chartPeriods, type PriceChartPeriod } from 'avanza-ts';

export const chartPeriodFlags = {
  period: Flags.option({ options: chartPeriods, exclusive: ['from', 'to'] })({
    description: 'Time period',
  }),
  from: Flags.string({ dependsOn: ['to'], description: 'Custom range start (yyyy-MM-dd)' }),
  to: Flags.string({ dependsOn: ['from'], description: 'Custom range end (yyyy-MM-dd)' }),
};

export function chartPeriod(
  flags: {
    period?: PriceChartPeriod | undefined;
    from?: string | undefined;
    to?: string | undefined;
  },
  fallback: PriceChartPeriod,
): PriceChartPeriod {
  if (flags.from !== undefined && flags.to !== undefined) return { from: flags.from, to: flags.to };
  return flags.period ?? fallback;
}
