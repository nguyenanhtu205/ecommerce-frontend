import { useEffect, useRef } from 'react';
import { useGetShopInformationForBuyer, useGetAssetById } from '@/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosChatbubbles } from 'react-icons/io';
import { CiShop } from 'react-icons/ci';
import { useChatWindowStore, useAuthStore } from '@/stores';

type ShopInfoCardProps = {
  shopId: string;
  onReady?: () => void;
  onVacationChange?: (isOnVacation: boolean) => void;
  onShopPage: boolean;
  shopDescription: string | null | undefined;
};

function formatDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split('-');

  return `${day}/${month}/${year}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getTodayDateOnly() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isShopVacationActive(
  vacation:
    | {
        isEnabled: boolean;
        startDate: string;
        endDate: string;
      }
    | null
    | undefined,
) {
  if (!vacation || !vacation.isEnabled) return false;

  const today = getTodayDateOnly();

  return today >= vacation.startDate && today <= vacation.endDate;
}

export default function ShopInfoCard({
  shopId,
  onReady,
  onVacationChange,
  onShopPage,
  shopDescription,
}: ShopInfoCardProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const startConversationWithShop = useChatWindowStore((state) => state.startConversationWithShop);
  const { data: shop, isPending, errorMessage } = useGetShopInformationForBuyer(shopId);
  const isShopOnVacation = isShopVacationActive(shop?.shopVacation);

  useEffect(() => {
    onVacationChange?.(isShopOnVacation);
  }, [isShopOnVacation, onVacationChange]);

  const hasAvatarId = !!shop?.shopAvatarUrl;

  const { data: asset, isPending: isAssetPending } = useGetAssetById(shop?.shopAvatarUrl ?? '');

  const avatarUrl = asset?.publicUrl ?? null;

  const isLoadingAvatar = hasAvatarId && isAssetPending;

  const hasNotifiedReady = useRef(false);
  useEffect(() => {
    if (hasNotifiedReady.current) return;
    if (!isPending && !isLoadingAvatar) {
      hasNotifiedReady.current = true;
      onReady?.();
    }
  }, [isPending, isLoadingAvatar, onReady]);

  if (isPending) {
    return (
      <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='h-16 w-16 animate-pulse rounded-full bg-slate-200' />
          <div className='space-y-2'>
            <div className='h-4 w-40 animate-pulse rounded bg-slate-200' />
            <div className='h-3 w-24 animate-pulse rounded bg-slate-200' />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !shop) {
    return null;
  }

  return (
    <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
      {isShopOnVacation && shop.shopVacation && (
        <div className='mb-4 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          <p className='font-medium'>Shop đang tạm đóng cửa</p>

          <p className='mt-1.5 text-xs'>
            {formatDate(shop.shopVacation.startDate)} - {formatDate(shop.shopVacation.endDate)}
          </p>

          {shop.shopVacation.message && (
            <p className='mt-1.5 text-xs text-amber-700'>
              <span className='font-semibold'>Lời nhắn: </span>
              {shop.shopVacation.message}
            </p>
          )}
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            to={`/shop/${shopId}`}
            className='flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EE4D2D]/10 text-lg font-bold text-[#EE4D2D]'
          >
            {isLoadingAvatar ? (
              <div className='h-full w-full animate-pulse rounded-full bg-slate-200' />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={shop.name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-500'>
                {getInitials(shop.name)}
              </div>
            )}
          </Link>
          <div>
            <p className='font-medium text-slate-800'>{shop.name}</p>
            {shop.location && <p className='mt-1 text-xs text-slate-400'>{shop.location}</p>}
            <p className='mt-1 text-xs text-slate-400'>Tham gia từ {formatDate(shop.createdAt)}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => {
              if (user === null) {
                navigate('/buyer/login');
              } else startConversationWithShop(shopId);
            }}
            className='flex cursor-pointer items-center gap-1.5 rounded-sm border border-[#EE4D2D] px-5 py-2 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'
          >
            <IoIosChatbubbles />
            Chat Ngay
          </button>
          {!onShopPage && (
            <Link
              to={`/shop/${shopId}`}
              className='flex cursor-pointer items-center gap-1.5 rounded-sm border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              <CiShop />
              Xem Shop
            </Link>
          )}
        </div>
      </div>

      {shopDescription && onShopPage && (
        <div className='mt-5 border-t border-slate-100 pt-4'>
          <p className='mb-2 text-xs text-[#EE4D2D]'>Giới thiệu Shop</p>
          <p className='text-sm leading-relaxed text-slate-600'>{shopDescription}</p>
        </div>
      )}

      {shop.carrierCodes.length > 0 && (
        <div className='mt-5 border-t border-slate-100 pt-4'>
          <p className='mb-2 text-xs text-[#EE4D2D]'>Đơn vị vận chuyển hỗ trợ</p>
          <div className='flex flex-wrap gap-2'>
            {shop.carrierCodes.map((code) => (
              <span
                key={code}
                className='rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'
              >
                {code.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
