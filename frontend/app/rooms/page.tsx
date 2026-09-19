'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import RoomBoard from '@/components/RoomBoard';
import RoomDetailDrawer from '@/components/RoomDetailDrawer';
import { api } from '@/lib/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  function load() {
    api('/rooms').then(setRooms).catch(() => {});
  }

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setSelectedRoomId(room);
  }, []);

  return (
    <AppShell title="Room Map — 90 Rooms">
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card">
          <RoomBoard rooms={rooms} onSelect={(r) => setSelectedRoomId(r.id)} selectedRoomId={selectedRoomId} />
        </div>
      </div>
      {selectedRoomId && (
        <RoomDetailDrawer roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} onChanged={load} />
      )}
    </AppShell>
  );
}
