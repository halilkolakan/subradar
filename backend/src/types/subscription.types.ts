import type { BillingCycle, SubscriptionCategory } from '@prisma/client';

export interface SubscriptionDto {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  nextPaymentDate: Date;
  reminderDaysBefore: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionSummary {
  totalMonthlySpending: number;
  activeSubscriptionsCount: number;
  categoryBreakdown: Record<SubscriptionCategory, number>;
}
