export type CurrentUser = { id: string; fullName: string; username: string; role: string; department?: string };

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('fatima_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GENERAL_MANAGER'];
export const FRONT_OFFICE_ROLES = [...ADMIN_ROLES, 'RECEPTIONIST', 'CASHIER', 'SUPERVISOR'];
export const FNB_ROLES = [...ADMIN_ROLES, 'WAITER', 'BAR_STAFF', 'SUPERVISOR'];
export const KITCHEN_ROLES = [...ADMIN_ROLES, 'KITCHEN_STAFF', 'SUPERVISOR'];
export const HOUSEKEEPING_ROLES = [...ADMIN_ROLES, 'HOUSEKEEPING', 'SUPERVISOR'];
export const MAINTENANCE_ROLES = [...ADMIN_ROLES, 'MAINTENANCE', 'SUPERVISOR'];
export const STORE_ROLES = [...ADMIN_ROLES, 'STOREKEEPER', 'SUPERVISOR'];
export const FINANCE_ROLES = [...ADMIN_ROLES, 'CASHIER', 'ACCOUNTANT'];
export const AUDIT_ROLES = [...ADMIN_ROLES, 'AUDITOR'];

export function isAdmin(role?: string | null) {
  return !!role && ADMIN_ROLES.includes(role);
}

export function roleLabel(role?: string | null) {
  if (!role) return '';
  return role
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}
