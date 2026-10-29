import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface OptionChipsProps<T extends string> {
  label?: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T) => void;
  getLabel?: (option: T) => string;
  scrollable?: boolean;
}

export function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (option) => option,
  scrollable = false,
}: OptionChipsProps<T>) {
  const chips = options.map((option) => {
    const selected = option === value;
    return (
      <Pressable
        key={option}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange(option)}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{getLabel(option)}</Text>
      </Pressable>
    );
  });

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {chips}
        </ScrollView>
      ) : (
        <View style={[styles.row, styles.wrap]}>{chips}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  wrap: { flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: colors.primaryText },
});
