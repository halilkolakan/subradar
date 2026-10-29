import type { Subscription } from '../types/api';
import { addDays, addMonths, startOfDay } from './dates';
import { daysUntil } from './format';

export const URGENT_DAYS = 3;
const DAYS_PER_WEEK = 7;
const MS_PER_WEEK = DAYS_PER_WEEK * 24 * 60 * 60 * 1000;

export interface BillingCharge {
  id: string;
  subscription: Subscription;
  date: Date;
}

export const isUrgent = (subscription: Subscription): boolean => {
  if (!subscription.isActive) return false;
  const days = daysUntil(subscription.nextPaymentDate);
  return days >= 0 && days <= URGENT_DAYS;
};

const monthIndex = (date: Date): number => date.getFullYear() * 12 + date.getMonth();

const chargesForSubscription = (subscription: Subscription, monthStart: Date): Date[] => {
  const anchor = new Date(subscription.nextPaymentDate);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

  if (subscription.billingCycle === 'WEEKLY') {
    const firstIndex = Math.floor((monthStart.getTime() - anchor.getTime()) / MS_PER_WEEK) - 1;
    const dates: Date[] = [];
    for (let index = firstIndex; ; index += 1) {
      const date = addDays(anchor, index * DAYS_PER_WEEK);
      if (date >= monthEnd) return dates;
      if (date >= monthStart) dates.push(date);
    }
  }

  const stepMonths = subscription.billingCycle === 'YEARLY' ? 12 : 1;
  const monthDiff = monthIndex(monthStart) - monthIndex(anchor);
  if (monthDiff % stepMonths !== 0) return [];
  return [addMonths(anchor, monthDiff)];
};

/**
 * Derives billing events from each active subscription's schedule: its stored next payment
 * date is the anchor, and the billing cycle projects it backwards and forwards.
 * Only charges that are already due (through the end of today) are returned, newest first.
 */
export const getBilledChargesInMonth = (
  subscriptions: readonly Subscription[],
  monthStart: Date,
  now: Date = new Date(),
): BillingCharge[] => {
  const cutoff = addDays(startOfDay(now), 1);

  return subscriptions
    .filter((subscription) => subscription.isActive)
    .flatMap((subscription) =>
      chargesForSubscription(subscription, monthStart)
        .filter((date) => date < cutoff)
        .map((date) => ({ id: `${subscription.id}-${date.getTime()}`, subscription, date })),
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const sumCharges = (charges: readonly BillingCharge[]): number =>
  charges.reduce((total, charge) => total + charge.subscription.price, 0);
