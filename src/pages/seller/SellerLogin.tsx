import { AuthHeader, LoginForm, Footer } from '@/components';

export default function SellerLogin() {
  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <AuthHeader title='Kênh Người Bán' />

      <div className='mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:items-start lg:justify-between'>
        {/* Branding bên trái */}
        <div className='max-w-md text-center lg:pt-6 lg:text-left'>
          <h1 className='text-3xl font-bold text-[#EE4D2D] md:text-4xl'>Bán hàng chuyên nghiệp</h1>
          <p className='mt-3 text-base leading-relaxed text-slate-500'>
            Quản lý shop của bạn một cách hiệu quả hơn trên Shopee với Shopee - Kênh Người bán
          </p>
          <img
            src='https://deo.shopeemobile.com/shopee/shopee-buyeruserfetoc-live-sg/assets/9019759f347a781f.png'
            alt='Bán hàng chuyên nghiệp cùng Shopee'
            className='mx-auto mt-8 w-full max-w-sm lg:mx-0'
          />
        </div>

        <div className='shrink-0'>
          <LoginForm registerHref='/seller/register' isSeller={true} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
