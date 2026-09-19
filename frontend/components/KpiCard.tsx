'use client';

export default function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = 'default',
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  icon?: any;
  accent?: 'default' | 'wine' | 'gold';
  onClick?: () => void;
}) {
  const accentClass =
    accent === 'wine'
      ? 'text-fatima-wine'
      : accent === 'gold'
      ? 'text-fatima-gold'
      : 'text-fatima-ink';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`text-left bg-white border border-fatima-sand rounded-2xl p-4 shadow-card transition-all ${
        onClick ? 'hover:border-fatima-gold hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-fatima-ink/45">{label}</div>
          <div className={`text-2xl font-semibold mt-1 ${accentClass}`}>{value}</div>
          {sublabel && <div className="text-xs text-fatima-ink/45 mt-0.5">{sublabel}</div>}
        </div>
        {Icon && (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-fatima-ivory flex items-center justify-center text-fatima-wine">
            <Icon size={17} />
          </div>
        )}
      </div>
    </button>
  );
}
