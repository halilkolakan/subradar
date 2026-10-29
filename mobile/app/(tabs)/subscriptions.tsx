import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../src/api/client';
import { ErrorState } from '../../src/components/ErrorState';
import { ServiceBadge } from '../../src/components/ServiceBadge';
import { resolveBrand, type SubscriptionGroup } from '../../src/constants/presets';
import { useDeleteSubscription, useSubscriptions } from '../../src/hooks/useSubscriptions';
import { brandColors, colors, ink, radius, spacing } from '../../src/theme';
import type { Subscription } from '../../src/types/api';
import { isUrgent } from '../../src/utils/billing';
import { formatCycleBadge, formatDate, formatMoney } from '../../src/utils/format';

type FilterKey = 'ALL' | 'URGENT' | Exclude<SubscriptionGroup, 'OTHER'>;

interface FilterOption {
  key: FilterKey;
  label: string;
  color: string;
}

const FILTERS: readonly FilterOption[] = [
  { key: 'ALL', label: 'View All', color: colors.text },
  { key: 'URGENT', label: 'Due Soon', color: brandColors.YOUTUBE.bg },
  { key: 'ENTERTAINMENT', label: 'Entertainment', color: brandColors.APPLE.bg },
  { key: 'MUSIC', label: 'Music', color: brandColors.SPOTIFY.bg },
  { key: 'SOFTWARE', label: 'Software', color: brandColors.ADOBE.bg },
  { key: 'AI', label: 'AI', color: brandColors.NETFLIX.bg },
];

const SEARCH_DEBOUNCE_MS = 300;

const goBack = (): void => {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/');
};

const matchesFilter = (subscription: Subscription, filter: FilterKey): boolean => {
  if (filter === 'ALL') return true;
  if (filter === 'URGENT') return isUrgent(subscription);
  return resolveBrand(subscription.name, subscription.category).group === filter;
};

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const { brandColor, icon } = resolveBrand(subscription.name, subscription.category);

  return (
    <View style={[styles.card, { backgroundColor: brandColor.bg }, !subscription.isActive && styles.inactive]}>
      <View style={styles.cardHeader}>
        <ServiceBadge icon={icon} size={52} backgroundColor={ink.badge} color={brandColor.text} />
        <View style={styles.cardTitle}>
          <Text numberOfLines={1} style={[styles.name, { color: brandColor.text }]}>
            {subscription.name}
          </Text>
          <Text style={[styles.price, { color: brandColor.text }]}>
            {formatMoney(subscription.price, subscription.currency)}
          </Text>
        </View>
        <View style={styles.cycleBadge}>
          <Text style={styles.cycleText}>{formatCycleBadge(subscription.billingCycle)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next payment</Text>
            <Text style={[styles.infoValue, { color: brandColor.text }]}>
              {formatDate(subscription.nextPaymentDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan details</Text>
            <Text numberOfLines={1} style={[styles.infoValue, { color: brandColor.text }]}>
              {subscription.notes || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Edit ${subscription.name}`}
            accessibilityRole="button"
            onPress={() => onEdit(subscription)}
            style={styles.actionButton}
          >
            <Pencil color={brandColor.text} size={17} />
          </Pressable>
          <Pressable
            accessibilityLabel={`Delete ${subscription.name}`}
            accessibilityRole="button"
            onPress={() => onDelete(subscription)}
            style={styles.actionButton}
          >
            <Trash2 color={brandColor.text} size={17} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function SubscriptionsScreen() {
  const { filter: filterParam, ts } = useLocalSearchParams<{ filter?: string; ts?: string }>();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // `ts` changes on every bell tap so the urgent filter re-applies even if the user changed it since.
  useEffect(() => {
    if (filterParam === 'urgent') setFilter('URGENT');
  }, [filterParam, ts]);

  const subscriptions = useSubscriptions(search ? { search } : {});
  const deleteSubscription = useDeleteSubscription();

  const visible = useMemo(
    () => (subscriptions.data ?? []).filter((subscription) => matchesFilter(subscription, filter)),
    [subscriptions.data, filter],
  );

  const openEdit = (subscription: Subscription): void =>
    router.push({ pathname: '/modal/add-subscription', params: { subscriptionId: subscription.id } });

  const confirmDelete = (subscription: Subscription): void => {
    Alert.alert('Delete subscription', `Remove ${subscription.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSubscription.mutate(subscription.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={goBack} style={styles.circleButton}>
          <ChevronLeft color={colors.text} size={22} />
        </Pressable>
        <Text style={styles.title}>My Subscriptions</Text>
        <Pressable
          accessibilityLabel="Add subscription"
          accessibilityRole="button"
          onPress={() => router.push('/modal/add-subscription')}
          style={styles.circleButton}
        >
          <Plus color={colors.text} size={22} />
        </Pressable>
      </View>

      <TextInput
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search subscriptions"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        autoCapitalize="none"
        style={styles.search}
      />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((option) => {
            const selected = option.key === filter;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setFilter(option.key)}
                style={[
                  styles.chip,
                  selected ? { backgroundColor: option.color, borderColor: option.color } : null,
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? colors.primaryText : option.color }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {subscriptions.isPending ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : subscriptions.isError ? (
        <View style={styles.errorWrap}>
          <ErrorState message={getErrorMessage(subscriptions.error)} onRetry={() => void subscriptions.refetch()} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={subscriptions.isRefetching}
          onRefresh={() => void subscriptions.refetch()}
          ListEmptyComponent={<Text style={styles.empty}>No subscriptions found.</Text>}
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onEdit={openEdit} onDelete={confirmDelete} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  circleButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: { color: colors.text, fontSize: 18 },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filters: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  chip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  loader: { marginTop: spacing.xxl },
  errorWrap: { padding: spacing.xl },
  list: { gap: spacing.xl, paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  empty: { color: colors.textMuted, marginTop: spacing.xl, textAlign: 'center' },
  card: { borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  inactive: { opacity: 0.55 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  cardTitle: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '800' },
  cycleBadge: {
    borderColor: ink.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  cycleText: { color: ink.muted, fontSize: 11, fontWeight: '600' },
  infoRow: { flexDirection: 'row', gap: spacing.sm },
  infoLabel: { color: ink.muted, fontSize: 12, width: 88 },
  infoValue: { flex: 1, fontSize: 12, fontWeight: '700' },
  footer: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.md },
  infoColumn: { flex: 1, gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    alignItems: 'center',
    backgroundColor: ink.badge,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
