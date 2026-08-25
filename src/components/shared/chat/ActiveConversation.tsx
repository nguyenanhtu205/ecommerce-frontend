import { useEffect, useRef, useState } from 'react';
import { CiImageOn } from 'react-icons/ci';
import { GoVideo } from 'react-icons/go';
import { RiSendPlaneLine } from 'react-icons/ri';
import {
  useRequestUpload,
  useConfirmUpload,
  useResolveAttachments,
  useMarkConversationAsRead,
  useSendMessage,
  useChatSocket,
  useGetMessages,
  useConversationPeerInfo,
  type ResolvedAsset,
} from '@/hooks';
import { useAuthStore } from '@/stores';
import { formatMessageTime } from '@/utils';
import { X } from 'lucide-react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_ATTACHMENTS = 4;
const PUT_MAX_RETRIES = 2;

const QUICK_QUESTIONS = [
  'Sản phẩm này có sẵn không?',
  'Có thể thanh toán bằng COD được không?',
  'Tôi có thể được giảm giá không?',
];

async function putFileToUploadUrl(uploadUrl: string, file: File, attempt = 1): Promise<void> {
  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  } catch (err) {
    if (attempt >= PUT_MAX_RETRIES) throw err;
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }
  if (!res.ok) {
    if (attempt >= PUT_MAX_RETRIES) throw new Error(`Upload thất bại (status ${res.status})`);
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }
}

type ComposerAttachment = {
  localId: string;
  localUrl: string;
  role: 'chat_image' | 'chat_video';
  status: 'uploading' | 'done' | 'error';
  assetId?: string;
};

