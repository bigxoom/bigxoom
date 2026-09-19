export const ROOM_STATUSES = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'DIRTY', 'CLEANING', 'READY', 'MAINTENANCE', 'BLOCKED'] as const;
export type RoomStatusValue = (typeof ROOM_STATUSES)[number];

export const ROOM_STATUS_STYLE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  AVAILABLE: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E' },
  RESERVED: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  OCCUPIED: { bg: '#FDF2F4', text: '#6E1E2B', border: '#E8C3CA', dot: '#6E1E2B' },
  DIRTY: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444' },
  CLEANING: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  READY: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4', dot: '#14B8A6' },
  MAINTENANCE: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', dot: '#6B7280' },
  BLOCKED: { bg: '#1C1917', text: '#FAFAF9', border: '#1C1917', dot: '#FAFAF9' },
};

export function roomStatusStyle(status: string) {
  return ROOM_STATUS_STYLE[status] || ROOM_STATUS_STYLE.AVAILABLE;
}
