'use client';
import { useRouter } from 'next/navigation';
import { Alert } from '@/lib/alerts';
import { IconAlert, IconCheckCircle } from './icons';

const TONE_STYLE: Record<string, string> = {
  urgent: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function AttentionRequired({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();

  return (
    <div className="bg-white border border-fatima-sand rounded-2xl p-5 shadow-card h-full">
      <h2 className="font-semibold text-fatima-wine mb-3">Attention Required</h2>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-700 py-2">
          <IconCheckCircle size={17} />
          All operations are on track.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <button
              key={a.id}
              onClick={() => router.push(a.href)}
              className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border text-sm transition-opacity hover:opacity-80 ${TONE_STYLE[a.tone]}`}
            >
              <IconAlert size={15} className="shrink-0" />
              <span className="font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
