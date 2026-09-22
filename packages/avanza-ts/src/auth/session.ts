export interface AvanzaSession {
  readonly authenticationSession: string;
  readonly securityToken: string;
  readonly pushSubscriptionId?: string;
  readonly customerId?: string;
}
