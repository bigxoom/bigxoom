'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import GlobalSearchModal from './GlobalSearchModal';

export default function AppShell({
  title,
  alertCount = 0,
  children,
}: {
  title: string;
  alertCount?: number;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-fatima-ivory">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          title={title}
          onOpenMenu={() => setMobileNavOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          alertCount={alertCount}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
