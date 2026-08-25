import { useEffect, useMemo, useState } from 'react';
import {
  useGetShopChatSetting,
  useUpdateShopChatSetting,
  useGetShopChatQuickReplies,
  useCreateShopChatQuickReply,
  useUpdateShopChatQuickReply,
  type ChatQuickReplyItem,
} from '@/hooks';

const TITLE_MAX_LENGTH = 250;

export default function ChatSettingsSection() {
  const { data: settingData, isPending: isSettingLoading } = useGetShopChatSetting();
  const {
    updateShopChatSetting,
    isPending: isSavingSetting,
    errorMessage: settingErrorMessage,
  } = useUpdateShopChatSetting();

  const { data: quickReplies, isPending: isQuickRepliesLoading } = useGetShopChatQuickReplies();

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('');

  useEffect(() => {
    if (!settingData) return;
    setAutoReplyEnabled(settingData.autoReplyEnabled);
    setAutoReplyMessage(settingData.autoReplyMessage);
  }, [settingData]);

  const hasSettingChanges = useMemo(() => {
    if (!settingData) return false;
    return (
      autoReplyEnabled !== settingData.autoReplyEnabled ||
      autoReplyMessage !== settingData.autoReplyMessage
    );
  }, [settingData, autoReplyEnabled, autoReplyMessage]);

  const isMessageMissing = autoReplyEnabled && autoReplyMessage.trim() === '';
  const isSettingSaveDisabled = isSavingSetting || !hasSettingChanges || isMessageMissing;

  const handleSaveSetting = () => {
    if (isSettingSaveDisabled) return;
    updateShopChatSetting({ autoReplyEnabled, autoReplyMessage });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<ChatQuickReplyItem | null>(null);

  const openCreateModal = () => {
    setEditingReply(null);
    setModalOpen(true);
  };

  const openEditModal = (reply: ChatQuickReplyItem) => {
    setEditingReply(reply);
    setModalOpen(true);
  };

  return (
    <div className='space-y-3'>
      <div className='bg-white p-6 shadow-sm'>
        {isSettingLoading ? (
          <SettingSkeleton />
        ) : (
          <>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-base font-medium text-slate-800'>Tự Động Trả Lời</h2>
                <p className='mt-1 text-sm text-slate-400'>
                  Gửi tin nhắn tự động khi khách hàng nhắn tin lần đầu
                </p>
              </div>
              <button
                type='button'
                onClick={() => setAutoReplyEnabled((v) => !v)}
                disabled={isSavingSetting}
                className={`h-5 w-9 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  autoReplyEnabled ? 'bg-[#EE4D2D]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    autoReplyEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settingData?.autoReplyMessage === '' && (
              <p className='mb-2 text-sm text-amber-600'>Bạn chưa tạo tin nhắn tự động trả lời.</p>
            )}

            <textarea
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
              disabled={!autoReplyEnabled || isSavingSetting}
              rows={3}
              placeholder='Nhập nội dung tin nhắn tự động trả lời'
              className='w-full resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D] disabled:bg-slate-50 disabled:text-slate-400'
            />

            {isMessageMissing && (
              <p className='mt-1 text-xs text-red-500'>Vui lòng nhập tin nhắn tự động trả lời</p>
            )}

            {settingErrorMessage && (
              <p className='mt-1 text-xs text-red-500'>{settingErrorMessage}</p>
            )}

            <div className='mt-4 flex justify-end'>
              <button
                onClick={handleSaveSetting}
                disabled={isSettingSaveDisabled}
                className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#EE4D2D]'
              >
                {isSavingSetting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className='bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-base font-medium text-slate-800'>Tin Nhắn Nhanh</h2>
          <button
            onClick={openCreateModal}
            className='cursor-pointer border border-[#EE4D2D] px-4 py-1.5 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'
          >
            + Thêm
          </button>
        </div>

        {isQuickRepliesLoading ? (
          <QuickReplySkeleton />
        ) : (
          <div className='divide-y divide-slate-50'>
            {quickReplies?.map((reply) => (
              <div key={reply.id} className='flex items-center justify-between py-3'>
                <div>
                  <p className='text-sm font-medium text-slate-700'>{reply.title}</p>
                  <p className='mt-1 text-sm text-slate-400'>{reply.content}</p>
                </div>
                <button
                  onClick={() => openEditModal(reply)}
                  className='shrink-0 cursor-pointer text-sky-600 hover:underline'
                >
                  Sửa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuickReplyModal
        open={modalOpen}
        initialReply={editingReply}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function SettingSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-4 w-40 rounded bg-slate-200' />
          <div className='h-3 w-64 rounded bg-slate-200' />
        </div>
        <div className='h-5 w-9 rounded-full bg-slate-200' />
      </div>
      <div className='h-16 w-full rounded bg-slate-200' />
      <div className='mt-4 flex justify-end'>
        <div className='h-9 w-20 rounded bg-slate-200' />
      </div>
    </div>
  );
}

function QuickReplySkeleton() {
  return (
    <div className='animate-pulse divide-y divide-slate-50'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='flex items-center justify-between py-3'>
          <div className='space-y-2'>
            <div className='h-4 w-32 rounded bg-slate-200' />
            <div className='h-3 w-56 rounded bg-slate-200' />
          </div>
          <div className='h-4 w-8 rounded bg-slate-200' />
        </div>
      ))}
    </div>
  );
}

type QuickReplyModalProps = {
  open: boolean;
  initialReply?: ChatQuickReplyItem | null;
  onClose: () => void;
};

function QuickReplyModal({ open, initialReply, onClose }: QuickReplyModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isEditing = Boolean(initialReply);

  const {
    createQuickReply,
    isPending: isCreating,
    errorMessage: createErrorMessage,
  } = useCreateShopChatQuickReply();
  const {
    updateQuickReply,
    isPending: isUpdating,
    errorMessage: updateErrorMessage,
  } = useUpdateShopChatQuickReply();

  const isPending = isEditing ? isUpdating : isCreating;
  const errorMessage = isEditing ? updateErrorMessage : createErrorMessage;

  useEffect(() => {
    if (!open) return;
    if (initialReply) {
      setTitle(initialReply.title);
      setContent(initialReply.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [open, initialReply]);

  const isFormValid = useMemo(
    () => title.trim() !== '' && content.trim() !== '' && title.length <= TITLE_MAX_LENGTH,
    [title, content],
  );

  const hasChanges = useMemo(() => {
    if (!isEditing || !initialReply) return false;
    return title !== initialReply.title || content !== initialReply.content;
  }, [isEditing, initialReply, title, content]);

  const isSaveDisabled = isPending || !isFormValid || (isEditing && !hasChanges);

  if (!open) return null;

  const handleSave = () => {
    if (isSaveDisabled) return;

    if (isEditing && initialReply) {
      updateQuickReply({ id: initialReply.id, title, content }, { onSuccess: () => onClose() });
      return;
    }

    createQuickReply({ title, content }, { onSuccess: () => onClose() });
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
    >
      <div className='w-full max-w-125 bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
        <div className='border-b border-slate-100 px-6 py-5'>
          <h2 className='text-[18px] font-medium text-slate-800'>
            {isEditing ? 'Cập Nhật Tin Nhắn Nhanh' : 'Tin Nhắn Nhanh Mới'}
          </h2>
        </div>

        <div className='space-y-4 p-6'>
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              placeholder='Tiêu đề'
              disabled={isPending}
              maxLength={TITLE_MAX_LENGTH}
              className='h-10 w-full border border-slate-300 px-3 text-sm transition outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
            />
            <p className='mt-1 text-right text-xs text-slate-400'>
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder='Nội dung'
            disabled={isPending}
            className='w-full resize-none border border-slate-300 px-3 py-2 text-sm transition outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
          />

          {errorMessage && <p className='text-xs text-red-500'>{errorMessage}</p>}

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={isPending}
              className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800'
            >
              Trở Lại
            </button>
            <button
              type='button'
              onClick={handleSave}
              disabled={isSaveDisabled}
              className='h-10 cursor-pointer bg-[#EE4D2D] px-8 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#EE4D2D]/40 disabled:hover:bg-[#EE4D2D]/40'
            >
              {isPending ? 'Đang lưu...' : 'Hoàn thành'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
