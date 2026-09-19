'use client';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '@/lib/api';

const TYPES = [
  { value: 'IN', label: 'Stock In (receiving)' },
  { value: 'OUT', label: 'Stock Out (issuing)' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'ADJUSTMENT', label: 'Adjustment (needs approval)' },
  { value: 'WASTAGE', label: 'Wastage (needs approval)' },
];

export default function StockMovementModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [itemId, setItemId] = useState('');
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/inventory/items').then(setItems).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!itemId || !quantity) return setError('Choose an item and quantity');
    setBusy(true);
    try {
      const res = await api('/inventory/transactions', {
        method: 'POST',
        body: JSON.stringify({ itemId, type, quantity: Number(quantity), reason: reason || undefined }),
      });
      if (res?.status === 'PENDING') {
        setNotice('Submitted for supervisor approval.');
        setTimeout(() => { onCreated?.(); onClose(); }, 900);
      } else {
        onCreated?.();
        onClose();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to post stock movement');
    } finally {
      setBusy(false);
    }
  }

  const selected = items.find((i) => i.id === itemId);

  return (
    <Modal title="Stock Movement" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Select item…</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({Number(i.quantity)} {i.unit} in stock)</option>)}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <input type="number" min="0" step="0.01" placeholder={`Quantity${selected ? ` (${selected.unit})` : ''}`} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />
        <input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-3 py-2 text-sm bg-white" />

        {notice && <p className="text-sm text-green-700">{notice}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-2 text-sm font-medium hover:bg-fatima-bronze disabled:opacity-50">
          {busy ? 'Posting…' : 'Post Movement'}
        </button>
      </form>
    </Modal>
  );
}
