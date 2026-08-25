export function safeParseDate(iso: string): Date {
  const truncated = iso.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:\d{2})$/, '$1$2');
  return new Date(truncated);
}

export function formatMessageTime(iso: string): string {
  const date = safeParseDate(iso);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function formatConversationTime(iso: string): string {
  const date = safeParseDate(iso);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Hôm qua';

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString('vi-VN', { weekday: 'long' });
  }

  return date.toLocaleDateString('vi-VN');
}
