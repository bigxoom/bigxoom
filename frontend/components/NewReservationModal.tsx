'use client';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '@/lib/api';

export default function NewReservationModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [guestQuery, setGuestQuery] = useState('');
  const [guestId, setGuestId] = useState('');
  const [newGuest, setNewGuest] = useState({ fullName: '', phone: '' });
  const [roomId, setRoomId] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [arrivalDate, setArrivalDate] = useState(today);
  const [departureDate, setDepartureDate] = useState(today);
  const [numGuests, setNumGuests] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/guests').then(setGuests).catch(() => {});
    api('/rooms').then((rs) => setRooms(rs.filter((r: any) => r.status === 'AVAILABLE'))).catch(() => {});
  }, []);

  const filteredGuests = guests.filter((g) => g.fullName.toLowerCase().includes(guestQuery.toLowerCase()));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!roomId) return setError('Choose a room');
    if (mode === 'existing' && !guestId) return setError('Choose a guest, or switch to "New Guest"');
    if (mode === 'new' && !newGuest.fullName.trim()) return setError('Enter the guest name');
    if (new Date(departureDate) <= new Date(arrivalDate)) return setError('Departure must be after arrival');

    setBusy(true);
    try {
      let finalGuestId = guestId;
      if (mode === 'new') {
        const g = await api('/guests', { method: 'POST', body: JSON.stringify(newGuest) });
        finalGuestId = g.id;
      }
      await api('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          guestId: finalGuestId,
          roomId,
          arrivalDate: new Date(arrivalDate).toISOString(),
          departureDate: new Date(departureDate).toISOString(),
          numGuests: Number(numGuests) || 1,
        }),
      });
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to create reservation');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="New Reservation" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2 text-sm">
          <button type="button" onClick={() => setMode('existing')} className={`px-3 py-1 rounded-full border ${mode === 'existing' ? 'bg-fatima-gold text-white border-fatima-gold' : 'border-fatima-sand'}`}>
            Existing Guest
          </button>
          <button type="button" onClick={() => setMode('new')} className={`px-3 py-1 rounded-full border ${mode === 'new' ? 'bg-fatima-gold text-white border-fatima-gold' : 'border-fatima-sand'}`}>
            New Guest
          </button>
        </div>

        {mode === 'existing' ? (
          <div>
            <input
              placeholder="Search guest by name…"
              value={guestQuery}
              onChange={(e) => setGuestQuery(e.target.value)}
              className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-fatima-ivory mb-1.5"
            />
            <select value={guestId} onChange={(e) => setGuestId(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select guest…</option>
              {filteredGuests.map((g) => (
                <option key={g.id} value={g.id}>{g.fullName}{g.phone ? ` — ${g.phone}` : ''}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input placeholder="Full name" value={newGuest.fullName} onChange={(e) => setNewGuest({ ...newGuest, fullName: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
            <input placeholder="Phone" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
          </div>
        )}

        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Select available room…</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>Room {r.number} — {r.roomType?.name} ({Number(r.roomType?.basePrice || 0).toLocaleString()} RWF/night)</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-fatima-ink/50">Arrival</label>
            <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-fatima-ink/50">Departure</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
          </div>
        </div>

        <div>
          <label className="text-xs text-fatima-ink/50">Number of guests</label>
          <input type="number" min={1} value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-2 text-sm font-medium hover:bg-fatima-bronze disabled:opacity-50">
          {busy ? 'Creating…' : 'Create Reservation'}
        </button>
      </form>
    </Modal>
  );
}
