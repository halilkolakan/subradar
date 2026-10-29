import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { categoryLabels, colors, spacing } from '../theme';
import {
  BILLING_CYCLES,
  CATEGORIES,
  type BillingCycle,
  type CreateSubscriptionInput,
  type SubscriptionCategory,
} from '../types/api';
import { atNoon } from '../utils/dates';
import { DateField } from './DateField';
import { FormField } from './FormField';
import { OptionChips } from './OptionChips';
import { PrimaryButton } from './PrimaryButton';

const MIN_REMINDER_DAYS = 1;
const MAX_REMINDER_DAYS = 30;

export interface SubscriptionFormValues {
  name: string;
  price: string;
  currency: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  nextPaymentDate: Date;
  reminderDays: string;
  notes: string;
}

export type SubscriptionFormSubmit = Omit<CreateSubscriptionInput, 'notes'> & { notes: string };

export const emptyFormValues = (): SubscriptionFormValues => ({
  name: '',
  price: '',
  currency: 'TRY',
  billingCycle: 'MONTHLY',
  category: 'OTHER',
  nextPaymentDate: atNoon(new Date()),
  reminderDays: '3',
  notes: '',
});

const parsePrice = (value: string): number | null => {
  const price = Number(value.trim().replace(',', '.'));
  return Number.isFinite(price) && price > 0 ? price : null;
};

interface SubscriptionFormProps {
  initialValues: SubscriptionFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: SubscriptionFormSubmit) => void;
}

export function SubscriptionForm({ initialValues, submitLabel, isSubmitting, onSubmit }: SubscriptionFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [price, setPrice] = useState(initialValues.price);
  const [currency, setCurrency] = useState(initialValues.currency);
  const [billingCycle, setBillingCycle] = useState(initialValues.billingCycle);
  const [category, setCategory] = useState(initialValues.category);
  const [nextPaymentDate, setNextPaymentDate] = useState(initialValues.nextPaymentDate);
  const [reminderDays, setReminderDays] = useState(initialValues.reminderDays);
  const [notes, setNotes] = useState(initialValues.notes);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (): void => {
    const parsedPrice = parsePrice(price);
    const reminder = Number(reminderDays);
    const normalizedCurrency = currency.trim().toUpperCase();

    if (!name.trim()) return setError('Name is required');
    if (parsedPrice === null) return setError('Enter a valid price greater than 0');
    if (normalizedCurrency.length !== 3) return setError('Currency must be a 3-letter code');
    if (!Number.isInteger(reminder) || reminder < MIN_REMINDER_DAYS || reminder > MAX_REMINDER_DAYS) {
      return setError(`Reminder must be ${MIN_REMINDER_DAYS}-${MAX_REMINDER_DAYS} days`);
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      price: parsedPrice,
      currency: normalizedCurrency,
      billingCycle,
      category,
      nextPaymentDate: nextPaymentDate.toISOString(),
      reminderDaysBefore: reminder,
      notes: notes.trim(),
    });
  };

  return (
    <View style={styles.form}>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="Netflix" maxLength={100} />
      <FormField
        label="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="149.99"
      />
      <FormField
        label="Currency"
        value={currency}
        onChangeText={setCurrency}
        autoCapitalize="characters"
        maxLength={3}
      />
      <OptionChips label="Billing cycle" options={BILLING_CYCLES} value={billingCycle} onChange={setBillingCycle} />
      <OptionChips
        label="Category"
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
        getLabel={(option) => categoryLabels[option]}
      />
      <DateField label="Next payment date" value={nextPaymentDate} onChange={setNextPaymentDate} />
      <FormField
        label="Remind me (days before)"
        value={reminderDays}
        onChangeText={setReminderDays}
        keyboardType="number-pad"
        maxLength={2}
      />
      <FormField
        label="Plan details (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Premium Family"
        maxLength={1000}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title={submitLabel} onPress={handleSubmit} loading={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  error: { color: colors.danger },
});
