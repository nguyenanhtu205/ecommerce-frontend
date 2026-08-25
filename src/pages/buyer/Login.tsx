import { AuthHeader, LoginForm, Footer } from '@/components';

export default function Login() {
  return (
    <div className='flex min-h-screen flex-col'>
      <AuthHeader title='Đăng nhập' />

      <div className='flex flex-1 justify-center bg-linear-to-br from-[#EE4D2D] to-[#f9762d] px-6 pt-10 pb-16'>
        <LoginForm />
      </div>

      <Footer />
    </div>
  );
}
