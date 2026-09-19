'use client';
import Link from 'next/link';
import { IconChefHat, IconSparkles, IconWrench, IconBox, IconArrowRight } from './icons';

function minsAgo(dateStr: string) {
  return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
}

function Column({
  icon: Icon,
  title,
  href,
  children,
  empty,
}: {
  icon: any;
  title: string;
  href: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-fatima-ink">
          <Icon size={15} className="text-fatima-wine" />
          {title}
        </div>
        <Link href={href} className="text-xs text-fatima-wine hover:underline flex items-center gap-0.5">
          View all <IconArrowRight size={11} />
        </Link>
      </div>
      <div className="space-y-1.5">
        {empty ? <p className="text-xs text-fatima-ink/40 py-1">Nothing active.</p> : children}
      </div>
    </div>
  );
}

function Row({ title, subtitle, tag, tagTone = 'default' }: { title: string; subtitle: string; tag: string; tagTone?: 'default' | 'urgent' }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-fatima-ivory rounded-lg px-2.5 py-1.5">
      <div className="min-w-0">
        <div className="text-xs font-medium truncate">{title}</div>
        <div className="text-[11px] text-fatima-ink/50 truncate">{subtitle}</div>
      </div>
      <span
        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
          tagTone === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-white text-fatima-ink/60 border border-fatima-sand'
        }`}
      >
        {tag}
      </span>
    </div>
  );
}

export default function LiveOperationsPanel({
  kitchenTickets,
  housekeepingTasks,
  maintenanceTickets,
  lowStockItems,
}: {
  kitchenTickets: any[];
  housekeepingTasks: any[];
  maintenanceTickets: any[];
  lowStockItems: any[];
}) {
  const hk = housekeepingTasks.filter((t) => t.status !== 'READY').slice(0, 4);
  const maint = maintenanceTickets.filter((t) => !['CLOSED', 'VERIFIED'].includes(t.status)).slice(0, 4);
  const kitchen = kitchenTickets.slice(0, 4);
  const stock = lowStockItems.slice(0, 4);

  return (
    <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card">
      <h2 className="font-semibold text-fatima-wine mb-4">Live Operations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Column icon={IconChefHat} title="Kitchen" href="/kitchen" empty={kitchen.length === 0}>
          {kitchen.map((t) => (
            <Row
              key={t.id}
              title={t.order?.room ? `Room ${t.order.room.number}` : t.order?.tableNumber ? `Table ${t.order.tableNumber}` : 'Order'}
              subtitle={(t.order?.items || []).map((i: any) => `${i.quantity}× ${i.menuItem?.name}`).join(', ') || '—'}
              tag={t.status}
              tagTone={minsAgo(t.createdAt) > 12 ? 'urgent' : 'default'}
            />
          ))}
        </Column>

        <Column icon={IconSparkles} title="Housekeeping" href="/housekeeping" empty={hk.length === 0}>
          {hk.map((t) => (
            <Row
              key={t.id}
              title={`Room ${t.room?.number}`}
              subtitle={t.assignedTo ? `Assigned: ${t.assignedTo.fullName}` : `Waiting ${minsAgo(t.createdAt)} min`}
              tag={t.status}
              tagTone={t.status === 'DIRTY' && minsAgo(t.createdAt) > 30 ? 'urgent' : 'default'}
            />
          ))}
        </Column>

        <Column icon={IconWrench} title="Maintenance" href="/maintenance" empty={maint.length === 0}>
          {maint.map((t) => (
            <Row
              key={t.id}
              title={t.room ? `Room ${t.room.number}` : t.category}
              subtitle={`${t.category} · Open ${minsAgo(t.createdAt)} min`}
              tag={t.status}
              tagTone={minsAgo(t.createdAt) > 60 ? 'urgent' : 'default'}
            />
          ))}
        </Column>

        <Column icon={IconBox} title="Inventory" href="/inventory" empty={stock.length === 0}>
          {stock.map((it) => (
            <Row
              key={it.id}
              title={it.name}
              subtitle={`${Number(it.quantity)} ${it.unit} in stock`}
              tag={Number(it.quantity) <= 0 ? 'Out' : 'Low'}
              tagTone="urgent"
            />
          ))}
        </Column>
      </div>
    </div>
  );
}
