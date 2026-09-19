'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import NewMaintenanceModal from '@/components/NewMaintenanceModal';
import { api } from '@/lib/api';
import { getCurrentUser, MAINTENANCE_ROLES } from '@/lib/roles';
import { IconPlus } from '@/components/icons';

const STAGES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'VERIFIED', 'CLOSED'];
const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  WAITING_PART: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  VERIFIED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-200 text-gray-600',
};

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const role = getCurrentUser()?.role || '';
  const canAdvance = MAINTENANCE_ROLES.includes(role);

  const load = () => api('/maintenance/tickets').then(setTickets).catch(() => {});
  useEffect(() => { load(); }, []);

  async function advance(id: string, status: string) {
    const nextStatus = STAGES[Math.min(STAGES.indexOf(status) + 1, STAGES.length - 1)];
    await api(`/maintenance/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    load();
  }

  return (
    <AppShell title="Maintenance Tickets">
      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fatima-ink/50">{tickets.length} ticket{tickets.length === 1 ? '' : 's'}</p>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-fatima-gold text-white rounded-lg px-3.5 py-2 text-sm font-medium hover:bg-fatima-bronze"
          >
            <IconPlus size={15} /> New Ticket
          </button>
        </div>

        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white border border-fatima-sand rounded-xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="font-medium">{t.category}</span>{t.room ? <span className="text-fatima-ink/60"> — Room {t.room.number}</span> : null}
                  <p className="text-sm text-fatima-ink/70 mt-0.5">{t.description}</p>
                  {t.assignedTo && <p className="text-xs text-fatima-ink/45 mt-1">Assigned: {t.assignedTo.fullName}</p>}
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status.replace('_', ' ')}</span>
              </div>
              {canAdvance && t.status !== 'CLOSED' && (
                <button onClick={() => advance(t.id, t.status)} className="mt-3 text-sm text-fatima-wine hover:underline font-medium">
                  Advance to {STAGES[Math.min(STAGES.indexOf(t.status) + 1, STAGES.length - 1)].replace('_', ' ')}
                </button>
              )}
            </div>
          ))}
          {tickets.length === 0 && <p className="text-fatima-ink/40 text-center py-8">No maintenance tickets.</p>}
        </div>
      </main>

      {showNew && <NewMaintenanceModal onClose={() => setShowNew(false)} onCreated={load} />}
    </AppShell>
  );
}
