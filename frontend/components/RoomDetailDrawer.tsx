'use client';
import { useEffect, useState } from 'react';
import Drawer from './Drawer';
import { api } from '@/lib/api';
import { getCurrentUser, ADMIN_ROLES, FRONT_OFFICE_ROLES, FNB_ROLES, FINANCE_ROLES, HOUSEKEEPING_ROLES, MAINTENANCE_ROLES } from '@/lib/roles';
import { ROOM_STATUSES, roomStatusStyle } from '@/lib/roomStatus';
import { IconCheckCircle, IconCircle, IconUsers } from './icons';

const money = (n: number) => `${Math.round(n).toLocaleString()} RWF`;

const CAN_ADD_CHARGE = [...FRONT_OFFICE_ROLES, ...FNB_ROLES];
const CAN_RECORD_PAYMENT = [...FINANCE_ROLES, ...ADMIN_ROLES];
const CAN_CHECK_OUT = [...FRONT_OFFICE_ROLES, ...ADMIN_ROLES];
const CAN_CHANGE_STATUS = [...ADMIN_ROLES, ...HOUSEKEEPING_ROLES, ...MAINTENANCE_ROLES];

function TimelineStep({ done, label, detail }: { done: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      {done ? (
        <IconCheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
      ) : (
        <IconCircle size={16} className="text-fatima-ink/25 mt-0.5 shrink-0" />
      )}
      <div className="min-w-0">
        <div className={`text-sm ${done ? 'text-fatima-ink' : 'text-fatima-ink/45'}`}>{label}</div>
        {detail && <div className="text-xs text-fatima-ink/45">{detail}</div>}
      </div>
    </div>
  );
}

