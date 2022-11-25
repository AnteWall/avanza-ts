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

export interface Account {
  accountType: string;
  interestRate: number;
  depositable: boolean;
  active: boolean;
  accountId: string;
  tradable: boolean;
  accountPartlyOwned: boolean;
  totalBalance: number;
  totalBalanceDue: number;
  ownCapital: number;
  buyingPower: number;
  totalProfitPercent: number;
  attorney: boolean;
  performance: number;
  totalProfit: number;
  performancePercent: number;
  name: string;
  sparkontoPlusType: string;
}

export interface AccountsOverviewResponse {
  accounts: Account[];
  numberOfOrders: number;
  numberOfDeals: number;
  totalBalance: number;
  totalBuyingPower: number;
  totalOwnCapital: number;
  totalPerformancePercent: number;
  totalPerformance: number;
  numberOfTransfers: number;
  numberOfIntradayTransfers: number;
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
