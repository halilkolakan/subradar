import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Plus } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import type { ServiceIconKey } from '../constants/presets';
import { ink, radius, type BrandColor } from '../theme';
import type { BillingCycle } from '../types/api';
import { formatCycleAdverb, formatMoney } from '../utils/format';
import { ServiceBadge } from './ServiceBadge';

export const STACK_CARD_HEIGHT = 116;
export const STACK_CARD_STEP = 76;

const LEFT_TOP = 28;
const TAB_START_OFFSET = 190;
const TAB_END_OFFSET = 120;
const ACTION_SIZE = 40;

export interface StackedCardItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  brandColor: BrandColor;
  icon: ServiceIconKey;
}

export type StackedCardAction = 'add' | 'edit';

// Card silhouette: a straight left edge (rounded only on the stack's outer corners)
// with a raised tab sweeping up on the right.
const buildShape = (width: number, isFirst: boolean, isLast: boolean): string => {
  const r = radius.xl;
  const tabStart = width - TAB_START_OFFSET;
  const tabEnd = width - TAB_END_OFFSET;

  const topLeft = isFirst
    ? [`M0,${LEFT_TOP + r}`, `Q0,${LEFT_TOP} ${r},${LEFT_TOP}`]
    : [`M0,${LEFT_TOP}`, `L${r},${LEFT_TOP}`];

  const bottom = isLast
    ? `L${width},${STACK_CARD_HEIGHT - r} Q${width},${STACK_CARD_HEIGHT} ${width - r},${STACK_CARD_HEIGHT} L${r},${STACK_CARD_HEIGHT} Q0,${STACK_CARD_HEIGHT} 0,${STACK_CARD_HEIGHT - r}`
    : `L${width},${STACK_CARD_HEIGHT} L0,${STACK_CARD_HEIGHT}`;

  return [
    ...topLeft,
    `L${tabStart},${LEFT_TOP}`,
    `C${tabStart + 34},${LEFT_TOP} ${tabEnd - 34},0 ${tabEnd},0`,
    `L${width - r},0`,
    `Q${width},0 ${width},${r}`,
    bottom,
    'Z',
  ].join(' ');
};

interface StackedPresetCardProps {
  item: StackedCardItem;
  action: StackedCardAction;
  width: number;
  isFirst: boolean;
  isLast: boolean;
  onAction: (item: StackedCardItem) => void;
}

export function StackedPresetCard({ item, action, width, isFirst, isLast, onAction }: StackedPresetCardProps) {
  const { brandColor } = item;
  const ActionIcon = action === 'add' ? Plus : Pencil;

  return (
    <View
      style={[
        styles.card,
        { height: STACK_CARD_HEIGHT, width },
        !isFirst && { marginTop: STACK_CARD_STEP - STACK_CARD_HEIGHT },
      ]}
    >
      <Svg width={width} height={STACK_CARD_HEIGHT} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={buildShape(width, isFirst, isLast)} fill={brandColor.bg} />
      </Svg>

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: brandColor.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: brandColor.text }]}>
          <Text style={styles.priceStrong}>{formatMoney(item.price, item.currency)}</Text>
          <Text style={styles.priceCycle}>/{formatCycleAdverb(item.billingCycle)}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <ServiceBadge icon={item.icon} size={ACTION_SIZE} backgroundColor={ink.badge} color={brandColor.text} />
        <Pressable
          accessibilityLabel={`${action === 'add' ? 'Add' : 'Edit'} ${item.name}`}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => onAction(item)}
          style={styles.action}
        >
          <ActionIcon color={ink.muted} size={action === 'add' ? 22 : 18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative' },
  info: { gap: 2, left: 22, maxWidth: '55%', position: 'absolute', top: 40 },
  name: { fontSize: 20, fontWeight: '500' },
  price: { fontSize: 12 },
  priceStrong: { fontWeight: '800' },
  priceCycle: { fontWeight: '600', opacity: 0.6 },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 8, position: 'absolute', right: 20, top: 8 },
  action: {
    alignItems: 'center',
    borderColor: ink.line,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: ACTION_SIZE,
    justifyContent: 'center',
    width: ACTION_SIZE,
  },
});
