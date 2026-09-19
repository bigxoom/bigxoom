import { useEffect, useState } from 'react';

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

// Reads the logged-in user from localStorage, which isn't available during
// SSR — returning it straight from render would desync the server and first
// client render (hydration mismatch). This starts at null on every render
// pass and only picks up the real value after mount, once hydration is done.
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  return user;
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
