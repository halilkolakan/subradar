import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../src/api/client';
import { ErrorState } from '../../src/components/ErrorState';
import {
  SubscriptionForm,
  emptyFormValues,
  type SubscriptionFormSubmit,
  type SubscriptionFormValues,
} from '../../src/components/SubscriptionForm';
import { findPresetById } from '../../src/constants/presets';
import {
  useCreateSubscription,
  useSubscription,
  useUpdateSubscription,
} from '../../src/hooks/useSubscriptions';
import { colors, spacing } from '../../src/theme';
import type { Subscription } from '../../src/types/api';

const closeModal = (): void => {
  if (router.canGoBack()) router.back();
};

const toFormValues = (subscription: Subscription): SubscriptionFormValues => ({
  name: subscription.name,
  price: String(subscription.price),
  currency: subscription.currency,
  billingCycle: subscription.billingCycle,
  category: subscription.category,
  nextPaymentDate: new Date(subscription.nextPaymentDate),
  reminderDays: String(subscription.reminderDaysBefore),
  notes: subscription.notes ?? '',
});

function CreateSubscriptionForm({ presetId }: { presetId: string | undefined }) {
  const createSubscription = useCreateSubscription();
  const preset = findPresetById(presetId);

  const initialValues: SubscriptionFormValues = preset
    ? {
        ...emptyFormValues(),
        name: preset.name,
        price: String(preset.defaultPrice),
        billingCycle: preset.billingCycle,
        category: preset.category,
      }
    : emptyFormValues();

  const handleSubmit = ({ notes, ...rest }: SubscriptionFormSubmit): void => {
    createSubscription.mutate(notes ? { ...rest, notes } : rest, { onSuccess: closeModal });
  };

  return (
    <SubscriptionForm
      initialValues={initialValues}
      submitLabel="Add subscription"
      isSubmitting={createSubscription.isPending}
      onSubmit={handleSubmit}
    />
  );
}

function EditSubscriptionForm({ subscription }: { subscription: Subscription }) {
  const updateSubscription = useUpdateSubscription();

  const handleSubmit = (data: SubscriptionFormSubmit): void => {
    updateSubscription.mutate({ id: subscription.id, data }, { onSuccess: closeModal });
  };

  return (
    <SubscriptionForm
      initialValues={toFormValues(subscription)}
      submitLabel="Save Changes"
      isSubmitting={updateSubscription.isPending}
      onSubmit={handleSubmit}
    />
  );
}

function EditSubscriptionLoader({ subscriptionId }: { subscriptionId: string }) {
  const subscription = useSubscription(subscriptionId);

  if (subscription.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }
  if (subscription.isError) {
    return (
      <ErrorState message={getErrorMessage(subscription.error)} onRetry={() => void subscription.refetch()} />
    );
  }
  return <EditSubscriptionForm subscription={subscription.data} />;
}

export default function SubscriptionModal() {
  const { subscriptionId, presetId } = useLocalSearchParams<{
    subscriptionId?: string;
    presetId?: string;
  }>();
  const isEdit = Boolean(subscriptionId);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEdit ? 'Edit subscription' : 'New subscription'}</Text>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" hitSlop={8} onPress={closeModal}>
            <X color={colors.textMuted} size={24} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {subscriptionId ? (
            <EditSubscriptionLoader subscriptionId={subscriptionId} />
          ) : (
            <CreateSubscriptionForm presetId={presetId} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  content: { padding: spacing.xl, paddingTop: spacing.md },
  loader: { marginTop: spacing.xxl },
});
