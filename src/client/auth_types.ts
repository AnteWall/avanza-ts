export interface AvanzaSession {
  invalidSessionId: string;
  user: User;
}

export interface User {
  loggedIn: boolean;
  greetingName: string;
  unreadMessages: number;
  pushSubscriptionId: string;
  securityToken: string;
  company: boolean;
  minor: boolean;
  start: boolean;
  customerGroup: string;
  id: string;
}
