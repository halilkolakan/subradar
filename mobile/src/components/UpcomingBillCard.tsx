import { StyleSheet, Text, View } from 'react-native';
import { resolveBrand } from '../constants/presets';
import { ink, radius, spacing } from '../theme';
import type { Subscription } from '../types/api';
import { daysUntil, formatDaysLeft, formatMoney } from '../utils/format';
import { ServiceBadge } from './ServiceBadge';

export const UPCOMING_CARD_WIDTH = 168;

interface UpcomingBillCardProps {
  subscription: Subscription;
}

export function UpcomingBillCard({ subscription }: UpcomingBillCardProps) {
  const { brandColor, icon } = resolveBrand(subscription.name, subscription.category);

  return (
    <View style={[styles.card, { backgroundColor: brandColor.bg }]}>
      <View style={styles.top}>
        <ServiceBadge icon={icon} size={40} backgroundColor={ink.badge} color={brandColor.text} />
        <View style={styles.meta}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.price, { color: brandColor.text }]}>
            {formatMoney(subscription.price, subscription.currency)}
          </Text>
          <Text style={styles.days}>{formatDaysLeft(daysUntil(subscription.nextPaymentDate))}</Text>
        </View>
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: brandColor.text }]}>
        {subscription.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.md,
    width: UPCOMING_CARD_WIDTH,
  },
  top: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  meta: { flex: 1 },
  price: { fontSize: 15, fontWeight: '700' },
  days: { color: ink.muted, fontSize: 10, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '500', paddingHorizontal: spacing.xs },
});
