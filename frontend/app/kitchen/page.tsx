'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

const stages = ['NEW', 'ACCEPTED', 'PREPARING', 'READY'];

export default function KitchenPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    api('/kitchen/tickets/active').then(setTickets).catch(() => {});
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost';
    const socket = io(`${socketUrl}/kitchen`, { transports: ['websocket'] });
    socket.on('ticket:new', () => api('/kitchen/tickets/active').then(setTickets));
    socket.on('ticket:update', () => api('/kitchen/tickets/active').then(setTickets));
    return () => {
      socket.disconnect();
    };
  }, []);

  async function advance(id: string, current: string) {
    const idx = stages.indexOf(current);
    const next = idx < stages.length - 1 ? stages[idx + 1] : 'SERVED';
    await api(`/kitchen/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
  }

  return (
    <AppShell title="Kitchen Display — Live">
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white border border-fatima-sand rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">
                  {t.order?.tableNumber ? `Table ${t.order.tableNumber}` : t.order?.room ? `Room ${t.order.room.number}` : 'Order'}
                </span>
                <span className="text-fatima-gold font-medium">{t.status}</span>
              </div>
              <ul className="text-sm mb-3 space-y-1">
                {t.order?.items?.map((i: any) => (
                  <li key={i.id}>
                    {i.quantity}× {i.menuItem?.name}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => advance(t.id, t.status)}
                className="w-full bg-fatima-gold text-white rounded-lg py-1.5 text-sm hover:bg-fatima-bronze"
              >
                Advance to next stage
              </button>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-fatima-ink/60">No active kitchen tickets.</p>}
        </div>
      </main>
    </AppShell>
  );
}
