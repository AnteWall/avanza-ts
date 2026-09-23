# CLI roadmap

Read-only, customer-facing capabilities for `avanza-cli`. The entries below are grouped by CLI domain and then by the JavaScript bundle that contains their calls. Bundle names resolve under `https://cdn.avanza.se/frontend/resources/app/`; for example, `chunk-VFQ6RLZG.js` can be inspected at `https://cdn.avanza.se/frontend/resources/app/chunk-VFQ6RLZG.js`. `{param}` means a dynamic value. Confirm request and response shapes before implementation.

Only retrieval operations and POSTs that **query** data belong here. Do not add account/user settings, tax or fee data, messages, reports, transfers, order placement/modification/cancellation, or other changes to customer data. Endpoints with `UNRESOLVED` methods are omitted until their behavior is verified. Existing CLI authentication and saved screener settings remain implemented but are not proposed as new roadmap work.

## Stock screener — available now

- [x] Screen stocks — `chunk-KZLALZVV.js`: `POST /_api/market-stock-filter/stocks` (query), `GET /_api/market-stock-filter/stocks/filter-options`, `GET /_api/market-stock-filter/stocks/metadata`.
- [x] List stock sectors — `chunk-BUEBFRRE.js`: `GET /_api/market-stock-filter/sectors/all`, `GET /_api/market-stock-filter/sectors/popular`.
- [x] Query themed stocks and movers — `chunk-KZLALZVV.js`: `POST /_api/market-stock-filter/stocks/theme-stocks`, `POST /_api/market-stock-filter/stocks/gainers-losers` (both query data).

## Accounts and positions

- [x] List accounts — `chunk-VFQ6RLZG.js`: `GET /_api/account-overview/accounts/list`, `GET /_api/account-overview/accounts/closed`, `GET /_api/account-overview/accounts/has-closed`, `GET /_api/account-overview/accounts/categories`.
- [x] Inspect an account — `chunk-CAL6X3IJ.js`: `GET /_api/account-overview/overview/account/{param}`; `chunk-CZ3M76IO.js`: `GET /_api/account-overview/overview/categorizedAccounts`.
- [x] Read balances — `chunk-BJ5MRWSW.js`: `GET /_api/trading-critical/rest/accounts`, `GET /_api/trading-critical/rest/accountsandpositions`, `GET /_api/trading-critical/rest/accountvalues` (HTTP 404; not implemented), `GET /_api/trading-critical/rest/lightweightaccounts`. The other three endpoints are available; `accountvalues` still returned HTTP 404 on 2026-09-23 and is excluded.
- [x] Read positions — `chunk-WFW3TCDP.js`: `GET /_api/position-data/positions`, `GET /_api/position-data/country/list`, `GET /_api/position-data/tools/active`; `chunk-LSFO4IUH.js`: `GET /_api/position-data/orderbooks`.
- [x] Inspect position statistics — `chunk-FUCGIJ4G.js`: `GET /_api/position-statistics/statistics/categories/{param}`, `GET /_api/position-statistics/statistics/popular-categories/{param}`.

Implemented routes are available in the SDK and CLI as GET-only calls with named response types.

## Performance and activity

- [x] Read account performance — `chunk-CCAN4IPX.js`: `POST /_api/account-performance/overview/chart/accounts/timeperiod`, `POST /_api/account-performance/overview/chart/accounts/timeperiod_custom`; `chunk-7ZIXZFVN.js`: `POST /_api/account-performance/overview/total-values` (query calls).
- [x] Read transactions — `chunk-QPJ6455P.js`: `GET /_api/transactions/list`, `GET /_api/transactions/pending`, `GET /_api/transactions/transaction/{param}/{param}`; `chunk-T4MDGP4V.js`: `GET /_api/transactions/dividends{param}`.

## Market data and instruments

