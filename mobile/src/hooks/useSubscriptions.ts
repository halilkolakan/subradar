import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionQuery,
  SubscriptionSummary,
  UpdateSubscriptionInput,
} from '../types/api';
import { showErrorAlert } from '../utils/alerts';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: ['subscriptions', 'list'] as const,
  list: (query: SubscriptionQuery) => ['subscriptions', 'list', query] as const,
  detail: (id: string) => ['subscriptions', 'detail', id] as const,
  summary: ['subscriptions', 'summary'] as const,
  upcoming: (days: number) => ['subscriptions', 'upcoming', days] as const,
};

const invalidateAll = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });

export const useSummary = (): UseQueryResult<SubscriptionSummary> =>
  useQuery({ queryKey: subscriptionKeys.summary, queryFn: subscriptionsApi.getSummary });

export const useUpcoming = (days = 7): UseQueryResult<Subscription[]> =>
  useQuery({
    queryKey: subscriptionKeys.upcoming(days),
    queryFn: () => subscriptionsApi.getUpcoming(days),
  });

export const useSubscriptions = (query: SubscriptionQuery = {}): UseQueryResult<Subscription[]> =>
  useQuery({
    queryKey: subscriptionKeys.list(query),
    queryFn: () => subscriptionsApi.getAll(query),
    placeholderData: (previous) => previous,
  });

export const useSubscription = (id: string | undefined): UseQueryResult<Subscription> =>
  useQuery({
    queryKey: subscriptionKeys.detail(id ?? ''),
    queryFn: () => subscriptionsApi.getById(id as string),
    enabled: Boolean(id),
    gcTime: 0,
  });

export const useCreateSubscription = (): UseMutationResult<
  Subscription,
  Error,
  CreateSubscriptionInput
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.create,
    onError: (error) => showErrorAlert('Could not add subscription', error),
    onSettled: () => invalidateAll(queryClient),
  });
};

export const useUpdateSubscription = (): UseMutationResult<
  Subscription,
  Error,
  { id: string; data: UpdateSubscriptionInput }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subscriptionsApi.update(id, data),
    onError: (error) => showErrorAlert('Could not save changes', error),
    onSettled: () => invalidateAll(queryClient),
  });
};

interface DeleteContext {
  snapshots: [QueryKey, Subscription[] | undefined][];
}

// Removes the card immediately and rolls back if the server rejects the delete.
export const useDeleteSubscription = (): UseMutationResult<void, Error, string, DeleteContext> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: subscriptionsApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: subscriptionKeys.all });
      const snapshots = queryClient.getQueriesData<Subscription[]>({
        queryKey: subscriptionKeys.lists,
      });
      queryClient.setQueriesData<Subscription[]>({ queryKey: subscriptionKeys.lists }, (current) =>
        current?.filter((subscription) => subscription.id !== id),
      );
      return { snapshots };
    },
    onError: (error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      showErrorAlert('Could not delete subscription', error);
    },
    onSettled: () => invalidateAll(queryClient),
  });
};
