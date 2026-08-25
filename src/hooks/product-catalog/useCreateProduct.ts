import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '@/utils';

type CreateProductPayload = {
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  condition: number;

  mediaAttachments: {
    mediaAssetId: string;
    role: string;
    position: number;
  }[];

  thumbnailMediaId: string;
  location: string;
  videoMediaId: string | null;
  galleryMediaIds: string[];

  specifications: {
    attributeId: string;
    title: string;
    value: string;
  }[];

  variantGroups: {
    name: string;
    options: {
      value: string;
      mediaId: string | null;
    }[];
  }[];

  variantCombinations: {
    combinationId: string | null;
    optionValues: string[];
    sku: string;
    initialPrice: number;
    initialStock: number;
  }[];

  shippingInfo: {
    weightGrams: number;
    length: number;
    width: number;
    height: number;
  };

  isPreOrder: boolean;
  preOrderDays: number | null;
};

export type CreateProductResponse = {
  id: string;
  shopId: string;
  categoryId: string;

  categoryPath: {
    id: string;
    name: string;
  }[];

  name: string;
  description: string;
  tags: string[];

  condition: string;
  status: string;

  thumbnailMediaId: string;
  videoMediaId: string | null;
  galleryMediaIds: string[];

  specifications: {
    attributeId: string;
    title: string;
    value: string;
  }[];

  variantGroups: {
    name: string;
    options: {
      value: string;
      mediaId: string | null;
    }[];
  }[];

  variantCombinations: {
    combinationId: string | null;
    optionValues: string[];
    sku: string;
    initialPrice: number;
    initialStock: number;
  }[];

  shippingInfo: {
    weightGrams: number;
    length: number;
    width: number;
    height: number;
  };

  isPreOrder: boolean;
  preOrderDays: number | null;

  createdAt: string;
  updatedAt: string;
};

const useCreateProduct = () => {
  const navigate = useNavigate();

  const {
    mutate: createProduct,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: CreateProductPayload): Promise<CreateProductResponse> => {
      const response = await axiosPrivate.post<CreateProductResponse>(
        '/product-catalog/products',
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      alert('Tạo sản phẩm thành công!');
      navigate('/seller/products/all');
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { createProduct, isPending, errorMessage };
};

export default useCreateProduct;
