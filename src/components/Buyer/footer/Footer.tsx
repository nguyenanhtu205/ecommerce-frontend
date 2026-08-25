import { Link } from 'react-router-dom';

type FooterColumn = {
  title: string;
  links: string[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'DỊCH VỤ KHÁCH HÀNG',
    links: [
      'Trung Tâm Trợ Giúp',
      'Shopee Blog',
      'Shopee Mall',
      'Hướng Dẫn Mua Hàng',
      'Hướng Dẫn Bán Hàng',
      'Ship Hàng',
      'Trả Hàng & Hoàn Tiền',
      'Chăm Sóc Khách Hàng',
    ],
  },
  {
    title: 'SHOPEE VIỆT NAM',
    links: [
      'Về Shopee',
      'Tuyển Dụng',
      'Điều Khoản Shopee',
      'Chính Sách Bảo Mật',
      'Chính Hãng',
      'Kênh Người Bán',
      'Flash Sale',
      'Chương Trình Tiếp Thị Liên Kết',
    ],
  },
  {
    title: 'THANH TOÁN',
    links: ['VN Pay', 'Zalo Pay', 'Momo'],
  },
  {
    title: 'ĐƠN VỊ VẬN CHUYỂN',
    links: ['Giao Hàng Nhanh', 'Giao Hàng Tiết Kiệm', 'Viettel Post', 'J&T Express', 'Ninja Van'],
  },
];

export default function Footer() {
  return (
    <footer className='border-t border-slate-200 bg-white'>
      <div className='mx-auto max-w-7xl px-4 py-10'>
        <div className='grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4'>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className='mb-4 text-[13px] font-semibold text-slate-500'>{col.title}</h4>
              <ul className='space-y-2.5'>
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to='#' className='text-[13px] text-slate-500 hover:text-[#EE4D2D]'>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Socials + App download */}
        <div className='mt-10 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8 sm:grid-cols-2'>
          <div>
            <h4 className='mb-4 text-[13px] font-semibold text-slate-500'>THEO DÕI CHÚNG TÔI</h4>
            <div className='flex flex-wrap gap-3'>
              {['Facebook', 'Instagram', 'LinkedIn'].map((s) => (
                <Link
                  key={s}
                  to='#'
                  className='rounded-sm border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className='mb-4 text-[13px] font-semibold text-slate-500'>TẢI ỨNG DỤNG SHOPEE</h4>
            <div className='flex gap-3'>
              <div className='flex h-16 w-16 items-center justify-center rounded-sm border border-slate-200 text-[10px] text-slate-400'>
                QR Code
              </div>
              <div className='flex flex-col justify-center gap-2'>
                <span className='rounded-sm border border-slate-200 px-3 py-1.5 text-center text-[11px] text-slate-500'>
                  App Store
                </span>
                <span className='rounded-sm border border-slate-200 px-3 py-1.5 text-center text-[11px] text-slate-500'>
                  Google Play
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className='border-t border-slate-100 bg-slate-50 py-6'>
        <div className='mx-auto max-w-7xl px-4 text-center text-xs text-slate-400'>
          © {new Date().getFullYear()} Shopee Clone. Được xây dựng cho mục đích học tập.
        </div>
      </div>
    </footer>
  );
}
