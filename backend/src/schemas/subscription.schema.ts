import { BillingCycle, SubscriptionCategory } from '@prisma/client';
import { z } from 'zod';

const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Must be a valid ISO date string')
  .transform((value) => new Date(value));

const baseSubscriptionShape = {
  name: z.string().trim().min(1).max(100),
  price: z.number().positive().max(99_999_999.99),
  currency: z.string().trim().toUpperCase().length(3, 'Currency must be a 3-letter ISO code'),
  billingCycle: z.enum(BillingCycle),
  category: z.enum(SubscriptionCategory),
  nextPaymentDate: isoDateString,
  reminderDaysBefore: z.number().int().min(1).max(30),
  notes: z.string().trim().max(1000).optional(),
};

export const createSubscriptionSchema = z.object({
  ...baseSubscriptionShape,
  currency: baseSubscriptionShape.currency.default('TRY'),
  reminderDaysBefore: baseSubscriptionShape.reminderDaysBefore.default(3),
});

export const updateSubscriptionSchema = z
  .object({
    ...baseSubscriptionShape,
    isActive: z.boolean(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');

const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

export const querySubscriptionSchema = z.object({
  category: z.enum(SubscriptionCategory).optional(),
  isActive: booleanQuery.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const upcomingQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

export const subscriptionIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type QuerySubscriptionInput = z.infer<typeof querySubscriptionSchema>;
export type UpcomingQueryInput = z.infer<typeof upcomingQuerySchema>;
