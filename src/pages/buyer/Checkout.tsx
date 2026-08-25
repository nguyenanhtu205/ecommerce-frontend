import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiShopee } from 'react-icons/si';
import {
  Footer,
  CheckoutAddressCard,
  CheckoutShopSection,
  ShopeeVoucherSection,
  PaymentMethodSection,
  AddressListModal,
  AddressModal,
} from '@/components';
import {
  useGetAddresses,
  useGetSelectedItemForCheckout,
  useGetMultipleAssets,
  useGetShopsShippingInfo,
  useCalculateShippingFee,
  useCheckout,
  useGetCheckoutStatus,
  useRemoveCartItems,
} from '@/hooks';
import type {
  CheckoutShopGroup,
  ShopeeVoucherSelection,
  ShopeeXuInfo,
  PaymentMethod,
  Address,
  AddressType,
  CheckoutShippingMethod,
} from '@/types';

const CARRIER_LABEL: Record<string, string> = {
  mock: 'Giao hàng thử nghiệm',
  ghn: 'Giao hàng nhanh',
  ghtk: 'Giao hàng tiết kiệm',
};

const ADDRESS_TYPE_MAP: Record<number, AddressType> = {
  0: 'home',
  1: 'office',
};

const TERMINAL_SAGA_STATES = ['Completed', 'Cancelled'];

const MOCK_SHOPEE_VOUCHER: ShopeeVoucherSelection = { code: null, discountAmount: 0 };
const MOCK_SHOPEE_XU: ShopeeXuInfo = {
  availableAmount: 0,
  isUsable: false,
  isApplied: false,
  disabledReason: 'Không thể sử dụng Xu',
};
const MOCK_PAYMENT_METHOD: PaymentMethod = { type: 'cod', label: 'Thanh toán khi nhận hàng' };

