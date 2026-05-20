"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Trophy,
  BookOpen,
  BarChart2,
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut,
  Users,
} from "lucide-react";

type Player = { id: string; name: string };

interface SidebarProps {
  players: Player[];
  isAdmin: boolean;
  currentUserId: string;
  userName: string;
  userEmail: string;
  onClose?: () => void;
}

export function Sidebar({ players, isAdmin, currentUserId, userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [playersOpen, setPlayersOpen] = useState(true);

  const navItem = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => onClose?.()}
        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[17px] font-medium transition-all ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "text-slate-300 hover:text-white hover:bg-white/[0.07]"
        }`}
      >
        <span className={`shrink-0 ${active ? "text-white" : "text-slate-500"}`}>{icon}</span>
        {label}
      </Link>
    );
  };

  const sectionLabel = (label: string) => (
    <div className="px-4 pt-5 pb-2">
      <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <aside className="flex flex-col h-full bg-[#0d1f45]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fifa-logo.webp"
            alt="FIFA WC 2026"
            width={48}
            height={48}
            className="object-contain shrink-0"
            style={{ filter: "invert(1)" }}
          />
          <span className="text-white font-bold text-base">Tipovačka Mundial 2026</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {sectionLabel("Přehled")}

        {navItem("/", "Žebříček", <Trophy size={19} />)}
        {navItem("/vysledky", "Výsledky", <BarChart2 size={19} />)}
        {navItem("/pravidla", "Pravidla", <BookOpen size={19} />)}

        {sectionLabel("Hráči")}

        <button
          onClick={() => setPlayersOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[17px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all"
        >
          <span className="flex items-center gap-3.5">
            <span className="text-slate-500 shrink-0"><Users size={19} /></span>
            Tipy hráčů
          </span>
          <span className="text-slate-500">
            {playersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>
        </button>

        {playersOpen && (
          <div className="mt-1 ml-4 pl-3.5 border-l border-white/[0.07] space-y-0.5">
            {players.map((p) => {
              const href = `/hraci/${p.id}`;
              const active = pathname === href;
              const isCurrent = p.id === currentUserId;
              return (
                <Link
                  key={p.id}
                  href={href}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-all ${
                    active
                      ? "bg-blue-600/20 text-blue-300 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {isCurrent && (
                    <span className="ml-auto text-[11px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded shrink-0">
                      já
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {isAdmin && (
          <>
            {sectionLabel("Správa")}
            {navItem("/admin", "Admin panel", <Shield size={19} />)}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/[0.07]">
        <div className="px-5 py-4">
          <div className="text-white font-bold text-[17px] leading-tight truncate">{userName}</div>
          <div className="text-blue-400 text-[13px] mt-0.5 truncate">{userEmail}</div>
        </div>
        <div className="px-3 pb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
          >
            <LogOut size={17} className="shrink-0" />
            Odhlásit se
          </button>
        </div>
      </div>
    </aside>
  );
}
