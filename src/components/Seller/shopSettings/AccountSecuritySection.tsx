import { useState } from 'react';
import type { ShopSecuritySettings, RiskProtectionRule } from '@/types';
import SettingsRow from './SettingsRow';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useGetUser } from '@/hooks';

type AccountSecuritySectionProps = {
  data: ShopSecuritySettings;
};

const MAX_NAME_LENGTH = 40;

function truncateName(name: string) {
  if (name.length <= MAX_NAME_LENGTH) return { display: name, isTruncated: false };
  return { display: `${name.slice(0, MAX_NAME_LENGTH)}...`, isTruncated: true };
}

export default function AccountSecuritySection({ data }: AccountSecuritySectionProps) {
  const navigate = useNavigate();
  const [riskRules, setRiskRules] = useState<RiskProtectionRule[]>(data.riskRules);
  const { data: user, isPending, errorMessage } = useGetUser();

  const toggleRule = (id: number, field: 'requireApproval' | 'notifyAllCheckers') => {
    setRiskRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: !r[field] } : r)));
    console.log('Cập nhật quy tắc rủi ro:', id, field);
  };

  const shopNameRaw = user?.shopName ?? 'Không xác định';
  const { display: shopNameDisplay, isTruncated: isShopNameTruncated } = truncateName(shopNameRaw);

  const emailRaw = user?.email ?? '';
  const { display: emailDisplay, isTruncated: isEmailTruncated } = truncateName(emailRaw);

  return (
    <div className='space-y-3'>
      <div className='bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-base font-medium text-slate-800'>Thông Tin Tài Khoản</h2>

        <SettingsRow
          label='Tên Shop'
          actionLabel='Sửa'
          onAction={() => navigate('/seller/shop/profile')}
        >
          {isPending ? (
            <span className='inline-block h-4 w-40 animate-pulse rounded bg-slate-200' />
          ) : errorMessage ? (
            <span className='text-red-500'>{errorMessage}</span>
          ) : (
            <span title={isShopNameTruncated ? shopNameRaw : undefined}>{shopNameDisplay}</span>
          )}
        </SettingsRow>

        <SettingsRow label='Email'>
          {isPending ? (
            <span className='inline-block h-4 w-52 animate-pulse rounded bg-slate-200' />
          ) : errorMessage ? (
            <span className='text-red-500'>{errorMessage}</span>
          ) : (
            <span title={isEmailTruncated ? emailRaw : undefined}>{emailDisplay}</span>
          )}
        </SettingsRow>

        <SettingsRow
          label='Mật khẩu đăng nhập'
          actionLabel='Đổi Mật Khẩu'
          onAction={() => console.log('Đổi mật khẩu')}
        >
          <span className='text-slate-400'>
            Nhắc nhở: Bạn nên thường xuyên thay đổi mật khẩu để tránh các sự cố về vấn đề bảo mật
          </span>
        </SettingsRow>

        <SettingsRow
          label='Liên kết tài khoản phụ'
          actionLabel='Thiết Lập'
          onAction={() => console.log('Thiết lập tài khoản phụ')}
        >
          <span className='text-slate-400'>
            {data.account.hasLinkedSubAccount ? 'Đã thiết lập' : 'Không được thiết lập'}
          </span>
        </SettingsRow>
      </div>

      <div className='bg-white p-6 shadow-sm'>
        <h2 className='mb-1 text-base font-medium text-slate-800'>Bảo Vệ Tài Khoản</h2>
        <p className='mb-4 text-sm text-slate-500'>Yêu cầu/hành động có tính rủi ro cao</p>

        {!data.isLinkedToMainAccount && (
          <div className='mb-5 flex items-start gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
            <IoIosInformationCircleOutline size={16} className='mt-0.5 shrink-0' />
            <p>
              Shop chưa được liên kết với bất kỳ Tài khoản chính nào nên không thể nhận thông báo về
              các hành động có nguy cơ gây rủi ro cao. Vui lòng{' '}
              <a href='#' className='text-sky-600 hover:underline'>
                liên kết Shop với Tài khoản chính
              </a>{' '}
              trước.
            </p>
          </div>
        )}

        <p className='mb-3 text-sm font-medium text-slate-700'>
          Bảo vệ khỏi các hành động có nguy cơ rủi ro cao
        </p>
        <p className='mb-4 text-xs text-slate-400'>
          Tăng cường bảo mật cho tài khoản trước các hành động/thay đổi có tính rủi ro cao
        </p>

        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-100 text-left text-slate-400'>
              <th className='py-2 font-normal'>Nhóm rủi ro</th>
              <th className='py-2 text-center font-normal'>Cần phê duyệt</th>
              <th className='py-2 text-center font-normal'>Thông báo đến tất cả Người kiểm tra</th>
              <th className='py-2 text-right font-normal'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {riskRules.map((rule) => (
              <tr key={rule.id} className='border-b border-slate-50'>
                <td className='py-3 text-slate-700'>{rule.actionLabel}</td>
                <td className='py-3 text-center'>
                  <ToggleSwitch
                    checked={rule.requireApproval}
                    onChange={() => toggleRule(rule.id, 'requireApproval')}
                  />
                </td>
                <td className='py-3 text-center'>
                  <ToggleSwitch
                    checked={rule.notifyAllCheckers}
                    onChange={() => toggleRule(rule.id, 'notifyAllCheckers')}
                  />
                </td>
                <td className='py-3 text-right'>
                  <button className='cursor-pointer text-sky-600 hover:underline'>Chỉnh sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='mt-5 flex justify-end'>
          <button className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'>
            Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type='button'
      onClick={onChange}
      className={`h-5 w-9 cursor-pointer rounded-full transition ${checked ? 'bg-[#EE4D2D]' : 'bg-slate-300'}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
