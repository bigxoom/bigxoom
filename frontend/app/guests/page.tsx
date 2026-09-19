'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import { IconUsers, IconArrowRight } from '@/components/icons';

export default function GuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    api('/guests').then(setGuests).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const guestId = params.get('guestId');
    if (guestId) toggle(guestId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setHistory(null);
    api(`/guests/${id}/history`).then(setHistory).catch(() => {});
  }

  const filtered = guests.filter(
    (g) => g.fullName.toLowerCase().includes(query.toLowerCase()) || (g.phone || '').includes(query),
  );

  return (
    <AppShell title="Guests & Folios">
      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <input
          placeholder="Search by name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-fatima-sand rounded-lg px-3.5 py-2.5 text-sm bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-fatima-gold"
        />

        <div className="space-y-2">
          {filtered.map((g) => {
            const activeStay = expandedId === g.id ? history?.stays?.find((s: any) => !s.checkOutAt) : null;
            return (
              <div key={g.id} className="bg-white border border-fatima-sand rounded-xl overflow-hidden">
                <button onClick={() => toggle(g.id)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-fatima-ivory">
                  <div className="flex items-center gap-2.5">
                    <IconUsers size={16} className="text-fatima-wine" />
                    <div>
                      <div className="font-medium text-sm">{g.fullName}</div>
                      <div className="text-xs text-fatima-ink/50">{g.phone || g.email || '—'}</div>
                    </div>
                  </div>
                  <span className="text-xs text-fatima-ink/40">{expandedId === g.id ? 'Hide' : 'View history'}</span>
                </button>

                {expandedId === g.id && (
                  <div className="border-t border-fatima-sand px-4 py-3 bg-fatima-ivory/50">
                    {!history && <p className="text-xs text-fatima-ink/40">Loading…</p>}
                    {history && (
                      <div className="space-y-3">
                        {activeStay && (
                          <button
                            onClick={() => router.push(`/rooms?room=${activeStay.room.id}`)}
                            className="w-full flex items-center justify-between bg-fatima-wine text-white rounded-lg px-3 py-2 text-sm"
                          >
                            Currently in Room {activeStay.room?.number} — view folio
                            <IconArrowRight size={14} />
                          </button>
                        )}
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1">Stay History</div>
                          {(history.stays || []).length === 0 && <p className="text-xs text-fatima-ink/40">No stays yet.</p>}
                          <div className="space-y-1">
                            {history.stays?.map((s: any) => (
                              <div key={s.id} className="flex justify-between text-sm">
                                <span>Room {s.room?.number}</span>
                                <span className="text-fatima-ink/50">
                                  {new Date(s.checkInAt).toLocaleDateString()} {s.checkOutAt ? `→ ${new Date(s.checkOutAt).toLocaleDateString()}` : '(current)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1">Reservations</div>
                          {(history.reservations || []).length === 0 && <p className="text-xs text-fatima-ink/40">No reservations yet.</p>}
                          <div className="space-y-1">
                            {history.reservations?.map((r: any) => (
                              <div key={r.id} className="flex justify-between text-sm">
                                <span>{new Date(r.arrivalDate).toLocaleDateString()} → {new Date(r.departureDate).toLocaleDateString()}</span>
                                <span className="text-fatima-ink/50">{r.status.replace('_', ' ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-fatima-ink/40 text-center py-8">No guests found.</p>}
        </div>
      </main>
    </AppShell>
  );
}
