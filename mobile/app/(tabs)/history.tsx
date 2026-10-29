import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../src/api/client';
import { ErrorState } from '../../src/components/ErrorState';
import { ServiceBadge } from '../../src/components/ServiceBadge';
import { resolveBrand } from '../../src/constants/presets';
import { useSubscriptions } from '../../src/hooks/useSubscriptions';
import { colors, radius, spacing } from '../../src/theme';
import { startOfMonth } from '../../src/utils/dates';
import { getBilledChargesInMonth, sumCharges, type BillingCharge } from '../../src/utils/billing';
import {
  formatCharged,
  formatDebit,
  formatMonth,
  formatMonthYear,
} from '../../src/utils/format';

function ChargeRow({ charge }: { charge: BillingCharge }) {
  const { subscription, date } = charge;
  const { brandColor, icon } = resolveBrand(subscription.name, subscription.category);

  return (
    <View style={styles.row}>
      <ServiceBadge icon={icon} size={44} backgroundColor={brandColor.bg} color={brandColor.text} />
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {subscription.name}
        </Text>
        <Text style={styles.rowDate}>{formatCharged(date)}</Text>
      </View>
      <Text style={styles.rowAmount}>{formatDebit(subscription.price, subscription.currency)}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const subscriptions = useSubscriptions();
  const monthStart = startOfMonth(new Date());
  const monthKey = monthStart.getTime();

  const charges = useMemo(
    () => getBilledChargesInMonth(subscriptions.data ?? [], new Date(monthKey)),
    [subscriptions.data, monthKey],
  );
  const total = sumCharges(charges);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>History</Text>

      {subscriptions.isPending ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : subscriptions.isError ? (
        <View style={styles.padded}>
          <ErrorState message={getErrorMessage(subscriptions.error)} onRetry={() => void subscriptions.refetch()} />
        </View>
      ) : (
        <FlatList
          data={charges}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={subscriptions.isRefetching}
          onRefresh={() => void subscriptions.refetch()}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <View style={styles.summaryCard}>
                <View>
                  <Text style={styles.summaryTitle}>Expenses</Text>
                  <Text style={styles.summaryMonth}>{formatMonthYear(monthStart)}</Text>
                </View>
                <Text style={styles.summaryAmount}>{formatDebit(total)}</Text>
              </View>
              <Text style={styles.sectionTitle}>{formatMonth(monthStart)} History</Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>No charges so far this month.</Text>}
          renderItem={({ item }) => <ChargeRow charge={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  title: {
    color: colors.text,
    fontSize: 18,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  loader: { marginTop: spacing.xxl },
  padded: { padding: spacing.xl },
  list: { gap: spacing.md, paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  headerBlock: { gap: spacing.xl, marginBottom: spacing.sm },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  summaryTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  summaryMonth: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  summaryAmount: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 15 },
  empty: { color: colors.textMuted, marginTop: spacing.xl, textAlign: 'center' },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '500' },
  rowDate: { color: colors.textMuted, fontSize: 12 },
  rowAmount: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
