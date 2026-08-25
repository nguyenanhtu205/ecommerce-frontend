import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import type { Message } from './useGetMessages';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
const RECONNECT_DELAY_MS = 3000;

const TOKEN_EXPIRED_CLOSE_CODE = 1008;
const TOKEN_EXPIRED_REASON = 'token expired';
const ABNORMAL_CLOSE_CODE = 1006;

type Attachment = {
  mediaAssetId: string;
  role: 'chat_image' | 'chat_video';
};

type SendPayload = {
  content?: string;
  attachments?: Attachment[];
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshDone = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const handleLogout = () => {
  useAuthStore.getState().clearAuth();
  alert('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh(resolve);
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh-user-token`,
      {},
      { withCredentials: true },
    );

    const newToken: string = response.data.accessToken;
    const user = useAuthStore.getState().user;
    if (user) {
      useAuthStore.getState().setAuth(user, newToken);
    }

    isRefreshing = false;
    onRefreshDone(newToken);
    return newToken;
  } catch (err) {
    isRefreshing = false;
    onRefreshDone(null);
    handleLogout();
    return null;
  }
};

const useChatSocket = (conversationId: string, options?: { enabled?: boolean }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldConnectRef = useRef(options?.enabled ?? true);
  const queryClient = useQueryClient();

  const connect = useCallback(
    (tokenOverride?: string) => {
      if (!conversationId || !shouldConnectRef.current) return;

      const token = tokenOverride ?? useAuthStore.getState().accessToken;
      if (!token) {
        console.warn('[useChatSocket] no token, skip connect');
        return;
      }

      const url = `${WS_BASE_URL}/chat/ws?conversationId=${conversationId}&token=${token}`;
      console.log('[useChatSocket] connecting to', url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[useChatSocket] connected', conversationId);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          queryClient.setQueryData(['messages', conversationId], (old: any) => {
            if (!old) return old;
            const pages = [...old.pages];
            const alreadyExists = pages.some((page: Message[]) =>
              page.some((m) => m.id === message.id),
            );
            if (alreadyExists) return old;
            pages[0] = [message, ...pages[0]];
            return { ...old, pages };
          });
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (err) {
          console.error('[useChatSocket] failed to process WS message:', err);
        }
      };

      ws.onclose = async (event) => {
        setIsConnected(false);
        if (!shouldConnectRef.current) return;

        const isTokenExpired =
          event.code === TOKEN_EXPIRED_CLOSE_CODE && event.reason === TOKEN_EXPIRED_REASON;
        const isAbnormal = event.code === ABNORMAL_CLOSE_CODE;

        if (isTokenExpired || isAbnormal) {
          const newToken = await refreshAccessToken();
          if (newToken && shouldConnectRef.current) {
            connect(newToken);
          }
          return;
        }

        reconnectTimerRef.current = setTimeout(() => connect(), RECONNECT_DELAY_MS);
      };

      ws.onerror = (err) => {
        console.error('[useChatSocket] error', err);
        ws.close();
      };

      wsRef.current = ws;
    },
    [conversationId, queryClient],
  );

  useEffect(() => {
    shouldConnectRef.current = options?.enabled ?? true;
    if (shouldConnectRef.current) {
      connect();
    }

    return () => {
      shouldConnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, options?.enabled]);

  const sendMessage = useCallback((payload: SendPayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { isConnected, sendMessage };
};

export default useChatSocket;
