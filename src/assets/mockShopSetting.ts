import type { ShopSecuritySettings, ShopPaymentSettings } from '@/types';

export const MOCK_SECURITY_SETTINGS: ShopSecuritySettings = {
  account: {
    profile: { username: 'takimi.vn' },
    phone: '*****83',
    email: 'ho*****@gmail.com',
    hasLinkedSubAccount: false,
  },
  isLinkedToMainAccount: false,
  riskRules: [
    {
      id: 1,
      actionKey: 'bank_account_change',
      actionLabel: 'Thêm/Chỉnh sửa Tài khoản ngân hàng',
      requireApproval: false,
      notifyAllCheckers: false,
    },
  ],
};

export const MOCK_PAYMENT_SETTINGS: ShopPaymentSettings = {
  payoutCycle: 'weekly',
  bankAccounts: [
    {
      id: 1,
      bankName: 'Vietcombank',
      accountNumber: '**** **** 1234',
      accountHolder: 'NGUYEN ANH TU',
      isDefault: true,
      isVerified: true,
    },
  ],
};
