import { apiClient } from './client';
import type {
  ApiSuccess,
  CreateSubscriptionInput,
  Subscription,
  SubscriptionQuery,
  SubscriptionSummary,
  UpdateSubscriptionInput,
} from '../types/api';

export const subscriptionsApi = {
  async getAll(query: SubscriptionQuery): Promise<Subscription[]> {
    const { data } = await apiClient.get<ApiSuccess<Subscription[]>>('/subscriptions', {
      params: query,
    });
    return data.data;
  },

  async getById(id: string): Promise<Subscription> {
    const { data } = await apiClient.get<ApiSuccess<Subscription>>(`/subscriptions/${id}`);
    return data.data;
  },

  async getSummary(): Promise<SubscriptionSummary> {
    const { data } = await apiClient.get<ApiSuccess<SubscriptionSummary>>('/subscriptions/summary');
    return data.data;
  },

  async getUpcoming(days: number): Promise<Subscription[]> {
    const { data } = await apiClient.get<ApiSuccess<Subscription[]>>('/subscriptions/upcoming', {
      params: { days },
    });
    return data.data;
  },

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const { data } = await apiClient.post<ApiSuccess<Subscription>>('/subscriptions', input);
    return data.data;
  },

  async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription> {
    const { data } = await apiClient.patch<ApiSuccess<Subscription>>(`/subscriptions/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`);
  },
};
