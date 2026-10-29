import { BillingCycle, Prisma, SubscriptionCategory, type Subscription } from '@prisma/client';
import { prisma } from '../config/prisma';
import type {
  CreateSubscriptionInput,
  QuerySubscriptionInput,
  UpdateSubscriptionInput,
} from '../schemas/subscription.schema';
import type { SubscriptionDto, SubscriptionSummary } from '../types/subscription.types';
import { NotFoundError } from '../utils/AppError';

const WEEKS_PER_MONTH = 4.33;
const MONTHS_PER_YEAR = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const toMonthlyAmount = (price: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case BillingCycle.YEARLY:
      return price / MONTHS_PER_YEAR;
    case BillingCycle.WEEKLY:
      return price * WEEKS_PER_MONTH;
    case BillingCycle.MONTHLY:
      return price;
  }
};

const toDto = (subscription: Subscription): SubscriptionDto => ({
  ...subscription,
  price: subscription.price.toNumber(),
});

export class SubscriptionService {
  async create(userId: string, data: CreateSubscriptionInput): Promise<SubscriptionDto> {
    const created = await prisma.subscription.create({ data: { ...data, userId } });
    return toDto(created);
  }

  async getAll(userId: string, filters: QuerySubscriptionInput): Promise<SubscriptionDto[]> {
    const where: Prisma.SubscriptionWhereInput = {
      userId,
      ...(filters.category && { category: filters.category }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
    };

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { nextPaymentDate: 'asc' },
    });
    return subscriptions.map(toDto);
  }

  async getById(userId: string, id: string): Promise<SubscriptionDto> {
    const subscription = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }
    return toDto(subscription);
  }

  async update(userId: string, id: string, data: UpdateSubscriptionInput): Promise<SubscriptionDto> {
    await this.getById(userId, id);
    const updated = await prisma.subscription.update({ where: { id }, data });
    return toDto(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await prisma.subscription.delete({ where: { id } });
  }

  async getSummary(userId: string): Promise<SubscriptionSummary> {
    const active = await prisma.subscription.findMany({
      where: { userId, isActive: true },
      select: { price: true, billingCycle: true, category: true },
    });

    const breakdown = Object.fromEntries(
      Object.values(SubscriptionCategory).map((category) => [category, 0]),
    ) as Record<SubscriptionCategory, number>;

    let total = 0;
    for (const { price, billingCycle, category } of active) {
      const monthly = toMonthlyAmount(price.toNumber(), billingCycle);
      total += monthly;
      breakdown[category] += monthly;
    }

    for (const category of Object.values(SubscriptionCategory)) {
      breakdown[category] = roundMoney(breakdown[category]);
    }

    return {
      totalMonthlySpending: roundMoney(total),
      activeSubscriptionsCount: active.length,
      categoryBreakdown: breakdown,
    };
  }

  async getUpcoming(userId: string, days = 7): Promise<SubscriptionDto[]> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const end = new Date(startOfToday.getTime() + (days + 1) * MS_PER_DAY);

    const subscriptions = await prisma.subscription.findMany({
      where: { userId, isActive: true, nextPaymentDate: { gte: startOfToday, lt: end } },
      orderBy: { nextPaymentDate: 'asc' },
    });
    return subscriptions.map(toDto);
  }
}

export const subscriptionService = new SubscriptionService();