- [x] Search instruments — `chunk-QKYJGAHG.js`: `POST /_api/search/filtered-search` (query); `chunk-H7BPVWK5.js`: `GET /_api/market-guide/instrument/isin/{param}`.
- [x] Read stock prices and trading data — `chunk-5VW7N5HI.js`: `GET /_api/market-guide/stock/{param}/quote`, `GET /_api/market-guide/stock/{param}/orderdepth`, `GET /_api/market-guide/stock/{param}/trades`, `GET /_api/market-guide/stock/{param}/broker-trade-summaries`; `chunk-OHNVFBUW.js`: `GET /_api/trading-critical/rest/marketdata/{param}`.
- [x] Read market index and ETF data — `main-UH6CRINT.js`: `GET /_api/market-index/header-index`; `chunk-5VW7N5HI.js`: `GET /_api/market-index/{param}/constituents`; `chunk-ZRTIIPYA.js`: `GET /_api/market-etf/{param}`, `GET /_api/market-etf/{param}/details`.
- [x] Inspect market lists and charts — `chunk-SZCPO6E2.js`: `GET /_api/market-overview/overviews`; `chunk-SO75IO2W.js`: `GET /_api/market-overview/chart/{param}/{param}?raw=false`, `GET /_api/market-overview/chart/timeperiods/{param}`.
- [x] Read price and event history — `chunk-2CNBJ3C2.js`: `GET /_api/price-chart/stock/{param}`, `GET /_api/price-chart/stock/{param}/company-events`, `GET /_api/price-chart/stock/{param}/insider-transactions`, `GET /_api/price-chart/stock/{param}/ta/`.
- [x] Explore other listed products — `chunk-SO75IO2W.js`: `GET /_api/market-etf-filter/filter-options`, `POST /_api/market-etf-filter/` (query); `chunk-U7BW24O3.js`: `GET /_api/market-certificate-filter/filter-options`, `POST /_api/market-certificate-filter/` (query); `chunk-VJC23FBK.js`: `GET /_api/market-warrant-filter/filter-options`, `POST /_api/market-warrant-filter/` (query); `chunk-VE24T3KN.js`: `GET /_api/market-option-future-forward-list/filter-options`.

## Funds and market data

- [x] Search funds — `chunk-FUCGIJ4G.js`: `POST /_api/fund-guide/search` (query); `chunk-CCQTHPYY.js`: `POST /_api/fund-guide/list` (query); `chunk-C4SHODCR.js`: `GET /_api/fund-guide/instrument-search`; `chunk-ZRTIIPYA.js`: `GET /_api/fund-guide/top-ten?{param}`.
- [x] Inspect funds — `chunk-N7LWZPU6.js`: `GET /_api/fund-guide/fund-orderbook/{param}`; `chunk-W6TONNNX.js`: `GET /_api/fund-guide/fund-orderbook/details/{param}`, `GET /_api/fund-guide/fund-orderbook/piechart/holdings/{param}`, `GET /_api/fund-guide/fund-orderbook/piechart/regions/{param}`, `GET /_api/fund-guide/fund-orderbook/piechart/sectors/{param}`.
- [x] Read fund history — `chunk-YIFHCSEA.js`: `GET /_api/fund-guide/chart/{param}/{param}`, `GET /_api/fund-guide/chart/timeperiods/{param}`; `chunk-JAHCAIGM.js`: `GET /_api/fund-reference/reference/{param}`, `GET /_api/fund-reference/development/{param}`, `GET /_api/fund-reference/portfolio-data/{param}`, `GET /_api/fund-reference/sustainability/{param}`.
- [x] Read short-selling and dividend events — `chunk-XQ4J5HE2.js`: `GET /_api/market-guide/short-selling/{param}`; `chunk-T4MDGP4V.js`: `GET /_api/account-company-events/dividends/upcoming{param}`.
- [x] Read news and events — `chunk-4GEUDVPB.js`: `GET /_api/news/article{param}`; `chunk-BBMXQDGC.js`: `GET /_api/customer-calendar/calendar`; `chunk-N4XFAAIZ.js`: `GET /_api/customer-news-feed-v2/news`.

## Personal collections (view only)

