export interface AuthenticateBankIDResponse {
  transactionId: string;
  expires: string;
  autostartToken: string;
}

export enum AccountType {
  AKTIE_FOND_KONTO = "AktieFondkonto",
  INVESTERINGSPARKONTO = "Investeringssparkonto",
  KREDITKONTO_ISK = "KreditkontoISK",
  SPARKONTO_PLUS = "SparkontoPlus",
  TJANSTEPENSION = "Tjanstepension",
}

export enum BankIDAuthState {
  OUTSTANDING_TRANSACTION = "OUTSTANDING_TRANSACTION",
  COMPLETE = "COMPLETE",
  START_FAILED = "START_FAILED",
}

export interface AuthenticateBankIDStatusResponseActive {
  state: BankIDAuthState.OUTSTANDING_TRANSACTION | BankIDAuthState.START_FAILED;
  transactionId: string;
}

export interface AuthenticationSessionTOPTResponse {
  authenticationSession: string;
  customerId: string;
  pushSubscriptionId: string;
  registrationComplete: boolean;
}

export interface AuthenticateBankIDStatusResponseComplete {
  state: BankIDAuthState.COMPLETE;
  name: string;
  logins: {
    customerId: string;
    username: string;
    accounts: {
      accountName: string;
      accountType: AccountType;
    }[];
    loginPath: string;
  }[];

  transactionId: string;
  recommendedTargetCustomers: string[];
  identificationNumber: string;
}

export type AuthenticateBankIDStatusResponse =
  | AuthenticateBankIDStatusResponseActive
  | AuthenticateBankIDStatusResponseComplete;

export interface AccountsOverviewResponse {
  courtageClass: string;
  depositable: boolean;
  accountType: string;
  withdrawable: boolean;
  clearingNumber: string;
  instrumentTransferPossible: boolean;
  internalTransferPossible: boolean;
  jointlyOwned: boolean;
  accountId: string;
  accountTypeName: string;
  interestRate: number;
  numberOfOrders: number;
  numberOfDeals: number;
  performanceSinceOneWeek: number;
  performanceSinceOneMonth: number;
  performanceSinceThreeMonths: number;
  performanceSinceSixMonths: number;
  performanceSinceOneYear: number;
  performanceSinceThreeYears: number;
  performanceSinceOneWeekPercent: number;
  performanceSinceOneMonthPercent: number;
  performanceSinceThreeMonthsPercent: number;
  performanceSinceSixMonthsPercent: number;
  performanceSinceOneYearPercent: number;
  performanceSinceThreeYearsPercent: number;
  availableSuperLoanAmount: number;
  allowMonthlySaving: boolean;
  totalProfit: number;
  currencyAccounts: {
    currency: string;
    balance: number;
  }[];
  creditLimit: number;
  forwardBalance: number;
  reservedAmount: number;
  totalCollateralValue: number;
  totalPositionsValue: number;
  buyingPower: number;
  totalProfitPercent: number;
  overdrawn: boolean;
  performance: number;
  accruedInterest: number;
  creditAfterInterest: number;
  performancePercent: number;
  overMortgaged: boolean;
  totalBalance: number;
  ownCapital: number;
  numberOfTransfers: number;
  numberOfIntradayTransfers: number;
  standardDeviation: number;
  sharpeRatio: number;
}

export enum InstrumentType {
  STOCK = "STOCK",
  FUND = "FUND",
  CERTIFICATE = "CERTIFICATE",
  WARRANT = "WARRANT",
  UNKNOWN = "UNKNOWN",
}

export interface Position {
  accountName: string;
  accountType: AccountType;
  depositable: boolean;
  accountId: string;
  changePercentPeriod?: number; // Only set if instrumentType = FUND
  changePercentThreeMonths?: number; // Only set if instrumentType = FUND
  value: number;
  profit: number;
  volume: number;
  collateralValue?: number;
  averageAcquiredPrice: number;
  profitPercent: number;
  acquiredValue: number;
  name: string;
  currency: string;
  flagCode?: string; // Only set if instrumentType = FUND
  orderbookId?: string; // Not set if instrumentType = Unknown
  tradable?: boolean; // Not set if instrumentType = Unknown
  lastPrice?: number; // Not set if instrumentType = Unknown
  lastPriceUpdated?: string; // Not set if instrumentType = Unknown
  change?: number; // Not set if instrumentType = Unknown
  changePercent?: number; // Not set if instrumentType = Unknown
}

export interface InstrumentPosition {
  instrumentType: InstrumentType;
  positions: Position[];
  totalValue: number;
  totalProfitValue: number;
  totalProfitPercent: number;
  todaysProfitPercent: number;
}

export interface PositionResponse {
  instrumentPositions: InstrumentPosition[];
  totalBuyingPower: number;
  totalOwnCapital: number;
  totalProfit: number;
  totalBalance: number;
  totalProfitPercent: number;
}

export interface ErrorMessage {
  timestamp: string;
  status: number;
  error: string;
  path?: string;
}
