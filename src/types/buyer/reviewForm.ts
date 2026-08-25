export type ReviewAttributeValue = {
  label: string;
  value: string;
};

export type ReviewMediaDraft = {
  assetId: string;
  previewUrl: string;
  type: 'image' | 'video';
};

export type ReviewFormData = {
  orderItemId: string;
  rating: number;
  comment: string;
  attributes: ReviewAttributeValue[];
  media: ReviewMediaDraft[];
};
