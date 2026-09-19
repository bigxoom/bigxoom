'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import NewReservationModal from '@/components/NewReservationModal';
import { api } from '@/lib/api';
import { IconPlus } from '@/components/icons';

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  ARRIVAL: 'bg-amber-100 text-amber-700',
  CHECKED_IN: 'bg-green-100 text-green-700',
  CHECKED_OUT: 'bg-fatima-sand text-fatima-ink/60',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const load = () => api('/reservations').then(setReservations).catch(() => {});
  useEffect(() => { load(); }, []);

  async function checkIn(id: string) {
    await api(`/reservations/${id}/check-in`, { method: 'POST' });
    load();
  }

  return (
    <AppShell title="Reservations">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fatima-ink/50">{reservations.length} reservation{reservations.length === 1 ? '' : 's'}</p>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-fatima-gold text-white rounded-lg px-3.5 py-2 text-sm font-medium hover:bg-fatima-bronze"
          >
            <IconPlus size={15} /> New Reservation
          </button>
        </div>

        <div className="bg-white border border-fatima-sand rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-fatima-ivory text-left">
              <tr>
                <th className="p-3 font-semibold text-fatima-ink/60">Guest</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Room</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Arrival</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Departure</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-fatima-sand/60">
                  <td className="p-3">{r.guest?.fullName}</td>
                  <td className="p-3">Room {r.room?.number}</td>
                  <td className="p-3">{new Date(r.arrivalDate).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(r.departureDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-700'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status !== 'CHECKED_IN' && r.status !== 'CHECKED_OUT' && r.status !== 'CANCELLED' && (
                      <button onClick={() => checkIn(r.id)} className="text-fatima-wine hover:underline font-medium">
                        Check in
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-fatima-ink/40">No reservations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && <NewReservationModal onClose={() => setShowNew(false)} onCreated={load} />}
    </AppShell>
  );
}
