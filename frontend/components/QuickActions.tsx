'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, STORE_ROLES } from '@/lib/roles';
import { IconCalendar, IconUsers, IconMoney, IconUtensils, IconWrench, IconBox } from './icons';
import NewReservationModal from './NewReservationModal';
import NewMaintenanceModal from './NewMaintenanceModal';
import StockMovementModal from './StockMovementModal';

export default function QuickActions({ onChanged }: { onChanged?: () => void }) {
  const router = useRouter();
  const role = useCurrentUser()?.role || '';
  const [open, setOpen] = useState<'' | 'reservation' | 'maintenance' | 'stock'>('');

  const actions = [
    { label: 'New Reservation', icon: IconCalendar, onClick: () => setOpen('reservation') },
    { label: 'Check-In Guest', icon: IconUsers, onClick: () => router.push('/reservations') },
    { label: 'Record Payment', icon: IconMoney, onClick: () => router.push('/rooms') },
    { label: 'Open POS', icon: IconUtensils, onClick: () => router.push('/pos') },
    { label: 'New Maintenance Request', icon: IconWrench, onClick: () => setOpen('maintenance') },
    ...(STORE_ROLES.includes(role) ? [{ label: 'Stock Movement', icon: IconBox, onClick: () => setOpen('stock') }] : []),
  ];

  return (
    <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card">
      <h2 className="font-semibold text-fatima-wine mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex flex-col items-center justify-center gap-1.5 text-center px-2 py-3 rounded-xl border border-fatima-sand hover:border-fatima-gold hover:bg-fatima-ivory transition-colors"
          >
            <a.icon size={18} className="text-fatima-wine" />
            <span className="text-xs font-medium leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {open === 'reservation' && <NewReservationModal onClose={() => setOpen('')} onCreated={onChanged} />}
      {open === 'maintenance' && <NewMaintenanceModal onClose={() => setOpen('')} onCreated={onChanged} />}
      {open === 'stock' && <StockMovementModal onClose={() => setOpen('')} onCreated={onChanged} />}
    </div>
  );
}
