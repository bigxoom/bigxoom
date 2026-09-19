'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getCurrentUser, roleLabel } from '@/lib/roles';
import { IconSearch, IconBell, IconWifi } from './icons';

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export default function TopBar({
  title,
  onOpenSearch,
  onOpenMenu,
  alertCount = 0,
}: {
  title: string;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  alertCount?: number;
}) {
  const user = getCurrentUser();
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    function check() {
      api('/health')
        .then((r) => !cancelled && setOnline(r?.status === 'ok'))
        .catch(() => !cancelled && setOnline(false));
    }
    check();
    const id = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const initials = (user?.fullName || 'A')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-fatima-sand">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onOpenMenu} className="md:hidden p-2 -ml-2 text-fatima-ink/70 rounded-lg hover:bg-fatima-ivory">
            <HamburgerIcon />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-fatima-ink truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 text-sm text-fatima-ink/50 bg-fatima-ivory border border-fatima-sand rounded-full pl-3 pr-3.5 py-1.5 hover:border-fatima-gold transition-colors"
          >
            <IconSearch size={15} />
            <span className="hidden sm:inline">Search guests, rooms, receipts…</span>
          </button>

          <div
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
            style={
              online === false
                ? { color: '#B42318', borderColor: '#FECDCA', background: '#FEF3F2' }
                : { color: '#15803D', borderColor: '#BBF7D0', background: '#F0FDF4' }
            }
          >
            <IconWifi size={13} />
            {online === false ? 'Offline' : online === null ? 'Checking…' : 'System Online'}
          </div>

          <button
            className="relative p-2 text-fatima-ink/60 rounded-lg hover:bg-fatima-ivory hover:text-fatima-ink"
            title="Attention required"
          >
            <IconBell size={18} />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-fatima-wine text-white text-[10px] leading-4 text-center font-semibold">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-fatima-wine text-fatima-ivory text-xs font-semibold flex items-center justify-center" title={roleLabel(user?.role)}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
