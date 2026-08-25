import { useState } from 'react';
import { type CategoryItem } from '@/types';
import { Link } from 'react-router-dom';

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: '1',
    name: 'Thời Trang Nam',
    image:
      'https://down-vn.img.susercontent.com/file/687f3967b7c2fe6a134a2c11894eea4b@resize_w640_nl.webp',
    slug: 'thoi-trang-nam',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '2',
    name: 'Thời Trang Nữ',
    image:
      'https://down-vn.img.susercontent.com/file/75ea42f9eca124e9cb3cde744c060e4d@resize_w640_nl.webp',
    slug: 'thoi-trang-nu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '3',
    name: 'Điện Thoại & Phụ Kiện',
    image:
      'https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w640_nl.webp',
    slug: 'dien-thoai-phu-kien',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '4',
    name: 'Mẹ & Bé',
    image:
      'https://down-vn.img.susercontent.com/file/099edde1ab31df35bc255912bab54a5e@resize_w640_nl.webp',
    slug: 'me-be',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '5',
    name: 'Thiết Bị Điện Tử',
    image:
      'https://down-vn.img.susercontent.com/file/978b9e4cb61c611aaaf58664fae133c5@resize_w640_nl.webp',
    slug: 'thiet-bi-dien-tu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '6',
    name: 'Nhà Cửa & Đời Sống',
    image:
      'https://down-vn.img.susercontent.com/file/24b194a695ea59d384768b7b471d563f@resize_w640_nl.webp',
    slug: 'nha-cua-doi-song',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '7',
    name: 'Máy Tính & Laptop',
    image:
      'https://down-vn.img.susercontent.com/file/c3f3edfaa9f6dafc4825b77d8449999d@resize_w640_nl.webp',
    slug: 'may-tinh-laptop',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '8',
    name: 'Sắc Đẹp',
    image:
      'https://down-vn.img.susercontent.com/file/ef1f336ecc6f97b790d5aae9916dcb72@resize_w640_nl.webp',
    slug: 'sac-dep',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '9',
    name: 'Máy Ảnh & Máy Quay Phim',
    image:
      'https://down-vn.img.susercontent.com/file/ec14dd4fc238e676e43be2a911414d4d@resize_w640_nl.webp',
    slug: 'may-anh-may-quay-phim',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '10',
    name: 'Sức Khỏe',
    image:
      'https://down-vn.img.susercontent.com/file/49119e891a44fa135f5f6f5fd4cfc747@resize_w640_nl.webp',
    slug: 'suc-khoe',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '11',
    name: 'Đồng Hồ',
    image:
      'https://down-vn.img.susercontent.com/file/86c294aae72ca1db5f541790f7796260@resize_w640_nl.webp',
    slug: 'dong-ho',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '12',
    name: 'Giày Dép Nữ',
    image:
      'https://down-vn.img.susercontent.com/file/48630b7c76a7b62bc070c9e227097847@resize_w640_nl.webp',
    slug: 'giay-dep-nu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '13',
    name: 'Giày Dép Nam',
    image:
      'https://down-vn.img.susercontent.com/file/74ca517e1fa74dc4d974e5d03c3139de@resize_w640_nl.webp',
    slug: 'giay-dep-nam',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '14',
    name: 'Túi Ví Nữ',
    image:
      'https://down-vn.img.susercontent.com/file/fa6ada2555e8e51f369718bbc92ccc52@resize_w640_nl.webp',
    slug: 'tui-vi-nu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '15',
    name: 'Thiết Bị Điện Gia Dụng',
    image:
      'https://down-vn.img.susercontent.com/file/7abfbfee3c4844652b4a8245e473d857@resize_w640_nl.webp',
    slug: 'thiet-bi-dien-gia-dung',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '16',
    name: 'Phụ Kiện & Trang Sức Nữ',
    image:
      'https://down-vn.img.susercontent.com/file/8e71245b9659ea72c1b4e737be5cf42e@resize_w640_nl.webp',
    slug: 'phu-kien-trang-suc-nu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '17',
    name: 'Thể Thao & Du Lịch',
    image:
      'https://down-vn.img.susercontent.com/file/6cb7e633f8b63757463b676bd19a50e4@resize_w640_nl.webp',
    slug: 'the-thao-du-lich',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '18',
    name: 'Bách Hóa Online',
    image:
      'https://down-vn.img.susercontent.com/file/c432168ee788f903f1ea024487f2c889@resize_w640_nl.webp',
    slug: 'bach-hoa-online',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '19',
    name: 'Ô Tô & Xe Máy & Xe Đạp',
    image:
      'https://down-vn.img.susercontent.com/file/3fb459e3449905545701b418e8220334@resize_w640_nl.webp',
    slug: 'o-to-xe-may-xe-dap',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '20',
    name: 'Nhà Sách Online',
    image:
      'https://down-vn.img.susercontent.com/file/36013311815c55d303b0e6c62d6a8139@resize_w640_nl.webp',
    slug: 'nha-sach-online',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '21',
    name: 'Balo & Túi Ví Nam',
    image:
      'https://down-vn.img.susercontent.com/file/18fd9d878ad946db2f1bf4e33760c86f@resize_w640_nl.webp',
    slug: 'balo-tui-vi-nam',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '22',
    name: 'Thời Trang Trẻ Em',
    image:
      'https://down-vn.img.susercontent.com/file/4540f87aa3cbe99db739f9e8dd2cdaf0@resize_w640_nl.webp',
    slug: 'thoi-trang-tre-em',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '23',
    name: 'Đồ Chơi',
    image:
      'https://down-vn.img.susercontent.com/file/ce8f8abc726cafff671d0e5311caa684@resize_w640_nl.webp',
    slug: 'do-choi',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '24',
    name: 'Giặt Giũ & Chăm Sóc Nhà Cửa',
    image:
      'https://down-vn.img.susercontent.com/file/cd8e0d2e6c14c4904058ae20821d0763@resize_w640_nl.webp',
    slug: 'giat-giu-cham-soc-nha-cua',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '25',
    name: 'Chăm Sóc Thú Cưng',
    image:
      'https://down-vn.img.susercontent.com/file/cdf21b1bf4bfff257efe29054ecea1ec@resize_w640_nl.webp',
    slug: 'cham-soc-thu-cung',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '26',
    name: 'Voucher & Dịch Vụ',
    image:
      'https://down-vn.img.susercontent.com/file/b0f78c3136d2d78d49af71dd1c3f38c1@resize_w640_nl.webp',
    slug: 'voucher-dich-vu',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
  {
    id: '27',
    name: 'Dụng Cụ & Thiết Bị Tiện Ích',
    image:
      'https://down-vn.img.susercontent.com/file/e4fbccba5e1189d1141b9d6188af79c0@resize_w640_nl.webp',
    slug: 'dung-cu-thiet-bi-tien-ich',
    parentId: null,
    path: [],
    level: 1,
    isLeaf: false,
  },
];

const PAGE_SIZE = 20;

export default function CategoryGrid() {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(CATEGORY_ITEMS.length / PAGE_SIZE);

  const items = CATEGORY_ITEMS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className='relative my-6 rounded-sm bg-white p-4 shadow-sm'>
      <h2 className='mb-4 text-lg text-gray-600 uppercase'>Danh mục</h2>

      <div className='grid grid-cols-10 grid-rows-2'>
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/${item.slug}`}
            className='group flex h-40 flex-col items-center justify-center gap-3 border border-gray-100 p-2 transition hover:shadow-sm'
            title={item.name}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className='h-16 w-16 object-contain transition-transform duration-200 group-hover:scale-105'
                loading='lazy'
              />
            )}
            <span className='line-clamp-2 text-center text-sm text-gray-700 group-hover:text-[#EE4D2D]'>
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {page > 0 && (
        <button
          onClick={() => setPage(page - 1)}
          className='absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-200 shadow-lg transition hover:scale-110'
        >
          ←
        </button>
      )}

      {page < totalPages - 1 && (
        <button
          onClick={() => setPage(page + 1)}
          className='absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-200 shadow-lg transition hover:scale-110'
        >
          →
        </button>
      )}
    </section>
  );
}
