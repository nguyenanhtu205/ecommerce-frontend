export type AccountProfileSummary = {
  username: string;
  avatarUrl?: string;
};

export type AccountSecurityInfo = {
  profile: AccountProfileSummary;
  phone: string;
  email: string;
  passwordLastChangedAt?: string;
  hasLinkedSubAccount: boolean;
};

export type RiskActionKey =
  'bank_account_change' | 'password_change' | 'payout_account_change' | 'shop_info_change';

export type RiskProtectionRule = {
  id: number;
  actionKey: RiskActionKey;
  actionLabel: string;
  requireApproval: boolean;
  notifyAllCheckers: boolean;
  lastRequestedAt?: string;
  approver?: string;
  status?: 'pending' | 'approved' | 'rejected';
};

export type ShopSecuritySettings = {
  account: AccountSecurityInfo;
  isLinkedToMainAccount: boolean;
  riskRules: RiskProtectionRule[];
};

export type BankAccount = {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  isVerified: boolean;
};

export type PayoutCycle = 'daily' | 'weekly' | 'biweekly';

export type ShopPaymentSettings = {
  bankAccounts: BankAccount[];
  payoutCycle: PayoutCycle;
};

export type ShopSettingsTabKey =
  'account-security' | 'shipping' | 'payment' | 'chat' | 'vacation-mode';
