'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import KpiCard from '@/components/KpiCard';
import RoomBoard from '@/components/RoomBoard';
import RoomDetailDrawer from '@/components/RoomDetailDrawer';
import AttentionRequired from '@/components/AttentionRequired';
import LiveOperationsPanel from '@/components/LiveOperationsPanel';
import QuickActions from '@/components/QuickActions';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/roles';
import { computeAlerts } from '@/lib/alerts';
import { IconBed, IconCalendar, IconMoney, IconWifi } from '@/components/icons';

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return now;
}

const money = (n: number) => `${Math.round(n || 0).toLocaleString()} RWF`;

export default function DashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const now = useLiveClock();

  const [summary, setSummary] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    api('/dashboard/summary').then(setSummary).catch(() => {});
    api('/dashboard/activity?take=15').then(setActivity).catch(() => {});
    api('/rooms').then(setRooms).catch(() => {});
    api('/housekeeping/tasks').then(setHousekeepingTasks).catch(() => {});
    api('/maintenance/tickets').then(setMaintenanceTickets).catch(() => {});
    api('/kitchen/tickets/active').then(setKitchenTickets).catch(() => {});
    api('/inventory/low-stock').then(setLowStockItems).catch(() => {});
    api('/reservations').then(setReservations).catch(() => {});
  }, []);

  useEffect(() => {
    loadAll();
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setSelectedRoomId(room);
    const id = setInterval(loadAll, 30000);
    return () => clearInterval(id);
  }, [loadAll]);

  const statusCount = (s: string) => rooms.filter((r) => r.status === s).length;
  const totalRooms = rooms.length;

  const alerts = useMemo(
    () =>
      computeAlerts({
        maintenanceOpen: summary?.operations?.openMaintenance || 0,
        housekeepingTasks,
        kitchenTickets,
        lowStockItems: lowStockItems.length,
        reservations,
      }),
    [summary, housekeepingTasks, kitchenTickets, lowStockItems, reservations],
  );

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const occupancyRate = totalRooms > 0 ? Math.round((statusCount('OCCUPIED') / totalRooms) * 100) : 0;

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <AppShell title="Admin Command Center" alertCount={alerts.length}>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="bg-fatima-wine text-fatima-ivory rounded-2xl px-5 md:px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-serif text-lg md:text-xl">Centre Pastoral Notre Dame de Fatima</div>
            <div className="text-fatima-ivory/70 text-sm mt-0.5">
              {greeting}, {user?.fullName || 'Administrator'}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <span className="fatima-live-dot w-2 h-2 rounded-full bg-green-400" />
              System Online
            </span>
            <span className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <IconWifi size={13} /> LAN Connected
            </span>
            <span className="hidden md:inline text-fatima-ivory/70">
              {now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard label="Total Rooms" value={totalRooms || '—'} icon={IconBed} onClick={() => scrollTo('room-board')} />
          <KpiCard label="Occupied" value={statusCount('OCCUPIED')} icon={IconBed} accent="wine" onClick={() => scrollTo('room-board')} />
          <KpiCard label="Available" value={statusCount('AVAILABLE')} icon={IconBed} onClick={() => scrollTo('room-board')} />
          <KpiCard label="Arrivals Today" value={summary?.today?.arrivals ?? '—'} icon={IconCalendar} onClick={() => router.push('/reservations')} />
          <KpiCard label="Departures Today" value={summary?.today?.departures ?? '—'} icon={IconCalendar} onClick={() => router.push('/reservations')} />
          <KpiCard label="Today's Revenue" value={money(summary?.financial?.totalRevenue)} icon={IconMoney} accent="gold" onClick={() => scrollTo('financial-snapshot')} />
          <KpiCard label="Outstanding" value={money(summary?.financial?.outstandingBalance)} icon={IconMoney} accent="wine" onClick={() => scrollTo('financial-snapshot')} />
        </div>

        {/* Live Room Board */}
        <div id="room-board" className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card scroll-mt-20">
          <h2 className="font-semibold text-fatima-wine mb-1">Live Room Board</h2>
          <p className="text-xs text-fatima-ink/45 mb-3">Click any room to view the guest, folio and available actions.</p>
          <RoomBoard rooms={rooms} onSelect={(r) => setSelectedRoomId(r.id)} selectedRoomId={selectedRoomId} />
        </div>

        {/* Today + Attention Required */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card">
            <h2 className="font-semibold text-fatima-wine mb-3">Today</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-semibold">{summary?.today?.arrivals ?? '—'}</div>
                <div className="text-xs text-fatima-ink/50 mt-0.5">Arrivals</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{summary?.today?.departures ?? '—'}</div>
                <div className="text-xs text-fatima-ink/50 mt-0.5">Departures</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{occupancyRate}%</div>
                <div className="text-xs text-fatima-ink/50 mt-0.5">Occupancy</div>
              </div>
            </div>
          </div>
          <AttentionRequired alerts={alerts} />
        </div>

        {/* Financial Snapshot + Live Operations */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div id="financial-snapshot" className="lg:col-span-1 bg-white border border-fatima-sand rounded-2xl p-5 shadow-card scroll-mt-20">
            <h2 className="font-semibold text-fatima-wine mb-3">Financial Snapshot — Today</h2>
            <div className="space-y-1.5 text-sm">
              {[
                ['Accommodation', summary?.financial?.revenueByCategory?.ACCOMMODATION],
                ['Restaurant', summary?.financial?.revenueByCategory?.RESTAURANT],
                ['Bar', summary?.financial?.revenueByCategory?.BAR],
                ['Laundry / Other', (summary?.financial?.revenueByCategory?.LAUNDRY || 0) + (summary?.financial?.revenueByCategory?.OTHER || 0)],
              ].map(([label, val]: any) => (
                <div key={label} className="flex justify-between">
                  <span className="text-fatima-ink/60">{label}</span>
                  <span className="font-medium">{money(val)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-fatima-sand pt-1.5 mt-1.5">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-fatima-gold">{money(summary?.financial?.totalRevenue)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-fatima-sand">
              <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/45 mb-1.5">By Payment Method</div>
              <div className="space-y-1 text-sm">
                {Object.entries(summary?.financial?.paymentsByMethod || {}).length === 0 && (
                  <p className="text-xs text-fatima-ink/40">No payments recorded today.</p>
                )}
                {Object.entries(summary?.financial?.paymentsByMethod || {}).map(([method, amt]: any) => (
                  <div key={method} className="flex justify-between">
                    <span className="text-fatima-ink/60">{method.replace('_', ' ')}</span>
                    <span className="font-medium">{money(amt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-fatima-sand flex justify-between text-sm">
              <span className="font-semibold">Outstanding Guest Balance</span>
              <span className="font-semibold text-fatima-wine">{money(summary?.financial?.outstandingBalance)}</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <LiveOperationsPanel
              kitchenTickets={kitchenTickets}
              housekeepingTasks={housekeepingTasks}
              maintenanceTickets={maintenanceTickets}
              lowStockItems={lowStockItems}
            />
          </div>
        </div>

        <QuickActions onChanged={loadAll} />

        {/* Recent Activity */}
        <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-fatima-wine">Recent Activity</h2>
            <Link href="/audit" className="text-xs text-fatima-wine hover:underline">View Full Audit Trail</Link>
          </div>
          <ul className="text-sm space-y-1.5 max-h-80 overflow-auto">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-2 border-b border-fatima-sand/50 py-1.5 last:border-0">
                <span className="text-fatima-ink/40 shrink-0 tabular-nums">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>
                  <span className="font-medium">{a.user?.fullName || 'System'}</span>{' '}
                  <span className="text-fatima-ink/70">{a.action.replaceAll('_', ' ').toLowerCase()}</span>
                </span>
              </li>
            ))}
            {activity.length === 0 && <p className="text-fatima-ink/40 text-sm">No recent activity.</p>}
          </ul>
        </div>
      </div>

      {selectedRoomId && (
        <RoomDetailDrawer roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} onChanged={loadAll} />
      )}
    </AppShell>
  );
}
