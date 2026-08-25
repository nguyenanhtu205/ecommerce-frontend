import { useParams } from 'react-router-dom';
import {
  SellerBreadcrumb,
  ShopSettingsTabs,
  AccountSecuritySection,
  ShippingSettingsSection,
  PaymentSettingsSection,
  ChatSettingsSection,
  VacationModeSection,
} from '@/components';
import { MOCK_SECURITY_SETTINGS, MOCK_PAYMENT_SETTINGS } from '@/assets';
import { type ShopSettingsTabKey } from '@/types';

const TAB_LABEL: Record<ShopSettingsTabKey, string> = {
  'account-security': 'Tài Khoản & Bảo Mật',
  shipping: 'Cài Đặt Vận Chuyển',
  payment: 'Cài Đặt Thanh Toán',
  chat: 'Cài Đặt Chat',
  'vacation-mode': 'Chế Độ Tạm Nghỉ',
};

export default function ShopSettings() {
  const { tab } = useParams<{ tab?: string }>();
  const activeTab = (tab as ShopSettingsTabKey) || 'account-security';

  return (
    <div>
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Thiết Lập Shop', path: '/seller/shop/settings/account-security' },
          { label: TAB_LABEL[activeTab] },
        ]}
        className='-mx-6 -mt-6 mb-4'
      />

      <ShopSettingsTabs />

      <div className='pt-4'>
        {activeTab === 'account-security' && (
          <AccountSecuritySection data={MOCK_SECURITY_SETTINGS} />
        )}
        {activeTab === 'shipping' && <ShippingSettingsSection />}
        {activeTab === 'payment' && <PaymentSettingsSection data={MOCK_PAYMENT_SETTINGS} />}
        {activeTab === 'chat' && <ChatSettingsSection />}
        {activeTab === 'vacation-mode' && <VacationModeSection />}
      </div>
    </div>
  );
}
