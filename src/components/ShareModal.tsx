import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  KeyRound, 
  Save, 
  GitFork 
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string | null;
  activeShareId: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  onCreateNewShare: () => void;
  onUpdateExistingShare: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  activeShareId,
  isLoading,
  isConfigured,
  onCreateNewShare,
  onUpdateExistingShare,
  onNotify,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      onNotify('Đã sao chép liên kết chia sẻ!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Chia sẻ tài liệu trực tuyến</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Tự hủy sau 7 ngày
                </span>
              </div>
              <p className="text-xs text-fg-secondary mt-0.5">
                Lưu trữ trên Firebase Cloud Firestore với bộ đệm Offline IndexedDB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {!isConfigured ? (
            /* Guide when API Key is missing */
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-600 dark:text-amber-400">
                <KeyRound size={18} className="shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold">Chưa cấu hình Firebase Credentials</h3>
                  <p className="text-xs text-fg-secondary mt-1 leading-relaxed">
                    Để kích hoạt tính năng lưu và chia sẻ link qua Firebase, bạn hãy tạo file <code className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[11px] text-foreground">.env</code> ở thư mục gốc dự án theo mẫu:
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface border border-border font-mono text-[11px] text-fg-secondary select-all leading-relaxed whitespace-pre">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=format-json-xml`}
              </div>

              <p className="text-[11px] text-fg-secondary">
                Xem thêm hướng dẫn đầy đủ tại file <code className="text-blue-500 font-mono">.env.example</code>. Sau khi thêm biến môi trường, hãy khởi động lại dự án.
              </p>
            </div>
          ) : (
            <>
              {/* Existing Share Notice & Actions */}
              {activeShareId && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Đang ở liên kết: </span>
                    <code className="text-blue-500 font-mono font-semibold">{activeShareId}</code>
                    <p className="text-[11px] text-fg-secondary mt-0.5">
                      Bạn có thể lưu đè nội dung mới hoặc tạo hẳn liên kết mới riêng biệt.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={onUpdateExistingShare}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-xs disabled:opacity-50"
                      title="Lưu cập nhật lên Firebase cho link hiện tại"
                    >
                      {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>Lưu đè</span>
                    </button>
                    <button
                      onClick={onCreateNewShare}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-surface hover:bg-surface-hover text-foreground border border-border font-medium transition-colors disabled:opacity-50"
                      title="Tạo link chia sẻ mới độc lập"
                    >
                      <GitFork size={13} />
                      <span>Link mới</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Share URL Box */}
              {shareUrl ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>Đường dẫn chia sẻ trực tiếp:</span>
                    <span className="text-[11px] text-fg-secondary">Ai có link đều có thể xem và sửa</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-md bg-surface-secondary border border-border text-foreground select-all focus:outline-hidden"
                    />

                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs active:scale-95 shrink-0"
                    >
                      {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                      <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                    </button>

                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md bg-surface border border-border hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors shrink-0"
                      title="Mở trong tab mới"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <button
                    onClick={onCreateNewShare}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Đang lưu lên Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={15} />
                        <span>Tạo liên kết chia sẻ ngay</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Information Features */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/60 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-secondary/50 border border-border/60 flex items-start gap-2">
                  <Clock size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">Tự hủy sau 7 ngày</span>
                    <span className="text-[11px] text-fg-secondary">Dữ liệu được dọn dẹp định kỳ để bảo vệ quyền riêng tư.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-secondary/50 border border-border/60 flex items-start gap-2">
                  <ShieldCheck size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">Đồng bộ hai chiều</span>
                    <span className="text-[11px] text-fg-secondary">Bạn và người nhận có thể sửa và cập nhật cùng link.</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-secondary/30 flex items-center justify-end select-none">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

