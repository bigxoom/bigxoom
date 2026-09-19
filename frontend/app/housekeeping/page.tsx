'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

const STAGES = ['DIRTY', 'ASSIGNED', 'CLEANING', 'INSPECTION', 'READY'];
const STAGE_COLOR: Record<string, string> = {
  DIRTY: 'border-red-300 bg-red-50',
  ASSIGNED: 'border-blue-300 bg-blue-50',
  CLEANING: 'border-amber-300 bg-amber-50',
  INSPECTION: 'border-purple-300 bg-purple-50',
  READY: 'border-green-300 bg-green-50',
};

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const load = () => api('/housekeeping/tasks').then(setTasks).catch(() => {});
  useEffect(() => { load(); }, []);

  async function next(id: string, status: string) {
    const nextStatus = STAGES[Math.min(STAGES.indexOf(status) + 1, STAGES.length - 1)];
    await api(`/housekeeping/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    load();
  }

  return (
    <AppShell title="Housekeeping">
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const stageTasks = tasks.filter((t) => t.status === stage);
            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-fatima-ink/60">{stage}</h2>
                  <span className="text-xs font-semibold bg-fatima-sand rounded-full px-2 py-0.5">{stageTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {stageTasks.map((t) => (
                    <div key={t.id} className={`border-2 rounded-xl p-3.5 ${STAGE_COLOR[stage]}`}>
                      <div className="font-semibold text-lg">Room {t.room?.number}</div>
                      <div className="text-xs text-fatima-ink/60 mt-0.5">
                        {t.assignedTo ? `Assigned: ${t.assignedTo.fullName}` : 'Unassigned'}
                      </div>
                      {t.status !== 'READY' && (
                        <button
                          onClick={() => next(t.id, t.status)}
                          className="mt-2.5 w-full bg-fatima-wine text-white rounded-lg py-2 text-sm font-medium hover:bg-fatima-wine-dark"
                        >
                          {stage === 'DIRTY' ? 'Start Cleaning' : stage === 'CLEANING' ? 'Mark Ready' : 'Advance'}
                        </button>
                      )}
                    </div>
                  ))}
                  {stageTasks.length === 0 && <p className="text-xs text-fatima-ink/35 py-2">Nothing here.</p>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
