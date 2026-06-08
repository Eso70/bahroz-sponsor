"use client";

import { memo } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteLinktreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  linktreeName: string;
  linktreeUid: string;
  isDeleting?: boolean;
}

export const DeleteLinktreeModal = memo(function DeleteLinktreeModal({
  isOpen,
  onClose,
  onConfirm,
  linktreeName,
  linktreeUid: _linktreeUid,
  isDeleting = false,
}: DeleteLinktreeModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div className="
        relative w-full max-w-md my-2 sm:my-4 md:my-8 rounded-2xl overflow-hidden shadow-2xl
        bg-white dark:bg-[#14161f]
        border border-gray-100 dark:border-white/8
      ">
        <div className="p-6 sm:p-8 md:p-10">

          {/* Warning icon */}
          <div className="flex justify-center mb-6">
            <div className="
              w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg border-2
              bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10
              border-rose-100 dark:border-rose-500/20
            ">
              <Trash2 className="h-10 w-10 sm:h-12 sm:w-12 text-rose-500 dark:text-rose-400" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-xl font-bold font-kurdish mb-2 text-slate-700 dark:text-gray-100">
              سڕینەوەی پەیج
            </h3>
            <p className="text-sm sm:text-base font-kurdish text-slate-500 dark:text-gray-400">
              دڵنیایت لە سڕینەوەی{" "}
              <span className="font-semibold text-slate-700 dark:text-gray-200">
                {linktreeName}
              </span>
              ؟
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="
                flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base
                font-medium font-kurdish transition-all duration-200 border shadow-sm
                bg-slate-50 dark:bg-white/5
                border-slate-200 dark:border-white/10
                text-slate-600 dark:text-gray-300
                hover:bg-slate-100 dark:hover:bg-white/10
                hover:border-slate-300 dark:hover:border-white/20
                hover:text-slate-700 dark:hover:text-gray-100
                hover:shadow disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              هەڵوەشاندنەوە
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="
                flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base
                font-semibold font-kurdish text-white transition-all duration-200
                bg-gradient-to-r from-rose-500 to-pink-500
                hover:from-rose-600 hover:to-pink-600
                shadow-lg hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>دەسڕێتەوە...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>سڕینەوە</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
});
