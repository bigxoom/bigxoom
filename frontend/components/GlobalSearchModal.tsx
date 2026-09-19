'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Modal from './Modal';
import { IconUsers, IconBed, IconCalendar, IconReceipt } from './icons';

type Results = { guests: any[]; rooms: any[]; reservations: any[]; payments: any[] };

export default function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api(`/dashboard/search?q=${encodeURIComponent(q.trim())}`)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function go(path: string) {
    router.push(path);
    onClose();
  }

  const hasResults =
    results && (results.guests.length || results.rooms.length || results.reservations.length || results.payments.length);

  return (
    <Modal title="Global Search" onClose={onClose} width="max-w-xl">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Guest name, phone, room number, receipt number…"
        className="w-full border border-fatima-sand rounded-lg px-3.5 py-2.5 text-sm bg-fatima-ivory focus:outline-none focus:ring-2 focus:ring-fatima-gold mb-3"
      />

      {loading && <p className="text-sm text-fatima-ink/50">Searching…</p>}

      {!loading && q.trim() && !hasResults && <p className="text-sm text-fatima-ink/50">No matches for "{q}".</p>}

      {!loading && results && (
        <div className="space-y-4 max-h-[55vh] overflow-y-auto">
          {results.guests.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1.5">Guests</div>
              <div className="space-y-1">
                {results.guests.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => go(`/guests?guestId=${g.id}`)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-fatima-ivory"
                  >
                    <IconUsers size={16} className="text-fatima-wine shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{g.fullName}</div>
                      <div className="text-xs text-fatima-ink/50">{g.phone || g.email || '—'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.rooms.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1.5">Rooms</div>
              <div className="space-y-1">
                {results.rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => go(`/rooms?room=${r.id}`)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-fatima-ivory"
                  >
                    <IconBed size={16} className="text-fatima-wine shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">Room {r.number}</div>
                      <div className="text-xs text-fatima-ink/50">{r.roomType?.name} — {r.status}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.reservations.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1.5">Reservations</div>
              <div className="space-y-1">
                {results.reservations.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => go('/reservations')}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-fatima-ivory"
                  >
                    <IconCalendar size={16} className="text-fatima-wine shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.guest?.fullName} — Room {r.room?.number}</div>
                      <div className="text-xs text-fatima-ink/50">{r.status} · arrives {new Date(r.arrivalDate).toLocaleDateString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.payments.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-fatima-ink/40 mb-1.5">Receipts</div>
              <div className="space-y-1">
                {results.payments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => go(p.folio?.stay?.room ? `/rooms?room=${p.folio.stay.room.id}` : '/reservations')}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-fatima-ivory"
                  >
                    <IconReceipt size={16} className="text-fatima-wine shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">Receipt #{p.receiptNumber} — {Number(p.amount).toLocaleString()} RWF</div>
                      <div className="text-xs text-fatima-ink/50">
                        {p.folio?.stay?.guest?.fullName || 'Guest'} · Room {p.folio?.stay?.room?.number || '—'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
