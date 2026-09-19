'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StockMovementModal from '@/components/StockMovementModal';
import { api } from '@/lib/api';
import { getCurrentUser, STORE_ROLES } from '@/lib/roles';
import { IconPlus } from '@/components/icons';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showMove, setShowMove] = useState(false);
  const role = getCurrentUser()?.role || '';
  const canMove = STORE_ROLES.includes(role);

  const load = () => api('/inventory/items').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const lowCount = items.filter((i) => Number(i.quantity) <= Number(i.minStock)).length;

  return (
    <AppShell title="Inventory">
      <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fatima-ink/50">
            {items.length} item{items.length === 1 ? '' : 's'} {lowCount > 0 && <span className="text-red-600 font-medium">· {lowCount} low stock</span>}
          </p>
          {canMove && (
            <button
              onClick={() => setShowMove(true)}
              className="flex items-center gap-1.5 bg-fatima-gold text-white rounded-lg px-3.5 py-2 text-sm font-medium hover:bg-fatima-bronze"
            >
              <IconPlus size={15} /> Stock Movement
            </button>
          )}
        </div>

        <div className="bg-white border border-fatima-sand rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-fatima-ivory text-left">
              <tr>
                <th className="p-3 font-semibold text-fatima-ink/60">Item</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Category</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Quantity</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Min Stock</th>
                <th className="p-3 font-semibold text-fatima-ink/60">Supplier</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const low = Number(i.quantity) <= Number(i.minStock);
                return (
                  <tr key={i.id} className={`border-t border-fatima-sand/60 ${low ? 'bg-red-50' : ''}`}>
                    <td className="p-3 font-medium">{i.name}</td>
                    <td className="p-3 text-fatima-ink/60">{i.category}</td>
                    <td className="p-3">{Number(i.quantity)} {i.unit}</td>
                    <td className="p-3 text-fatima-ink/60">{Number(i.minStock)} {i.unit}</td>
                    <td className="p-3 text-fatima-ink/60">{i.supplier?.name || '—'}</td>
                    <td className="p-3">{low && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">LOW</span>}</td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-fatima-ink/40">No inventory items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showMove && <StockMovementModal onClose={() => setShowMove(false)} onCreated={load} />}
    </AppShell>
  );
}
