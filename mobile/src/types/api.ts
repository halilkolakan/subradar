export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'WEEKLY';

export type SubscriptionCategory =
  | 'STREAMING'
  | 'SOFTWARE'
  | 'UTILITIES'
  | 'GAMING'
  | 'FITNESS'
  | 'OTHER';

export const BILLING_CYCLES: readonly BillingCycle[] = ['MONTHLY', 'YEARLY', 'WEEKLY'];

export const CATEGORIES: readonly SubscriptionCategory[] = [
  'STREAMING',
  'SOFTWARE',
  'UTILITIES',
  'GAMING',
  'FITNESS',
  'OTHER',
];

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  nextPaymentDate: string;
  reminderDaysBefore: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  totalMonthlySpending: number;
  activeSubscriptionsCount: number;
  categoryBreakdown: Record<SubscriptionCategory, number>;
}

export interface SubscriptionQuery {
  category?: SubscriptionCategory;
  isActive?: boolean;
  search?: string;
}

export interface CreateSubscriptionInput {
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  nextPaymentDate: string;
  reminderDaysBefore: number;
  notes?: string;
}

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput> & { isActive?: boolean };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}
