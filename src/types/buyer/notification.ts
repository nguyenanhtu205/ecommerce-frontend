export type NotificationCategory = 'order' | 'promotion' | 'system';

export type Notification = {
  id: number;
  category: NotificationCategory;
  title: string;
  content: string;
  imageUrl?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};