export default function Checkout() {
  const navigate = useNavigate();

  const [shopGroups, setShopGroups] = useState<CheckoutShopGroup[]>([]);
  const [shopeeVoucher] = useState<ShopeeVoucherSelection>(MOCK_SHOPEE_VOUCHER);
  const [shopeeXu, setShopeeXu] = useState<ShopeeXuInfo>(MOCK_SHOPEE_XU);
  const [paymentMethod] = useState<PaymentMethod>(MOCK_PAYMENT_METHOD);

  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null | undefined>(undefined);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  const [checkoutBatchId, setCheckoutBatchId] = useState<string | null>(null);
  const [checkedOutCombinationIds, setCheckedOutCombinationIds] = useState<string[]>([]);
  const { removeCartItems } = useRemoveCartItems();

  const {
    data: addressesData,
    isPending: isAddressesPending,
    errorMessage: addressesErrorMessage,
  } = useGetAddresses();

  const {
    data: cartData,
    isPending: isCartPending,
    errorMessage: cartErrorMessage,
  } = useGetSelectedItemForCheckout();

  const thumbnailAssetIds = useMemo(() => {
    if (!cartData) return [];
    const ids = cartData.flatMap((shop) => shop.items.map((item) => item.thumbnailUrl));
    return Array.from(new Set(ids));
  }, [cartData]);

  const { data: assetsData } = useGetMultipleAssets(
    { assetIds: thumbnailAssetIds },
    { enabled: thumbnailAssetIds.length > 0 },
  );

  const thumbnailUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    assetsData?.items.forEach((entry) => {
      if (entry.found) map.set(entry.id, entry.asset.publicUrl);
    });
    return map;
  }, [assetsData]);

  const shopIds = useMemo(() => {
    if (!cartData) return [];
    return Array.from(new Set(cartData.map((shop) => shop.shopId)));
  }, [cartData]);

  const { data: shippingInfoData, isPending: isShippingInfoPending } = useGetShopsShippingInfo(
    { shopIds },
    { enabled: Boolean(cartData) && shopIds.length > 0 },
  );

  const carrierOptionsByShopId = useMemo(() => {
    const map = new Map<string, string[]>();
    shippingInfoData?.forEach((entry) => {
      map.set(entry.id, entry.carrierCode);
    });
    return map;
  }, [shippingInfoData]);

  const isShippingInfoLoading = !cartData || isShippingInfoPending;

  const addresses: Address[] = useMemo(
    () =>
      (addressesData ?? [])
        .map((item) => ({
          id: item.id,
          fullName: item.fullName,
          phone: item.phone,
          province: item.province,
          ward: item.ward,
          addressDetail: item.addressDetail,
          fullAddressText: item.fullAddressText,
          addressType: ADDRESS_TYPE_MAP[item.addressType] ?? 'home',
          isDefault: item.isDefault,
        }))
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [addressesData],
  );

  useEffect(() => {
    if (selectedAddressId === undefined && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const hasNoAddress = !isAddressesPending && !addressesErrorMessage && addresses.length === 0;
  const isNewAddressDefault = addresses.length === 0;

  const derivedShopGroups: CheckoutShopGroup[] = useMemo(() => {
    if (!cartData) return [];
    return cartData.map((shop) => {
      const carrierOptions = carrierOptionsByShopId.get(shop.shopId) ?? [];
      const defaultCarrierCode = carrierOptions[0] ?? '';

      const shippingMethod: CheckoutShippingMethod = {
        carrierCode: defaultCarrierCode,
        carrierName: CARRIER_LABEL[defaultCarrierCode] ?? '',
        estimatedDeliveryStart: null,
        estimatedDeliveryEnd: null,
        fee: 0,
        isValid: true,
        failureReason: null,
      };

      return {
        shopId: shop.shopId,
        shopName: shop.shopName,
        isFavorite: false, // TODO: API chưa trả về
        items: shop.items.map((item) => ({
          id: item.combinationId,
          productId: item.productId,
          productName: item.productName,
          thumbnail: thumbnailUrlMap.get(item.thumbnailUrl) ?? '',
          variation: item.variation,
          quantity: item.quantity,
          price: item.priceSnapshot,
        })),
        protectionAddons: [], // TODO: API chưa trả về addon bảo vệ
        voucher: { code: null, discountAmount: 0 }, // TODO: API chưa trả về voucher shop
        note: '',
        shippingMethod,
      };
    });
  }, [cartData, thumbnailUrlMap, carrierOptionsByShopId]);

  useEffect(() => {
    setShopGroups((prev) => {
      const prevByShopId = new Map(prev.map((g) => [g.shopId, g]));
      return derivedShopGroups.map((group) => {
        const prevGroup = prevByShopId.get(group.shopId);
        if (!prevGroup) return group;

        const carrierOptions = carrierOptionsByShopId.get(group.shopId) ?? [];
        const keepPrevCarrier = carrierOptions.includes(prevGroup.shippingMethod.carrierCode);

        return {
          ...group,
          note: prevGroup.note,
          protectionAddons: prevGroup.protectionAddons,
          voucher: prevGroup.voucher,
          shippingMethod: keepPrevCarrier ? prevGroup.shippingMethod : group.shippingMethod,
        };
      });
    });
  }, [derivedShopGroups, carrierOptionsByShopId]);

  const {
    calculateShippingFee,
    isPending: isFeeCalculating,
    errorMessage: feeErrorMessage,
  } = useCalculateShippingFee();

  const shippingRequestPayload = useMemo(() => {
    if (!cartData || !selectedAddress || shopGroups.length === 0) return null;

    const shops = cartData.map((shop) => {
      const shippingInfo = shippingInfoData?.find((s) => s.id === shop.shopId);
      const group = shopGroups.find((g) => g.shopId === shop.shopId);
      if (!shippingInfo || !group || !group.shippingMethod.carrierCode) return null;

      return {
        shopId: shop.shopId,
        carrierCode: group.shippingMethod.carrierCode,
        pickupProvince: shippingInfo.province,
        pickupWard: shippingInfo.ward,
        items: shop.items.map((item) => ({
          combinationId: item.combinationId,
          quantity: item.quantity,
          weightGram: item.shippingInfo.weightGrams,
          length: item.shippingInfo.dimensions.length,
          width: item.shippingInfo.dimensions.width,
          height: item.shippingInfo.dimensions.height,
        })),
      };
    });

    if (shops.some((s) => s === null)) return null;

    return {
      deliveryProvince: selectedAddress.province,
      deliveryWard: selectedAddress.ward,
      shops: shops as Exclude<(typeof shops)[number], null>[],
    };
  }, [cartData, selectedAddress, shopGroups, shippingInfoData]);

  const shippingRequestKey = shippingRequestPayload ? JSON.stringify(shippingRequestPayload) : null;

  useEffect(() => {
    if (!shippingRequestPayload) return;

    calculateShippingFee(shippingRequestPayload, {
      onSuccess: (data) => {
        setShopGroups((prev) =>
          prev.map((g) => {
            const entry = data.find((d) => d.shopId === g.shopId);
            if (!entry) return g;
            return {
              ...g,
              shippingMethod: {
                ...g.shippingMethod,
                fee: entry.fee,
                estimatedDeliveryStart: entry.estimatedStart,
                estimatedDeliveryEnd: entry.estimatedEnd,
                isValid: entry.isValid,
                failureReason: entry.failureReason,
              },
            };
          }),
        );
      },
    });
  }, [shippingRequestKey]);

  const isShippingPending = isShippingInfoLoading || isFeeCalculating;

  const handleToggleAddon = (shopId: string, addonId: number) => {
    setShopGroups((prev) =>
      prev.map((g) =>
        g.shopId === shopId
          ? {
              ...g,
              protectionAddons: g.protectionAddons.map((a) =>
                a.id === addonId ? { ...a, isSelected: !a.isSelected } : a,
              ),
            }
          : g,
      ),
    );
  };

  const handleNoteChange = (shopId: string, note: string) => {
    setShopGroups((prev) => prev.map((g) => (g.shopId === shopId ? { ...g, note } : g)));
  };

  const handleChangeShippingMethod = (shopId: string, carrierCode: string) => {
    setShopGroups((prev) =>
      prev.map((g) =>
        g.shopId === shopId
          ? {
              ...g,
              shippingMethod: {
                ...g.shippingMethod,
                carrierCode,
                carrierName: CARRIER_LABEL[carrierCode] ?? carrierCode,
                fee: 0,
                estimatedDeliveryStart: null,
                estimatedDeliveryEnd: null,
                isValid: true,
                failureReason: null,
              },
            }
          : g,
      ),
    );
  };

  const handleToggleXu = () => {
    setShopeeXu((prev) => ({ ...prev, isApplied: !prev.isApplied }));
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setShowAddressListModal(false);
  };

  const handleOpenEditAddress = (address: Address) => {
    setEditingAddress(address);
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
  };

  const handleSaveAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setEditingAddress(undefined);
    setShowAddressListModal(false);
  };

  const summary = useMemo(() => {
    const merchandiseSubtotal = shopGroups.reduce((sum, g) => {
      const itemsTotal = g.items.reduce((s, item) => s + item.price * item.quantity, 0);
      const addonTotal = g.protectionAddons
        .filter((a) => a.isSelected)
        .reduce((s, a) => s + a.price, 0);
      return sum + itemsTotal + addonTotal;
    }, 0);
    const shippingFeeSubtotal = shopGroups.reduce((sum, g) => sum + g.shippingMethod.fee, 0);
    const voucherDiscount =
      shopGroups.reduce((sum, g) => sum + g.voucher.discountAmount, 0) +
      shopeeVoucher.discountAmount;
    const xuDiscount = shopeeXu.isApplied ? shopeeXu.availableAmount : 0;

    return {
      merchandiseSubtotal,
      shippingFeeSubtotal,
      voucherDiscount,
      xuDiscount,
      totalPayment: merchandiseSubtotal + shippingFeeSubtotal - voucherDiscount - xuDiscount,
    };
  }, [shopGroups, shopeeVoucher, shopeeXu]);

  const hasInvalidShipping = shopGroups.some((g) => !g.shippingMethod.isValid);
  const hasNoItems = !isCartPending && !cartErrorMessage && shopGroups.length === 0;

  const {
    checkout,
    isPending: isCheckoutPending,
    errorMessage: checkoutErrorMessage,
    reset: resetCheckout,
  } = useCheckout();

  const { data: checkoutStatusData, errorMessage: checkoutStatusErrorMessage } =
    useGetCheckoutStatus(
      { checkoutBatchId: checkoutBatchId ?? '' },
      { enabled: Boolean(checkoutBatchId) },
    );

  const isPlacingOrder =
    isCheckoutPending ||
    (Boolean(checkoutBatchId) &&
      !(checkoutStatusData && TERMINAL_SAGA_STATES.includes(checkoutStatusData.sagaState)));

  useEffect(() => {
    if (!checkoutStatusData) return;

    if (checkoutStatusData.sagaState === 'Completed') {
      if (checkedOutCombinationIds.length > 0) {
        removeCartItems(checkedOutCombinationIds, {
          onSettled: () => navigate('/user/purchase/all'),
        });
      } else {
        navigate('/user/purchase/all');
      }
      return;
    }

    if (checkoutStatusData.sagaState === 'Cancelled') {
      navigate('/cart', {
        state: {
          checkoutError:
            checkoutStatusData.failReason ?? 'Đặt hàng không thành công. Vui lòng thử lại.',
        },
      });
    }
  }, [checkoutStatusData, navigate, checkedOutCombinationIds, removeCartItems]);
  const handlePlaceOrder = () => {
    if (!selectedAddress || hasInvalidShipping || isPlacingOrder) return;

    resetCheckout();
    setCheckoutBatchId(null);

    const cartItems = shopGroups.flatMap((g) =>
      g.items.map((item) => ({
        combinationId: item.id,
        quantity: item.quantity,
        variation: item.variation,
      })),
    );

    setCheckedOutCombinationIds(cartItems.map((item) => item.combinationId)); // thêm dòng này

    const shopInfos = shopGroups.map((g) => ({
      shopId: g.shopId,
      carrierCode: g.shippingMethod.carrierCode,
      shopVoucherCode: null,
      note: g.note || null,
    }));

    checkout(
      {
        cartItems,
        shopInfos,
        shippingAddressId: selectedAddress.id,
        paymentMethod: 'cod',
        platformVoucherCode: null,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.checkoutBatchId) {
            setCheckoutBatchId(data.checkoutBatchId);
          }
        },
      },
    );
  };

  return (
    <div className='bg-[#F5F5F5]'>
      <div className='border-b border-slate-100 bg-white py-4'>
        <div className='mx-auto flex max-w-7xl items-center gap-10 px-4'>
          <div className='flex items-center'>
            <Link to='/' className='flex shrink-0 items-center gap-2'>
              <SiShopee className='h-10 w-10 pb-1 text-[#EE4D2D]' />
              <span className='text-2xl text-[#EE4D2D]'>Shopee</span>
            </Link>

            <div className='mx-4 h-8 w-0.5 bg-[#EE4D2D]' />

            <span className='text-lg text-[#EE4D2D]'>Thanh toán</span>
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-5xl px-4 py-6'>
        {selectedAddress ? (
          <CheckoutAddressCard
            address={selectedAddress}
            onChange={() => setShowAddressListModal(true)}
          />
        ) : (
          !isAddressesPending && (
            <div className='flex items-center justify-between bg-white px-6 py-5 shadow-sm'>
              <p className='text-sm text-slate-500'>
                {addressesErrorMessage ?? 'Bạn chưa có địa chỉ nhận hàng.'}
              </p>
              <button
                onClick={handleOpenAddAddress}
                className='cursor-pointer text-sm text-sky-600 hover:underline'
              >
                Thêm địa chỉ
              </button>
            </div>
          )
        )}

        {isCartPending && (
          <div className='mt-3 space-y-3 bg-white p-6 shadow-sm'>
            <div className='h-5 w-32 animate-pulse rounded bg-slate-200' />
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className='flex items-center gap-4 py-3'>
                <div className='h-16 w-16 shrink-0 animate-pulse rounded bg-slate-200' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-3/4 animate-pulse rounded bg-slate-200' />
                  <div className='h-4 w-1/3 animate-pulse rounded bg-slate-200' />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCartPending && cartErrorMessage && (
          <div className='mt-3 bg-white px-6 py-5 shadow-sm'>
            <p className='text-sm text-red-500'>{cartErrorMessage}</p>
          </div>
        )}

        {!isCartPending && !cartErrorMessage && feeErrorMessage && (
          <div className='mt-3 bg-white px-6 py-3 shadow-sm'>
            <p className='text-sm text-red-500'>{feeErrorMessage}</p>
          </div>
        )}

        {!isCartPending &&
          !cartErrorMessage &&
          shopGroups.map((group) => (
            <CheckoutShopSection
              key={group.shopId}
              shopId={group.shopId}
              group={group}
              carrierOptions={carrierOptionsByShopId.get(group.shopId) ?? []}
              isShippingPending={isShippingPending}
              onToggleAddon={handleToggleAddon}
              onNoteChange={handleNoteChange}
              onChangeShippingMethod={handleChangeShippingMethod}
            />
          ))}

        <ShopeeVoucherSection voucher={shopeeVoucher} xu={shopeeXu} onToggleXu={handleToggleXu} />

        <PaymentMethodSection
          paymentMethod={paymentMethod}
          summary={summary}
          onChangeMethod={() => console.log('Đổi phương thức thanh toán')}
          onPlaceOrder={handlePlaceOrder}
          disabled={
            hasNoAddress || hasNoItems || hasInvalidShipping || isPlacingOrder || isShippingPending
          }
          isSubmitting={isPlacingOrder}
          errorMessage={checkoutErrorMessage ?? checkoutStatusErrorMessage}
          disabledMessage={
            hasNoAddress
              ? 'Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng'
              : hasNoItems
                ? 'Không có sản phẩm nào để đặt hàng'
                : hasInvalidShipping
                  ? 'Vui lòng chọn lại phương thức vận chuyển hợp lệ'
                  : undefined
          }
        />
      </div>
      {showAddressListModal && (
        <AddressListModal
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onClose={() => setShowAddressListModal(false)}
          onSelect={handleSelectAddress}
          onEdit={handleOpenEditAddress}
          onAddNew={handleOpenAddAddress}
        />
      )}

      <AddressModal
        open={editingAddress !== undefined}
        initialAddress={editingAddress}
        onClose={() => setEditingAddress(undefined)}
        onSave={handleSaveAddress}
        isDefault={isNewAddressDefault}
        isPickUpAddress={false}
      />

      <Footer />
    </div>
  );
}
