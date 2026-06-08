"use client";

import { FaSignOutAlt, FaUser } from "react-icons/fa";

interface ProfileDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
}

export function ProfileDropdown({
  isOpen,
  isLoading,
  onLogout,
  onProfileClick,
}: ProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 bg-white/95 dark:bg-[#14161f] backdrop-blur-sm border border-gray-100/50 dark:border-white/8 shadow-2xl"
    >
      <div className="p-2 bg-gradient-to-br from-white to-slate-50/30 dark:from-transparent dark:to-transparent">
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl bg-white hover:bg-[#7E0001]/10 active:bg-[#7E0001]/20 border border-transparent hover:border-[#7E0001]/30 active:border-[#7E0001]/40 text-slate-700 hover:text-[#7E0001] dark:bg-[#14161f] dark:hover:bg-[#7E0001]/10 dark:active:bg-[#7E0001]/20 dark:text-gray-300 dark:hover:text-[#7E0001] transition-all duration-300 group shadow-sm hover:shadow-md active:shadow-sm"
        >
          <div className="p-2 rounded-lg bg-[#7E0001]/10 border border-[#7E0001]/30 group-hover:scale-110 transition-transform duration-300">
            <FaUser className="text-base text-[#7E0001] group-hover:text-[#7E0001] transition-colors duration-300" />
          </div>
          <span className="font-medium">پڕۆفایل</span>
        </button>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-white/10 my-2" />
        
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl bg-white hover:bg-[#7E0001]/10 active:bg-[#7E0001]/20 border border-transparent hover:border-[#7E0001]/30 active:border-[#7E0001]/40 text-slate-700 hover:text-[#7E0001] dark:bg-[#14161f] dark:hover:bg-[#7E0001]/10 dark:active:bg-[#7E0001]/20 dark:text-gray-300 dark:hover:text-[#7E0001] dark:hover:border-[#7E0001]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md active:shadow-sm disabled:hover:shadow-sm"
        >
          <div className="p-2 rounded-lg bg-[#7E0001]/10 dark:bg-[#7E0001]/10 border border-[#7E0001]/30 group-hover:scale-110 transition-transform duration-300 disabled:group-hover:scale-100">
            <FaSignOutAlt className="text-base text-[#7E0001] dark:text-[#7E0001] group-hover:text-[#7E0001] transition-colors duration-300" />
          </div>
          <span className="font-medium">
            {isLoading ? "دەرچوون..." : "دەرچوون"}
          </span>
        </button>
      </div>
    </div>
  );
}