export default function RoomDetailDrawer({
  roomId,
  onClose,
  onChanged,
}: {
  roomId: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const user = getCurrentUser();
  const role = user?.role || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<'' | 'charge' | 'payment' | 'maintenance' | 'status' | 'guest' | 'items'>('');

  const [chargeForm, setChargeForm] = useState({ category: 'RESTAURANT', description: '', amount: '' });
  const [paymentForm, setPaymentForm] = useState({ method: 'CASH', amount: '', reference: '' });
  const [maintForm, setMaintForm] = useState({ category: 'General', description: '' });
  const [statusChoice, setStatusChoice] = useState('');

  function load() {
    setLoading(true);
    api(`/rooms/${roomId}/occupancy`)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message || 'Failed to load room'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    setPanel('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function notifyChanged() {
    onChanged?.();
    load();
  }

  async function submitCharge(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.folio?.id || !chargeForm.amount) return;
    setBusy(true);
    try {
      await api(`/folios/${data.folio.id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          category: chargeForm.category,
          description: chargeForm.description || chargeForm.category,
          amount: Number(chargeForm.amount),
        }),
      });
      setChargeForm({ category: 'RESTAURANT', description: '', amount: '' });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to add charge');
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.folio?.id || !paymentForm.amount) return;
    setBusy(true);
    try {
      await api(`/folios/${data.folio.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          method: paymentForm.method,
          amount: Number(paymentForm.amount),
          reference: paymentForm.reference || undefined,
        }),
      });
      setPaymentForm({ method: 'CASH', amount: '', reference: '' });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to record payment');
    } finally {
      setBusy(false);
    }
  }

  async function submitMaintenance(e: React.FormEvent) {
    e.preventDefault();
    if (!maintForm.description.trim()) return;
    setBusy(true);
    try {
      await api('/maintenance/tickets', {
        method: 'POST',
        body: JSON.stringify({ roomId, category: maintForm.category, description: maintForm.description }),
      });
      setMaintForm({ category: 'General', description: '' });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to create maintenance ticket');
    } finally {
      setBusy(false);
    }
  }

  async function checkOut() {
    if (!data?.stay?.id) return;
    if (!confirm('Check out this guest? The folio must be fully paid.')) return;
    setBusy(true);
    try {
      await api(`/reservations/stays/${data.stay.id}/check-out`, { method: 'POST' });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to check out');
    } finally {
      setBusy(false);
    }
  }

  async function checkInNow() {
    if (!data?.reservation?.id) return;
    setBusy(true);
    try {
      await api(`/reservations/${data.reservation.id}/check-in`, { method: 'POST' });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to check in');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus() {
    if (!statusChoice) return;
    setBusy(true);
    try {
      await api(`/rooms/${roomId}/status`, { method: 'PATCH', body: JSON.stringify({ status: statusChoice }) });
      setPanel('');
      notifyChanged();
    } catch (e: any) {
      setError(e.message || 'Failed to update room status');
    } finally {
      setBusy(false);
    }
  }

  const room = data?.room;
  const style = room ? roomStatusStyle(room.status) : null;

  return (
    <Drawer
      title={room ? `Room ${room.number}` : 'Room'}
      subtitle={
        room && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-1"
            style={{ background: style!.bg, color: style!.text, borderColor: style!.border }}
          >
            {room.status}
          </span>
        )
      }
      onClose={onClose}
    >
      {loading && <p className="text-sm text-fatima-ink/50">Loading…</p>}
      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      {!loading && room && (
        <div className="space-y-5">
          <div className="text-sm text-fatima-ink/60">
            {room.roomType?.name} · Floor {room.floor} · {Number(room.roomType?.basePrice || 0).toLocaleString()} RWF/night
          </div>

          {/* Occupied: full guest journey + folio */}
          {data.stay && (
            <>
              <div className="bg-fatima-ivory rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <IconUsers size={16} className="text-fatima-wine" />
                  <div className="font-semibold text-sm">{data.stay.guest?.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-fatima-ink/60">
                  <div>Check-in<div className="text-fatima-ink font-medium text-sm">{new Date(data.stay.checkInAt).toLocaleDateString()}</div></div>
                  <div>Check-out<div className="text-fatima-ink font-medium text-sm">{data.stay.reservation?.departureDate ? new Date(data.stay.reservation.departureDate).toLocaleDateString() : '—'}</div></div>
                </div>
                <button onClick={() => setPanel(panel === 'guest' ? '' : 'guest')} className="text-xs text-fatima-wine hover:underline mt-2">
                  {panel === 'guest' ? 'Hide guest details' : 'View guest details'}
                </button>
                {panel === 'guest' && (
                  <div className="mt-2 text-xs text-fatima-ink/70 space-y-0.5 border-t border-fatima-sand pt-2">
                    <div>Phone: {data.stay.guest?.phone || '—'}</div>
                    <div>Email: {data.stay.guest?.email || '—'}</div>
                    <div>Nationality: {data.stay.guest?.nationality || '—'}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/45 mb-1.5">Guest Journey</div>
                <TimelineStep done={!!data.stay.reservation} label="Reservation Created" />
                <TimelineStep done label={`Checked In — Room ${room.number}`} />
                <TimelineStep done={(data.folio?.byCategory?.ACCOMMODATION || 0) > 0} label="Accommodation" detail={data.folio?.byCategory?.ACCOMMODATION ? money(data.folio.byCategory.ACCOMMODATION) : undefined} />
                <TimelineStep done={(data.folio?.byCategory?.RESTAURANT || 0) > 0} label="Restaurant" detail={data.folio?.byCategory?.RESTAURANT ? money(data.folio.byCategory.RESTAURANT) : undefined} />
                <TimelineStep done={(data.folio?.byCategory?.BAR || 0) > 0} label="Bar" detail={data.folio?.byCategory?.BAR ? money(data.folio.byCategory.BAR) : undefined} />
                <TimelineStep done={(data.folio?.paid || 0) > 0} label="Payment" detail={data.folio?.paid ? money(data.folio.paid) : undefined} />
                <TimelineStep done={(data.folio?.balance || 0) === 0} label="Balance Settled" detail={money(data.folio?.balance || 0)} />
                <TimelineStep done={false} label="Check-Out Pending" />
              </div>

              <div className="border border-fatima-sand rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/45">Folio</div>
                  <button onClick={() => setPanel(panel === 'items' ? '' : 'items')} className="text-xs text-fatima-wine hover:underline">
                    {panel === 'items' ? 'Hide items' : 'View items'}
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-fatima-ink/60">Current Folio</span><span className="font-medium">{money(data.folio?.charges || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-fatima-ink/60">Paid</span><span className="font-medium text-green-700">{money(data.folio?.paid || 0)}</span></div>
                  <div className="flex justify-between border-t border-fatima-sand pt-1 mt-1"><span className="font-semibold">Balance</span><span className={`font-semibold ${data.folio?.balance ? 'text-fatima-wine' : 'text-green-700'}`}>{money(data.folio?.balance || 0)}</span></div>
                </div>
                {panel === 'items' && (
                  <div className="mt-3 border-t border-fatima-sand pt-2 space-y-1 max-h-40 overflow-y-auto">
                    {(data.folio?.items || []).length === 0 && <p className="text-xs text-fatima-ink/40">No charges yet.</p>}
                    {(data.folio?.items || []).map((it: any) => (
                      <div key={it.id} className="flex justify-between text-xs">
                        <span className="text-fatima-ink/70">{it.description} <span className="text-fatima-ink/40">({it.category})</span></span>
                        <span className="font-medium">{money(Number(it.amount))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {CAN_ADD_CHARGE.includes(role) && (
                  <button onClick={() => setPanel(panel === 'charge' ? '' : 'charge')} className="px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold">
                    Add Charge
                  </button>
                )}
                {CAN_RECORD_PAYMENT.includes(role) && (
                  <button onClick={() => setPanel(panel === 'payment' ? '' : 'payment')} className="px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold">
                    Record Payment
                  </button>
                )}
                {CAN_CHECK_OUT.includes(role) && (
                  <button disabled={busy} onClick={checkOut} className="px-3 py-1.5 rounded-lg text-sm bg-fatima-wine text-white hover:bg-fatima-wine-dark disabled:opacity-50">
                    Check Out
                  </button>
                )}
                <button onClick={() => setPanel(panel === 'maintenance' ? '' : 'maintenance')} className="px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold">
                  Report Maintenance
                </button>
              </div>

              {panel === 'charge' && (
                <form onSubmit={submitCharge} className="bg-fatima-ivory rounded-xl p-3.5 space-y-2">
                  <select value={chargeForm.category} onChange={(e) => setChargeForm({ ...chargeForm, category: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white">
                    {['ACCOMMODATION', 'RESTAURANT', 'BAR', 'LAUNDRY', 'OTHER'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="Description" value={chargeForm.description} onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white" />
                  <input placeholder="Amount (RWF)" type="number" min="0" value={chargeForm.amount} onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white" />
                  <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-1.5 text-sm hover:bg-fatima-bronze disabled:opacity-50">Post Charge</button>
                </form>
              )}

              {panel === 'payment' && (
                <form onSubmit={submitPayment} className="bg-fatima-ivory rounded-xl p-3.5 space-y-2">
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white">
                    {['CASH', 'MOBILE_MONEY', 'CARD', 'BANK'].map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                  <input placeholder="Amount (RWF)" type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white" />
                  <input placeholder="Reference (optional)" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white" />
                  <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-1.5 text-sm hover:bg-fatima-bronze disabled:opacity-50">Record Payment</button>
                </form>
              )}
            </>
          )}

          {/* Not occupied but reserved */}
          {!data.stay && data.reservation && (
            <div className="bg-fatima-ivory rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <IconUsers size={16} className="text-fatima-wine" />
                <div className="font-semibold text-sm">{data.reservation.guest?.fullName}</div>
              </div>
              <div className="text-xs text-fatima-ink/60">Reserved · arrives {new Date(data.reservation.arrivalDate).toLocaleDateString()}</div>
              {CAN_CHECK_OUT.includes(role) && (
                <button disabled={busy} onClick={checkInNow} className="mt-3 w-full bg-fatima-wine text-white rounded-lg py-1.5 text-sm hover:bg-fatima-wine-dark disabled:opacity-50">
                  Check In Now
                </button>
              )}
              <button onClick={() => setPanel(panel === 'maintenance' ? '' : 'maintenance')} className="mt-2 w-full px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold">
                Report Maintenance
              </button>
            </div>
          )}

          {/* Fully vacant */}
          {!data.stay && !data.reservation && (
            <div className="bg-fatima-ivory rounded-xl p-3.5 text-sm text-fatima-ink/60">
              No guest currently assigned to this room.
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => setPanel(panel === 'maintenance' ? '' : 'maintenance')} className="px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold bg-white">
                  Report Maintenance
                </button>
                {CAN_CHANGE_STATUS.includes(role) && (
                  <button onClick={() => setPanel(panel === 'status' ? '' : 'status')} className="px-3 py-1.5 rounded-lg text-sm border border-fatima-sand hover:border-fatima-gold bg-white">
                    Change Status
                  </button>
                )}
              </div>
            </div>
          )}

          {panel === 'maintenance' && (
            <form onSubmit={submitMaintenance} className="bg-fatima-ivory rounded-xl p-3.5 space-y-2">
              <select value={maintForm.category} onChange={(e) => setMaintForm({ ...maintForm, category: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white">
                {['General', 'Electrical', 'Plumbing', 'Air Conditioning', 'Furniture'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Describe the problem" value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white" rows={2} />
              <button disabled={busy} className="w-full bg-fatima-gold text-white rounded-lg py-1.5 text-sm hover:bg-fatima-bronze disabled:opacity-50">Submit Ticket</button>
            </form>
          )}

          {panel === 'status' && (
            <div className="bg-fatima-ivory rounded-xl p-3.5 space-y-2">
              <select value={statusChoice} onChange={(e) => setStatusChoice(e.target.value)} className="w-full border border-fatima-sand rounded-lg px-2.5 py-1.5 text-sm bg-white">
                <option value="">Select new status…</option>
                {ROOM_STATUSES.filter((s) => s !== room.status).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button disabled={busy || !statusChoice} onClick={changeStatus} className="w-full bg-fatima-gold text-white rounded-lg py-1.5 text-sm hover:bg-fatima-bronze disabled:opacity-50">Update Status</button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
