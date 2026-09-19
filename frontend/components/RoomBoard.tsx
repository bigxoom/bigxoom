'use client';
import { useMemo } from 'react';
import { ROOM_STATUSES, roomStatusStyle } from '@/lib/roomStatus';

export default function RoomBoard({
  rooms,
  onSelect,
  selectedRoomId,
  dense = false,
}: {
  rooms: any[];
  onSelect: (room: any) => void;
  selectedRoomId?: string | null;
  dense?: boolean;
}) {
  const floors = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const r of rooms) {
      const key = r.floor || '—';
      (groups[key] ||= []).push(r);
    }
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((floor) => ({ floor, rooms: groups[floor].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) }));
  }, [rooms]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-xs">
        {ROOM_STATUSES.map((s) => {
          const style = roomStatusStyle(s);
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: style.dot }} />
              <span className="text-fatima-ink/60">{s}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-5">
        {floors.map(({ floor, rooms: floorRooms }) => (
          <div key={floor}>
            <div className="text-xs font-semibold uppercase tracking-wide text-fatima-ink/45 mb-2">Floor {floor}</div>
            <div className={`grid gap-2 ${dense ? 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-10'}`}>
              {floorRooms.map((r) => {
                const style = roomStatusStyle(r.status);
                const selected = selectedRoomId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    title={`${r.roomType?.name || ''} — ${r.status}`}
                    className={`rounded-xl border px-1 py-2.5 text-center transition-transform hover:-translate-y-0.5 ${
                      selected ? 'ring-2 ring-fatima-gold' : ''
                    }`}
                    style={{ background: style.bg, borderColor: style.border, color: style.text }}
                  >
                    <div className="font-semibold text-sm leading-tight">{r.number}</div>
                    <div className="text-[9px] uppercase tracking-wide leading-tight mt-0.5 opacity-80 truncate px-0.5">
                      {r.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {floors.length === 0 && <p className="text-sm text-fatima-ink/50">No rooms found.</p>}
      </div>
    </div>
  );
}
