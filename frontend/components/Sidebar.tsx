'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, roleLabel } from '@/lib/roles';
import { navForRole } from '@/lib/nav';
import { IconLogout } from './icons';

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();
  const groups = navForRole(user?.role);

  function logout() {
    localStorage.removeItem('fatima_token');
    localStorage.removeItem('fatima_user');
    router.push('/login');
  }

  const content = (
    <div className="flex flex-col h-full bg-fatima-wine text-fatima-ivory">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="font-serif text-[13px] tracking-wide uppercase text-fatima-gold/90">Centre Pastoral</div>
        <div className="font-serif text-lg leading-tight mt-0.5">Notre Dame de Fatima</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-2.5 text-[10px] font-semibold tracking-widest uppercase text-fatima-ivory/40 mb-1.5">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                if (!item.built) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg text-fatima-ivory/35 text-sm cursor-not-allowed select-none"
                      title="Coming soon"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} />
                        {item.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide border border-fatima-ivory/20 rounded px-1.5 py-0.5">
                        Soon
                      </span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-fatima-gold text-fatima-wine-dark font-medium'
                        : 'text-fatima-ivory/85 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.fullName || 'Administrator'}</div>
            <div className="text-[11px] text-fatima-ivory/50">{roleLabel(user?.role) || '—'}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-fatima-ivory/70 hover:text-fatima-ivory hover:bg-white/10"
          >
            <IconLogout size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 fatima-backdrop-enter" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-72 fatima-panel-enter-left">{content}</div>
        </div>
      )}
    </>
  );
}