export default function ActiveConversation({
  conversationId,
  peerId,
  isSeller,
}: {
  conversationId: string;
  peerId: string | null;
  isSeller: boolean;
}) {
  const authRole = useAuthStore((s) => s.user?.role)!;
  const ownSenderType: 'buyer' | 'shop' = authRole[0] === 'seller' ? 'shop' : 'buyer';

  const peerInfoMap = useConversationPeerInfo(peerId ? [peerId] : [], authRole[0]);
  const peerInfo = peerId ? peerInfoMap.get(peerId) : undefined;

  const { messages, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMessages(conversationId);
  useChatSocket(conversationId);
  const { sendMessageAsync, isPending: isSending } = useSendMessage(conversationId);
  const { markAsRead } = useMarkConversationAsRead();
  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();

  const [content, setContent] = useState('');
  const [showNewMessagePill, setShowNewMessagePill] = useState(false);
  const [composerAttachments, setComposerAttachments] = useState<ComposerAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const localAssetCacheRef = useRef<Map<string, ResolvedAsset>>(new Map());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isLoadingOlderRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    if (document.visibilityState !== 'visible') return;
    markAsRead(conversationId);
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (!hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          const el = scrollRef.current;
          if (el) prevScrollHeightRef.current = el.scrollHeight;
          isLoadingOlderRef.current = true;
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    const sentinel = topSentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isLoadingOlderRef.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      isLoadingOlderRef.current = false;
      prevScrollHeightRef.current = 0;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    const isFirstLoad = prevMessagesLengthRef.current === 0 && messages.length > 0;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    if (!isNewMessage) return;

    if (isFirstLoad) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 150) el.scrollTop = el.scrollHeight;
    else setShowNewMessagePill(true);
  }, [messages]);

  const orderedMessages = [...messages].reverse();
  const allAttachmentIds = Array.from(
    new Set(orderedMessages.flatMap((m) => m.attachmentMediaAssetIds)),
  );
  const resolvedAssets = useResolveAttachments(allAttachmentIds, localAssetCacheRef.current);

  const handlePickFiles = async (files: FileList | null, kind: 'chat_image' | 'chat_video') => {
    if (!files || files.length === 0) return;
    setAttachmentError(null);

    const allowedTypes = kind === 'chat_image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const slotsLeft = MAX_ATTACHMENTS - composerAttachments.length;
    const filesToUpload = Array.from(files).slice(0, slotsLeft);
    if (Array.from(files).length > slotsLeft) {
      setAttachmentError(`Chỉ được gửi tối đa ${MAX_ATTACHMENTS} tệp mỗi tin nhắn.`);
    }

    for (const file of filesToUpload) {
      if (!allowedTypes.includes(file.type)) {
        setAttachmentError(
          kind === 'chat_image'
            ? 'Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.'
            : 'Chỉ chấp nhận định dạng MP4.',
        );
        continue;
      }

      const localId = `${Date.now()}-${Math.random()}`;
      const localUrl = URL.createObjectURL(file);
      setComposerAttachments((prev) => [
        ...prev,
        { localId, localUrl, role: kind, status: 'uploading' },
      ]);

      try {
        const { assetId, uploadUrl } = await requestUploadAsync({
          contentType: file.type,
          mediaType: kind === 'chat_image' ? 'IMAGE' : 'VIDEO',
        });
        await putFileToUploadUrl(uploadUrl, file);
        await confirmUploadAsync({ id: assetId });
        setComposerAttachments((prev) =>
          prev.map((a) => (a.localId === localId ? { ...a, status: 'done', assetId } : a)),
        );
      } catch {
        setComposerAttachments((prev) =>
          prev.map((a) => (a.localId === localId ? { ...a, status: 'error' } : a)),
        );
      }
    }
  };

  const handleRemoveAttachment = (localId: string) => {
    setComposerAttachments((prev) => {
      const target = prev.find((a) => a.localId === localId);
      if (target) URL.revokeObjectURL(target.localUrl);
      return prev.filter((a) => a.localId !== localId);
    });
  };

  const isUploadingAny = composerAttachments.some((a) => a.status === 'uploading');

  const handleSend = async () => {
    const trimmed = content.trim();
    const readyAttachments = composerAttachments.filter((a) => a.status === 'done' && a.assetId);
    if ((!trimmed && readyAttachments.length === 0) || isSending || isUploadingAny) return;

    readyAttachments.forEach((a) => {
      localAssetCacheRef.current.set(a.assetId!, {
        url: a.localUrl,
        kind: a.role === 'chat_video' ? 'video' : 'image',
      });
    });

    setContent('');
    setComposerAttachments([]);

    await sendMessageAsync({
      content: trimmed || undefined,
      attachments: readyAttachments.map((a) => ({ mediaAssetId: a.assetId!, role: a.role })),
    });
  };

  const handleScrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setShowNewMessagePill(false);
  };

  return (
    <div className='flex min-w-0 flex-1 flex-col'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-2.5'>
        <div className='flex min-w-0 items-center gap-2'>
          {peerInfo?.isAvatarLoading ? (
            <div className='h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-200' />
          ) : peerInfo?.avatarUrl ? (
            <img
              src={peerInfo.avatarUrl}
              alt=''
              className='h-7 w-7 shrink-0 rounded-full object-cover'
            />
          ) : (
            <div className='h-7 w-7 shrink-0 rounded-full bg-gray-200' />
          )}

          {peerInfo?.isNameLoading ? (
            <div className='h-3.5 w-24 animate-pulse rounded bg-gray-200' />
          ) : (
            <span className='truncate text-sm font-medium'>
              {peerInfo?.found ? peerInfo.name : 'Người dùng không xác định'}
            </span>
          )}
        </div>
      </div>

      <div className='relative flex-1 overflow-hidden'>
        <div ref={scrollRef} className='h-full overflow-y-auto px-3 py-2'>
          {hasNextPage && <div ref={topSentinelRef} className='h-1' />}

          {isPending ? (
            <div className='space-y-6 py-6'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`animate-pulse rounded-lg px-3 py-2 ${
                      i % 2 === 0 ? 'w-[55%] bg-orange-300' : 'w-[65%] bg-gray-100'
                    }`}
                  >
                    <div className='h-3 w-3/4 rounded bg-gray-200' />
                    <div className='mt-2 h-2 w-10 rounded bg-gray-200' />
                  </div>
                </div>
              ))}
            </div>
          ) : orderedMessages.length === 0 && !isSeller ? (
            <QuickQuestions onPick={(q) => setContent(q)} />
          ) : (
            orderedMessages.map((m) => {
              const isOwn = m.senderType === ownSenderType;
              const hasText = m.content.trim().length > 0;
              const hasAttachments = m.attachmentMediaAssetIds.length > 0;
              const mediaOnly = hasAttachments && !hasText;

              return (
                <div
                  key={m.id}
                  className={`mb-2 flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg text-sm ${
                      mediaOnly
                        ? ''
                        : `px-3 py-2 ${isOwn ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'}`
                    }`}
                  >
                    {hasAttachments && (
                      <MessageAttachments
                        assetIds={m.attachmentMediaAssetIds}
                        resolved={resolvedAssets}
                      />
                    )}
                    {hasText && <div className={hasAttachments ? 'mt-1' : ''}>{m.content}</div>}
                    <span
                      className={`mt-0.5 px-1 text-[10px] ${isOwn ? 'text-white' : 'text-gray-400'} `}
                    >
                      {formatMessageTime(m.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showNewMessagePill && (
          <button
            onClick={handleScrollToBottom}
            className='absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs shadow-md ring-1 ring-gray-200'
          >
            Có tin nhắn mới ↓
          </button>
        )}
      </div>

      {composerAttachments.length > 0 && (
        <div className='flex gap-2 overflow-x-auto border-t border-gray-200 px-2 pt-2'>
          {composerAttachments.map((a) => (
            <div
              key={a.localId}
              className='relative h-14 w-14 shrink-0 rounded border border-gray-200'
            >
              {a.role === 'chat_video' ? (
                <video src={a.localUrl} className='h-full w-full rounded object-cover' muted />
              ) : (
                <img src={a.localUrl} className='h-full w-full rounded object-cover' alt='' />
              )}
              {a.status === 'uploading' && (
                <div className='absolute inset-0 flex items-center justify-center rounded bg-black/40 text-[10px] text-white'>
                  ...
                </div>
              )}
              {a.status === 'error' && (
                <div className='absolute inset-0 flex items-center justify-center rounded bg-red-500/60 text-[10px] text-white'>
                  Lỗi
                </div>
              )}
              <button
                onClick={() => handleRemoveAttachment(a.localId)}
                className='absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white'
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {attachmentError && <p className='px-2 pt-1 text-xs text-red-500'>{attachmentError}</p>}

      <div className='flex items-center gap-2 border-t border-gray-200 p-2'>
        <button
          type='button'
          onClick={() => imageInputRef.current?.click()}
          disabled={composerAttachments.length >= MAX_ATTACHMENTS}
          className='shrink-0 cursor-pointer text-xl text-gray-400 hover:text-orange-500 disabled:opacity-40'
          title='Đính kèm ảnh'
        >
          <CiImageOn />
        </button>
        <button
          type='button'
          onClick={() => videoInputRef.current?.click()}
          disabled={composerAttachments.length >= MAX_ATTACHMENTS}
          className='shrink-0 cursor-pointer text-xl text-gray-400 hover:text-orange-500 disabled:opacity-40'
          title='Đính kèm video'
        >
          <GoVideo />
        </button>
        <input
          ref={imageInputRef}
          type='file'
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          onChange={(e) => {
            void handlePickFiles(e.target.files, 'chat_image');
            e.target.value = '';
          }}
          className='hidden'
        />
        <input
          ref={videoInputRef}
          type='file'
          accept={ALLOWED_VIDEO_TYPES.join(',')}
          onChange={(e) => {
            void handlePickFiles(e.target.files, 'chat_video');
            e.target.value = '';
          }}
          className='hidden'
        />

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSend();
          }}
          placeholder='Nhập nội dung tin nhắn'
          className='flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-orange-500'
        />
        <button
          title='Gửi'
          onClick={handleSend}
          disabled={
            (!content.trim() && composerAttachments.length === 0) || isSending || isUploadingAny
          }
          className='cursor-pointer text-xl text-gray-400 hover:text-orange-500 disabled:text-gray-300'
        >
          <RiSendPlaneLine />
        </button>
      </div>
    </div>
  );
}

function QuickQuestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className='py-2'>
      <div className='mb-2 text-xs text-gray-500'>Bạn có thể muốn hỏi:</div>
      <div className='flex flex-col gap-2'>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className='rounded border border-gray-200 px-3 py-1.5 text-left text-sm text-[#EE4D2D] hover:cursor-pointer hover:bg-orange-50'
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageAttachments({
  assetIds,
  resolved,
}: {
  assetIds: string[];
  resolved: Map<string, ResolvedAsset>;
}) {
  const [viewingAsset, setViewingAsset] = useState<ResolvedAsset | null>(null);

  return (
    <div className='flex flex-wrap gap-1'>
      {assetIds.map((id) => {
        const asset = resolved.get(id);
        if (!asset) {
          return <div key={id} className='h-24 w-24 animate-pulse rounded bg-gray-200' />;
        }

        if (asset.kind === 'video') {
          return (
            <button
              key={id}
              type='button'
              onClick={() => setViewingAsset(asset)}
              className='relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded bg-black'
            >
              <video
                src={asset.url}
                className='h-full w-full object-cover'
                muted
                playsInline
                preload='metadata'
              />
              <span className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <span className='flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-xs text-white'>
                  ▶
                </span>
              </span>
            </button>
          );
        }

        return (
          <button
            key={id}
            type='button'
            onClick={() => setViewingAsset(asset)}
            className='h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded'
          >
            <img src={asset.url} className='h-full w-full object-cover' alt='' />
          </button>
        );
      })}

      {viewingAsset && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
          onClick={() => setViewingAsset(null)}
        >
          <button
            onClick={() => setViewingAsset(null)}
            className='absolute top-4 right-4 cursor-pointer text-white hover:text-slate-300'
          >
            <X size={24} />
          </button>

          <div onClick={(e) => e.stopPropagation()} className='max-h-[85vh] max-w-3xl'>
            {viewingAsset.kind === 'video' ? (
              <video src={viewingAsset.url} className='max-h-[85vh] max-w-3xl' controls autoPlay />
            ) : (
              <img
                src={viewingAsset.url}
                alt=''
                className='max-h-[85vh] max-w-3xl object-contain'
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
