'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/audit-logs?take=200').then(setLogs).catch((e) => setError(e.message || 'Failed to load audit trail'));
  }, []);

  return (
    <AppShell title="Audit Trail">
      <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        <div className="bg-white border border-fatima-sand rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-fatima-ivory text-left">
              <tr>
                <th className="p-3 font-semibold text-fatima-ink/60">Time</th>
                <th className="p-3 font-semibold text-fatima-ink/60">User</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Action</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Entity</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-fatima-sand/60">
                  <td className="p-3 text-fatima-ink/60 tabular-nums whitespace-nowrap">{new Date(l.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-3">{l.user?.fullName || 'System'}</td>
                  <td className="p-3 font-medium">{l.action.replaceAll('_', ' ')}</td>
                  <td className="p-3 text-fatima-ink/60">{l.entity}{l.entityId ? ` #${l.entityId.slice(0, 8)}` : ''}</td>
                  <td className="p-3 text-fatima-ink/50">{l.reason || '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && !error && (
                <tr><td colSpan={5} className="p-6 text-center text-fatima-ink/40">No audit entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}
