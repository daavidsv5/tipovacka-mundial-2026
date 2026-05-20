"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

type Player = { id: string; name: string };

interface MobileHeaderProps {
  players: Player[];
  isAdmin: boolean;
  currentUserId: string;
  userName?: string;
  userEmail?: string;
}

export function MobileHeader({ players, isAdmin, currentUserId, userName = "", userEmail = "" }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-16 shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fifa-logo.webp" alt="FIFA WC 2026" width={32} height={32} className="object-contain shrink-0" />
          <span className="text-gray-900 font-bold text-sm truncate max-w-[200px]">Tipovačka Mundial 2026</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white z-10 transition-colors"
            >
              <X size={18} />
            </button>
            <Sidebar players={players} isAdmin={isAdmin} currentUserId={currentUserId} userName={userName} userEmail={userEmail} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
