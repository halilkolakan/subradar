import type { BillingCycle } from '../types/api';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const formatMoney = (amount: number, currency = 'TRY'): string =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const daysUntil = (isoDate: string, now: Date = new Date()): number =>
  Math.round((startOfDay(new Date(isoDate)) - startOfDay(now)) / MS_PER_DAY);

export const formatDaysLeft = (days: number): string => {
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export const formatCycleAdverb = (cycle: BillingCycle): string => cycle.toLowerCase();

export const formatCycleBadge = (cycle: BillingCycle): string => {
  switch (cycle) {
    case 'MONTHLY':
      return '1 month';
    case 'YEARLY':
      return '1 year';
    case 'WEEKLY':
      return '1 week';
  }
};

export const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateLong = (date: Date): string =>
  date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

export const formatCharged = (date: Date): string =>
  date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const formatMonthYear = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const formatMonth = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long' });

export const formatDebit = (amount: number, currency = 'TRY'): string =>
  `-${formatMoney(amount, currency)}`;
