import { useMemo, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = useMemo(() => {
    return (
      oldPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      newPassword === confirmPassword
    );
  }, [oldPassword, newPassword, confirmPassword]);

  return (
    <div className='mt-4 bg-white p-8 shadow-sm'>
      {/* header */}
      <h1 className='text-lg font-medium text-slate-800'>Đổi mật khẩu</h1>

      <p className='mt-1 text-sm text-slate-500'>
        Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
      </p>

      <div className='mt-4 border-b border-slate-100' />

      {/* Form */}
      <div className='mt-8 max-w-3xl'>
        <Field label='Mật khẩu cũ'>
          <PasswordInput
            value={oldPassword}
            onChange={setOldPassword}
            show={showOld}
            setShow={setShowOld}
            placeholder='Nhập mật khẩu cũ'
          />
        </Field>

        <Field label='Mật khẩu mới'>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            placeholder='Nhập mật khẩu mới'
          />
        </Field>

        <Field label='Xác nhận mật khẩu'>
          <>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder='Nhập lại mật khẩu mới'
            />

            {confirmPassword !== '' && confirmPassword !== newPassword && (
              <p className='mt-1 text-xs text-red-500'>Mật khẩu xác nhận không khớp.</p>
            )}
          </>
        </Field>

        <div className='mt-8 ml-46'>
          <button
            disabled={!isValid}
            className='h-10 bg-[#EE4D2D] px-8 text-sm font-medium text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed'
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className='mb-5 flex items-start gap-6'>
      <span className='w-40 shrink-0 pt-2 text-right text-sm text-slate-500'>{label}</span>

      <div className='flex-1'>{children}</div>
    </div>
  );
}

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  placeholder: string;
};

function PasswordInput({ value, onChange, show, setShow, placeholder }: PasswordInputProps) {
  return (
    <div className='relative max-w-md'>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-10 w-full border border-slate-300 px-3 pr-10 text-sm outline-none focus:border-[#EE4D2D]'
      />

      <button
        type='button'
        onClick={() => setShow((prev) => !prev)}
        className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600'
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