- [x] View watchlists — `chunk-C2ZR4TQN.js`: `GET /_api/watchlist/watchlist`, `POST /_api/watchlist/data/by-id`, `POST /_api/watchlist/news` (the POST calls request watchlist data).
- [x] Read existing alerts — `chunk-MLBXYFDU.js`: `GET /_api/alert/alerts`, `GET /_api/alert/alerts/triggered-alerts`.
- [x] Read instrument notes — `chunk-TMLMSX3T.js`: `GET /_api/user-note/`, `GET /_api/user-note/available-orderbooks`.
- [x] Read saved funds — `chunk-YIFHCSEA.js`: `GET /_api/fund-guide/get-favourites`; `chunk-C4SHODCR.js`: `GET /_api/fund-guide/is-favourite/{param}`.

## Orders and trading status (view only)

- [x] Read active order IDs and counts — `chunk-4EYOY5Z2.js`: `GET /_api/trading/trading-orders-and-deals/activeorderids` or `GET /_api/trading/rest/activeorderids`; `chunk-33NDRR6Q.js`: `GET /_api/trading/trading-orders-and-deals/ordercount` or `GET /_api/trading/rest/ordercount`. The frontend selects between these base paths with a feature toggle; the SDK uses the `rest` paths, which respond identically. These four concrete paths are assembled dynamically and therefore are absent from the static inventory.
- [ ] Read existing orders and deals — `chunk-EM3AXP4F.js`: `GET /_api/trading/bulk/order/fetch/{param}`; `chunk-UVHLIJVC.js`: `GET /_api/trading-order-logs/order/{param}/{param}`, `GET /_api/trading-order-logs/stoploss/{param}/{param}`. Bulk orders are available (`avanza orders bulk-orders`, `bulk-order`); the order-log endpoints close the connection for a synthetic order ID and stay unimplemented until a real order or stop-loss can confirm their shape.
- [x] Read instrument and exchange status — `chunk-I73DMDPQ.js`: `GET /_api/trading-critical/rest/orderbook/{param}`; `chunk-R6ZAMORS.js`: `GET /_api/trading/rest/exchangerates`; `chunk-2EM2NIDF.js`: `GET /_api/trading/rest/trading-calendar/market-status/{param}/{param}`.
- [x] Read existing stop-losses — `chunk-OHNVFBUW.js`: `GET /_api/trading/stoploss/{param}/{param}`; `chunk-QL6CKVK6.js`: `GET /_api/trading/stoploss/{param}`.

## Savings, credit, and pensions (view only)

- [ ] Read recurring savings — `chunk-HOA3OBAZ.js`: `GET /_api/periodic-fund-saving/get-periodic-savings`, `GET /_api/periodic-fund-saving/get-periodic-saving-details?id={param}`, `GET /_api/recurring-deposit/get-recurring-deposits`; `chunk-U6EITUM7.js`: `GET /_api/recurring-deposit/get-recurring-deposit?id={param}`. The two lists are available (`avanza savings periodic`, `recurring-deposits`); the detail endpoints also take `accountId` and need an existing saving to confirm their shape.
- [x] Read savings goals — `chunk-GJ3E53OB.js`: `GET /_api/savings-goals/savings-category/get-accounts-categorized`, `GET /_api/savings-goals/insights/get-goal-health-status/{param}`; `chunk-XTUIDC3M.js`: `GET /_api/savings-goals/insights/get-goal-performance-time-series/{param}?timePeriod={param}`.
- [ ] Read credit status — `chunk-CANQRWVY.js`: `GET /_api/superloan/analysis/accounts`; `chunk-OJ2DN2LH.js`: `GET /_api/superloan/analysis/accounts/{param}`, `GET /_api/superloan/analysis/accountStatistics/{param}`; `chunk-LBJSWNAA.js`: `GET /_api/superloan/credithistory/{param}?amountOfMonths={param}`. The account list is available (`avanza savings credit-accounts`); the per-account endpoints return HTTP 400 without securities credit and need a credit account to confirm.
- [x] Read pension and payout details — `chunk-63B32IVD.js`: `GET /_api/insurance/details/pension-details/{param}`; `chunk-G55OP2WU.js`: `GET /_api/insurance/pension/distribution/v1/{param}/with-future`; `chunk-KWMD4B5G.js`: `GET /_api/insurance-payment/v3/accounts/payout-plans`; `chunk-3HHFM4VZ.js`: `GET /_api/insurance-payment/v3/accounts/{param}/payout-plan`.
