import { z } from 'zod';

const amount = z.looseObject({
  value: z.number(),
  unit: z.string(),
  unitType: z.string(),
  decimalPrecision: z.number(),
});

const account = z.looseObject({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  urlParameterId: z.string(),
  hasCredit: z.boolean(),
});

const orderbook = z.looseObject({
  id: z.string(),
  flagCode: z.string().nullish(),
  name: z.string(),
  type: z.string(),
  tradeStatus: z.string().nullish(),
  quote: z
    .looseObject({
      highest: amount.nullish(),
      lowest: amount.nullish(),
      buy: amount.nullish(),
      sell: amount.nullish(),
      latest: amount.nullish(),
      change: amount.nullish(),
      changePercent: amount.nullish(),
      updated: z.string().nullish(),
    })
    .nullish(),
  turnover: z.looseObject({ volume: amount.nullish(), value: amount.nullish() }).nullish(),
  lastDeal: z.looseObject({ date: z.string().nullish(), time: z.string().nullish() }).nullish(),
});

const position = z.looseObject({
  account,
  instrument: z.looseObject({
    id: z.string().nullish(),
    type: z.string(),
    name: z.string(),
    orderbook: orderbook.nullable(),
    currency: z.string(),
    isin: z.string().nullish(),
    volumeFactor: z.number(),
  }),
  id: z.string(),
  lastTradingDayPerformance: z
    .looseObject({
      absolute: amount.nullish(),
      relative: amount.nullish(),
    })
    .nullish(),
  superInterestApproved: z.boolean().nullish(),
  volume: amount,
  value: amount,
  averageAcquiredPrice: amount.nullish(),
  averageAcquiredPriceInstrumentCurrency: amount.nullish(),
  acquiredValue: amount.nullish(),
  collateralFactor: amount.nullish(),
});

export const positionListResponseSchema = z.looseObject({
  withOrderbook: z.array(position),
  withoutOrderbook: z.array(position),
  cashPositions: z.array(z.looseObject({ account, totalBalance: amount, id: z.string() })),
  withCreditAccount: z.boolean(),
});

export type PositionListResponse = z.infer<typeof positionListResponseSchema>;
