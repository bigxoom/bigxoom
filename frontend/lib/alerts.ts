// Simple, explainable business rules — no AI. Every threshold here is a
// plain "if X then alert" a shift supervisor could read and agree with.

const KITCHEN_DELAY_MINUTES = 12;
const DIRTY_ROOM_MINUTES = 30;

function minutesSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / 60000;
}

export type Alert = {
  id: string;
  label: string;
  count: number;
  tone: 'urgent' | 'warning' | 'info';
  href: string;
};

export function computeAlerts({
  maintenanceOpen,
  housekeepingTasks,
  kitchenTickets,
  lowStockItems,
  reservations,
}: {
  maintenanceOpen: number;
  housekeepingTasks: any[];
  kitchenTickets: any[];
  lowStockItems: number;
  reservations: any[];
}): Alert[] {
  const alerts: Alert[] = [];

  const dirtyTooLong = housekeepingTasks.filter((t) => t.status === 'DIRTY' && minutesSince(t.createdAt) > DIRTY_ROOM_MINUTES).length;
  const roomsNeedCleaning = housekeepingTasks.filter((t) => t.status !== 'READY').length;

  const delayedOrders = kitchenTickets.filter(
    (t) => ['NEW', 'ACCEPTED', 'PREPARING'].includes(t.status) && minutesSince(t.createdAt) > KITCHEN_DELAY_MINUTES,
  ).length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const arrivalsPending = reservations.filter((r) => {
    const arrival = new Date(r.arrivalDate);
    return arrival >= startOfDay && arrival < endOfDay && r.status !== 'CHECKED_IN' && r.status !== 'CANCELLED' && r.status !== 'NO_SHOW';
  }).length;

  if (maintenanceOpen > 0) {
    alerts.push({ id: 'maintenance', label: `${maintenanceOpen} Maintenance Issue${maintenanceOpen === 1 ? '' : 's'}`, count: maintenanceOpen, tone: 'urgent', href: '/maintenance' });
  }
  if (roomsNeedCleaning > 0) {
    alerts.push({
      id: 'housekeeping',
      label: `${roomsNeedCleaning} Room${roomsNeedCleaning === 1 ? '' : 's'} Need Cleaning${dirtyTooLong ? ` (${dirtyTooLong} overdue)` : ''}`,
      count: roomsNeedCleaning,
      tone: dirtyTooLong > 0 ? 'urgent' : 'warning',
      href: '/housekeeping',
    });
  }
  if (lowStockItems > 0) {
    alerts.push({ id: 'inventory', label: `${lowStockItems} Low Stock Item${lowStockItems === 1 ? '' : 's'}`, count: lowStockItems, tone: 'warning', href: '/inventory' });
  }
  if (delayedOrders > 0) {
    alerts.push({ id: 'kitchen', label: `${delayedOrders} Delayed Kitchen Order${delayedOrders === 1 ? '' : 's'}`, count: delayedOrders, tone: 'urgent', href: '/kitchen' });
  }
  if (arrivalsPending > 0) {
    alerts.push({ id: 'arrivals', label: `${arrivalsPending} Arrival${arrivalsPending === 1 ? '' : 's'} Awaiting Check-In`, count: arrivalsPending, tone: 'info', href: '/reservations' });
  }

  return alerts;
}
