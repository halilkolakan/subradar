import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../src/api/client';
import { ErrorState } from '../../src/components/ErrorState';
import { SectionHeader } from '../../src/components/SectionHeader';
import {
  StackedPresetCard,
  type StackedCardAction,
  type StackedCardItem,
} from '../../src/components/StackedPresetCard';
import { UpcomingBillCard } from '../../src/components/UpcomingBillCard';
import { FEATURED_PRESETS, resolveBrand, type SubscriptionPreset } from '../../src/constants/presets';
import { useSubscriptions, useSummary, useUpcoming } from '../../src/hooks/useSubscriptions';
import { useAuthStore } from '../../src/stores/authStore';
import { brandColors, colors, radius, spacing } from '../../src/theme';
import type { Subscription } from '../../src/types/api';
import { isUrgent } from '../../src/utils/billing';
import { formatMoney } from '../../src/utils/format';

const UPCOMING_DAYS = 30;
const MAX_STACK_ITEMS = 6;
const HIDDEN_AMOUNT = '••••••';

const presetToStackItem = (preset: SubscriptionPreset): StackedCardItem => ({
  id: preset.id,
  name: preset.name,
  price: preset.defaultPrice,
  currency: 'TRY',
  billingCycle: preset.billingCycle,
  brandColor: preset.brandColor,
  icon: preset.icon,
});

const toStackItem = (subscription: Subscription): StackedCardItem => {
  const { brandColor, icon } = resolveBrand(subscription.name, subscription.category);
  return {
    id: subscription.id,
    name: subscription.name,
    price: subscription.price,
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    brandColor,
    icon,
  };
};

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const summary = useSummary();
  const upcoming = useUpcoming(UPCOMING_DAYS);
  const subscriptions = useSubscriptions();
  const activeSubscriptions = useMemo(
    () => (subscriptions.data ?? []).filter((subscription) => subscription.isActive),
    [subscriptions.data],
  );
  const [amountHidden, setAmountHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name.trim().split(' ')[0] ?? '';
  const urgentCount = (upcoming.data ?? []).filter(isUrgent).length;

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([summary.refetch(), upcoming.refetch(), subscriptions.refetch()]);
    setRefreshing(false);
  }, [summary, upcoming, subscriptions]);

  const hasSubscriptions = activeSubscriptions.length > 0;
  const stackAction: StackedCardAction = hasSubscriptions ? 'edit' : 'add';
  const stackItems: readonly StackedCardItem[] = hasSubscriptions
    ? activeSubscriptions.slice(0, MAX_STACK_ITEMS).map(toStackItem)
    : FEATURED_PRESETS.map(presetToStackItem);

  // Preset ids and subscription ids share one callback; the card action tells them apart.
  const handleStackAction = (item: StackedCardItem): void => {
    if (hasSubscriptions) {
      router.push({ pathname: '/modal/add-subscription', params: { subscriptionId: item.id } });
      return;
    }
    router.push({ pathname: '/modal/add-subscription', params: { presetId: item.id } });
  };

  const openList = (): void => router.push('/subscriptions');

  const openUrgent = (): void =>
    router.push({ pathname: '/subscriptions', params: { filter: 'urgent', ts: String(Date.now()) } });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.greetingName}>{firstName}</Text>!
          </Text>
          <Pressable
            accessibilityLabel={
              urgentCount > 0 ? `${urgentCount} bills due soon` : 'Notifications, no bills due soon'
            }
            accessibilityRole="button"
            onPress={openUrgent}
            style={styles.bell}
          >
            <Bell color={colors.text} size={20} />
            {urgentCount > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        {summary.isError ? (
          <View style={styles.section}>
            <ErrorState message={getErrorMessage(summary.error)} onRetry={() => void summary.refetch()} />
          </View>
        ) : (
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Your balance</Text>
              <View style={styles.cardChip}>
                <View style={[styles.chipCircle, { backgroundColor: colors.textMuted }]} />
                <View style={[styles.chipCircle, styles.chipCircleOverlap]} />
              </View>
            </View>
            <View style={styles.balanceBottom}>
              <View style={styles.amountRow}>
                {summary.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.amount}>
                    {amountHidden ? HIDDEN_AMOUNT : formatMoney(summary.data.totalMonthlySpending)}
                  </Text>
                )}
                <Pressable
                  accessibilityLabel={amountHidden ? 'Show amount' : 'Hide amount'}
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setAmountHidden((hidden) => !hidden)}
                >
                  {amountHidden ? (
                    <EyeOff color={colors.text} size={18} />
                  ) : (
                    <Eye color={colors.text} size={18} />
                  )}
                </Pressable>
              </View>
              {summary.data ? (
                <Text style={styles.activeCount}>{summary.data.activeSubscriptionsCount} active</Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Upcoming Bill" onViewAll={openList} />
        </View>
        {upcoming.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : upcoming.isError ? (
          <View style={styles.section}>
            <ErrorState message={getErrorMessage(upcoming.error)} onRetry={() => void upcoming.refetch()} />
          </View>
        ) : upcoming.data.length === 0 ? (
          <Text style={[styles.empty, styles.section]}>Nothing due in the next {UPCOMING_DAYS} days.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingRow}
          >
            {upcoming.data.map((subscription) => (
              <UpcomingBillCard key={subscription.id} subscription={subscription} />
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="Subscriptions"
            subtitle={
              hasSubscriptions
                ? 'All your active platforms in one place.'
                : 'Subscribe multiple platforms only in one place.'
            }
            onViewAll={openList}
          />
        </View>
        {subscriptions.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.stack}>
            {stackItems.map((item, index) => (
              <StackedPresetCard
                key={item.id}
                item={item}
                action={stackAction}
                width={width - spacing.xl * 2}
                isFirst={index === 0}
                isLast={index === stackItems.length - 1}
                onAction={handleStackAction}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  section: { paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl },
  avatar: {
    alignItems: 'center',
    backgroundColor: brandColors.NETFLIX.bg,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: { color: colors.primaryText, fontSize: 18, fontWeight: '800' },
  greeting: { color: colors.text, flex: 1, fontSize: 18 },
  greetingName: { fontWeight: '800' },
  bell: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bellDot: {
    backgroundColor: brandColors.YOUTUBE.bg,
    borderRadius: radius.pill,
    height: 9,
    position: 'absolute',
    right: 11,
    top: 11,
    width: 9,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
  },
  balanceTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  balanceLabel: { color: colors.text, fontSize: 14 },
  cardChip: { flexDirection: 'row' },
  chipCircle: { backgroundColor: colors.border, borderRadius: radius.pill, height: 14, width: 14 },
  chipCircleOverlap: { marginLeft: -5 },
  balanceBottom: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  amountRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  amount: { color: colors.text, fontSize: 36, fontWeight: '700' },
  activeCount: { color: colors.textMuted, fontSize: 12, paddingBottom: spacing.sm },
  upcomingRow: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  empty: { color: colors.textMuted },
  stack: { paddingHorizontal: spacing.xl },
});
