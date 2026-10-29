import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme';
import { addDays, addMonths, atNoon, isSameDay } from '../utils/dates';
import { formatDateLong } from '../utils/format';

interface QuickDate {
  label: string;
  resolve: (today: Date) => Date;
}

const QUICK_DATES: readonly QuickDate[] = [
  { label: 'Next Month Same Day', resolve: (today) => addMonths(today, 1) },
  { label: 'In 1 Week', resolve: (today) => addDays(today, 7) },
  { label: 'In 15 Days', resolve: (today) => addDays(today, 15) },
];

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);

  const handlePicked = (event: DateTimePickerEvent, picked?: Date): void => {
    if (event.type === 'set' && picked) onChange(atNoon(picked));
  };

  const openPicker = (): void => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value, mode: 'date', onChange: handlePicked });
      return;
    }
    setIosPickerOpen((open) => !open);
  };

  const today = atNoon(new Date());

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable accessibilityRole="button" onPress={openPicker} style={styles.field}>
        <CalendarDays color={colors.primary} size={20} />
        <Text style={styles.value}>{formatDateLong(value)}</Text>
      </Pressable>

      {Platform.OS === 'ios' && iosPickerOpen ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="inline"
          themeVariant="dark"
          accentColor={colors.primary}
          onChange={handlePicked}
        />
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {QUICK_DATES.map((quick) => {
          const target = atNoon(quick.resolve(today));
          const selected = isSameDay(target, value);
          return (
            <Pressable
              key={quick.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(target)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{quick.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  value: { color: colors.text, fontSize: 16 },
  chips: { gap: spacing.sm },
  chip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: colors.primaryText },
});
