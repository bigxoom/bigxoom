import {
  IconHome, IconCalendar, IconBed, IconUsers, IconUtensils, IconGlass, IconChefHat,
  IconSparkles, IconWrench, IconBox, IconChart, IconMessage, IconShield, IconGear,
} from '@/components/icons';
import {
  ADMIN_ROLES, FRONT_OFFICE_ROLES, FNB_ROLES, KITCHEN_ROLES, HOUSEKEEPING_ROLES,
  MAINTENANCE_ROLES, STORE_ROLES, FINANCE_ROLES, AUDIT_ROLES,
} from './roles';

export type NavItem = {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  built: boolean;
};

export type NavGroup = {
  label: string | null;
  items: NavItem[];
};

export const NAV: NavGroup[] = [
  {
    label: null,
    items: [{ label: 'Dashboard', href: '/dashboard', icon: IconHome, roles: ['*'], built: true }],
  },
  {
    label: 'Front Office',
    items: [
      { label: 'Reservations', href: '/reservations', icon: IconCalendar, roles: FRONT_OFFICE_ROLES, built: true },
      { label: 'Reception', href: '/reservations', icon: IconUsers, roles: FRONT_OFFICE_ROLES, built: false },
      { label: 'Rooms', href: '/rooms', icon: IconBed, roles: FRONT_OFFICE_ROLES.concat(HOUSEKEEPING_ROLES), built: true },
      { label: 'Guests & Folios', href: '/guests', icon: IconUsers, roles: FRONT_OFFICE_ROLES.concat(FINANCE_ROLES), built: true },
    ],
  },
  {
    label: 'Food & Beverage',
    items: [
      { label: 'Restaurant POS', href: '/pos', icon: IconUtensils, roles: FNB_ROLES, built: true },
      { label: 'Bar POS', href: '/pos', icon: IconGlass, roles: FNB_ROLES, built: true },
      { label: 'Kitchen', href: '/kitchen', icon: IconChefHat, roles: KITCHEN_ROLES, built: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Housekeeping', href: '/housekeeping', icon: IconSparkles, roles: HOUSEKEEPING_ROLES, built: true },
      { label: 'Maintenance', href: '/maintenance', icon: IconWrench, roles: MAINTENANCE_ROLES, built: true },
      { label: 'Inventory', href: '/inventory', icon: IconBox, roles: STORE_ROLES, built: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Finance & Reports', href: '/reports', icon: IconChart, roles: FINANCE_ROLES.concat(ADMIN_ROLES), built: false },
      { label: 'Communication', href: '/messages', icon: IconMessage, roles: ['*'], built: false },
      { label: 'Audit', href: '/audit', icon: IconShield, roles: AUDIT_ROLES, built: true },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users & Roles', href: '/users', icon: IconUsers, roles: ADMIN_ROLES, built: false },
      { label: 'Settings', href: '/settings', icon: IconGear, roles: ADMIN_ROLES, built: false },
    ],
  },
];

export function navForRole(role?: string | null): NavGroup[] {
  const r = role || '';
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes('*') || item.roles.includes(r)),
  })).filter((group) => group.items.length > 0);
}
