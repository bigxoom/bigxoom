'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

export default function PosPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tableNumber, setTableNumber] = useState('');
  const [type, setType] = useState<'RESTAURANT' | 'BAR'>('RESTAURANT');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/pos/orders/menu/items').then(setMenu).catch(() => {});
  }, []);

  function addItem(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  async function sendOrder() {
    const items = Object.entries(cart).map(([menuItemId, quantity]) => {
      const m = menu.find((x) => x.id === menuItemId);
      return { menuItemId, quantity, unitPrice: m.price };
    });
    if (items.length === 0) return;
    const order = await api('/pos/orders', {
      method: 'POST',
      body: JSON.stringify({ type, tableNumber, items }),
    });
    await api(`/pos/orders/${order.id}/send-to-kitchen`, { method: 'POST' });
    setCart({});
    setMessage(`Order sent to kitchen for table ${tableNumber || '-'}`);
  }

  const filtered = menu.filter((m) => m.category?.type === type);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const m = menu.find((x) => x.id === id);
    return sum + (m ? Number(m.price) * qty : 0);
  }, 0);

  return (
    <AppShell title="Restaurant & Bar POS">
      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setType('RESTAURANT')}
            className={`px-4 py-1.5 rounded-full text-sm ${type === 'RESTAURANT' ? 'bg-fatima-gold text-white' : 'bg-white border border-fatima-sand'}`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setType('BAR')}
            className={`px-4 py-1.5 rounded-full text-sm ${type === 'BAR' ? 'bg-fatima-gold text-white' : 'bg-white border border-fatima-sand'}`}
          >
            Bar
          </button>
          <input
            placeholder="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="border border-fatima-sand rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => addItem(m.id)}
                className="bg-white border border-fatima-sand rounded-xl p-4 text-left hover:border-fatima-gold"
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-fatima-ink/60">{Number(m.price).toLocaleString()} RWF</div>
              </button>
            ))}
          </div>

          <div className="bg-white border border-fatima-sand rounded-xl p-4 h-fit">
            <h2 className="font-medium text-fatima-bronze mb-2">Order</h2>
            <ul className="text-sm space-y-1 mb-3">
              {Object.entries(cart).map(([id, qty]) => {
                const m = menu.find((x) => x.id === id);
                return (
                  <li key={id}>
                    {qty}× {m?.name}
                  </li>
                );
              })}
            </ul>
            <div className="font-semibold mb-3">Total: {total.toLocaleString()} RWF</div>
            <button
              onClick={sendOrder}
              className="w-full bg-fatima-gold text-white rounded-lg py-2 hover:bg-fatima-bronze"
            >
              Send to Kitchen
            </button>
            {message && <p className="text-xs text-green-700 mt-2">{message}</p>}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
