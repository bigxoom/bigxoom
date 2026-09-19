// Hand-rolled line icons (Feather-style) so we add zero icon-library dependencies.
type IconProps = { className?: string; size?: number };

function base(paths: React.ReactNode) {
  return function Icon({ className = '', size = 18 }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {paths}
      </svg>
    );
  };
}

export const IconHome = base(<path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />);
export const IconBed = base(
  <>
    <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
    <path d="M3 18h18" />
    <path d="M3 14h18" />
    <path d="M7 9V6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3" />
  </>,
);
export const IconCalendar = base(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);
export const IconUsers = base(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 4.3a3.2 3.2 0 0 1 0 6.2M21 20c0-2.7-1.8-4.7-4.2-5.3" />
  </>,
);
export const IconUtensils = base(
  <>
    <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12" />
    <path d="M16 3c-1.2 0-2 1.5-2 4s.8 4 2 4v9" />
  </>,
);
export const IconGlass = base(
  <>
    <path d="M6 3h12l-1.4 14a3 3 0 0 1-3 2.6h-3.2a3 3 0 0 1-3-2.6L6 3Z" />
    <path d="M8.5 8.5h7" />
  </>,
);
export const IconChefHat = base(
  <>
    <path d="M6 12.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.5" />
    <path d="M6.2 12.6A4 4 0 0 1 7 4.8 4.5 4.5 0 0 1 12 2a4.5 4.5 0 0 1 5 2.8 4 4 0 0 1 .8 7.8" />
  </>,
);
export const IconSparkles = base(
  <>
    <path d="M12 3v4M12 17v4M4 12h4M16 12h4" />
    <path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
  </>,
);
export const IconWrench = base(
  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z" />,
);
export const IconBox = base(
  <>
    <path d="M21 8.5 12 4 3 8.5 12 13l9-4.5Z" />
    <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
    <path d="M12 13v7.5" />
  </>,
);
export const IconChart = base(
  <>
    <path d="M4 20V10M11 20V4M18 20v-6" />
    <path d="M3 20h18" />
  </>,
);
export const IconMessage = base(
  <path d="M4 4h16v12H8l-4 4V4Z" />,
);
export const IconShield = base(
  <path d="M12 3 4.5 5.5v6c0 4.4 3.1 7.3 7.5 9 4.4-1.7 7.5-4.6 7.5-9v-6L12 3Z" />,
);
export const IconGear = base(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" />
  </>,
);
export const IconActivity = base(<path d="M3 12h4l2-7 4 14 2-7h6" />);
export const IconLogout = base(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>,
);
export const IconSearch = base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconBell = base(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);
export const IconWifi = base(
  <>
    <path d="M2 8.5a16 16 0 0 1 20 0" />
    <path d="M5.5 12a11 11 0 0 1 13 0" />
    <path d="M9 15.5a6 6 0 0 1 6 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </>,
);
export const IconChevronDown = base(<path d="m6 9 6 6 6-6" />);
export const IconChevronRight = base(<path d="m9 6 6 6-6 6" />);
export const IconX = base(<path d="M18 6 6 18M6 6l12 12" />);
export const IconCheck = base(<path d="M20 6 9 17l-5-5" />);
export const IconCheckCircle = base(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.3 2.3L16 10" /></>);
export const IconCircle = base(<circle cx="12" cy="12" r="9" />);
export const IconPlus = base(<path d="M12 5v14M5 12h14" />);
export const IconAlert = base(
  <>
    <path d="M10.3 3.9 2.4 18a1 1 0 0 0 .9 1.5h17.4a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.7 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </>,
);
export const IconClock = base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>);
export const IconArrowRight = base(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconMoney = base(
  <>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9v.01M18 15v.01" />
  </>,
);
export const IconReceipt = base(
  <>
    <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" />
    <path d="M9 7.5h6M9 11h6M9 14.5h4" />
  </>,
);
export const IconDroplet = base(<path d="M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3Z" />);
export const IconClipboard = base(
  <>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="M9 11h6M9 15h6" />
  </>,
);
