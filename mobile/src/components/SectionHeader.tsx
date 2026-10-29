import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAll: () => void;
}

export function SectionHeader({ title, subtitle, onViewAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Pressable accessibilityRole="button" onPress={onViewAll} style={styles.pill}>
          <Text style={styles.pillText}>View All</Text>
        </Pressable>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 26, fontWeight: '400' },
  pill: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
  },
  pillText: { color: colors.text, fontSize: 12 },
  subtitle: { color: colors.textMuted, fontSize: 11, maxWidth: 200 },
});
