'use client';
import { IconX } from './icons';

export default function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-fatima-ink/40 fatima-backdrop-enter" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-panel fatima-panel-enter flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-fatima-sand bg-fatima-ivory">
          <div>
            <h2 className="font-semibold text-fatima-wine text-lg">{title}</h2>
            {subtitle && <div className="text-sm text-fatima-ink/60 mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-fatima-ink/50 hover:text-fatima-ink p-1.5 rounded-lg hover:bg-white">
            <IconX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
