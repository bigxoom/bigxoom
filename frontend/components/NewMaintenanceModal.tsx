'use client';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '@/lib/api';

export default function NewMaintenanceModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/rooms').then(setRooms).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setError('Describe the problem');
    setBusy(true);
    setError('');
    try {
      await api('/maintenance/tickets', {
        method: 'POST',
        body: JSON.stringify({ roomId: roomId || undefined, category, description }),
      });
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to create ticket');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="New Maintenance Request" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-fatima-ink/50">Room (optional — leave blank for a common area)</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">No specific room</option>
            {rooms.map((r: any) => <option key={r.id} value={r.id}>Room {r.number}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-fatima-ink/50">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
            {['General', 'Electrical', 'Plumbing', 'Air Conditioning', 'Furniture', 'IT/Network'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-fatima-ink/50">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-2 text-sm font-medium hover:bg-fatima-bronze disabled:opacity-50">
          {busy ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>
    </Modal>
  );
}
