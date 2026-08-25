import { type Notification } from '@/types';

export const MOCK_SYSTEM_NOTIFICATIONS: Notification[] = [];

export const MOCK_ORDER_NOTIFICATIONS: Notification[] = [];

export const MOCK_PROMOTION_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    category: 'promotion',
    title: 'Quà tặng miễn phí dành cho bạn mới',
    content: '🎁 Bạn ơi, rinh quà miễn phí ngay! 🎈 Số lượng có hạn. Nhanh tay kẻo lỡ!',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNcW9BILvOWAGvJFTm7fQg7YbaKL3UEla1nagCJxw5OA&s=10',
    link: '#',
    isRead: false,
    createdAt: '13:46 10-07-2026',
  },
  {
    id: 2,
    category: 'promotion',
    title: 'Voucher dành riêng cho bạn mới đang chờ!',
    content:
      '🥳 Bạn ơi, đừng quên tận hưởng ngay voucher giảm giá 60.000₫ và Freeship toàn quốc cho đơn đầu tiên! 🙌 Nhanh tay sử dụng nào!',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-y-IYbKXFn5hnwFvMzVbqELAImVhKU29aZZH-gnecw&s=10',
    link: '#',
    isRead: true,
    createdAt: '12:46 10-07-2026',
  },
  {
    id: 3,
    category: 'promotion',
    title: 'Quà đặc biệt DUY NHẤT đơn đầu tiên!',
    content:
      '🎉 Đơn đầu giảm SHOCK 60.000₫! 🚚 Freeship toàn quốc dành cho bạn mới 🤗 Duy nhất cho đơn đầu tiên. Nhanh tay chốt đơn ngay!',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Hj4i8L62ZBGWXh8E_2N08X1f9GkSBVw3kugF_pjftg&s=10',
    link: '#',
    isRead: true,
    createdAt: '12:26 10-07-2026',
  },
];
