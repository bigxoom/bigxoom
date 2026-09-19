'use client';
import { IconX } from './icons';

export default function Modal({
  title,
  onClose,
  children,
  width = 'max-w-lg',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fatima-ink/40 fatima-backdrop-enter" onClick={onClose} />
      <div className={`relative w-full ${width} bg-white rounded-2xl shadow-panel fatima-backdrop-enter max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-fatima-sand">
          <h2 className="font-semibold text-fatima-wine">{title}</h2>
          <button onClick={onClose} className="text-fatima-ink/50 hover:text-fatima-ink p-1 rounded-lg hover:bg-fatima-ivory">
            <IconX size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
