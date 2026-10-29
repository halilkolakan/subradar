import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceBadge } from '../../src/components/ServiceBadge';
import type { ServiceIconKey } from '../../src/constants/presets';
import { brandColors, colors, radius, spacing, type BrandColor } from '../../src/theme';

interface HeroBadge {
  icon: ServiceIconKey;
  brand: BrandColor;
}

const BADGE_SIZE = 104;
const HALO_SIZE = BADGE_SIZE + 36;
const PAGE_COUNT = 3;

const HERO_BADGES: readonly HeroBadge[] = [
  { icon: 'spotify', brand: brandColors.SPOTIFY },
  { icon: 'cloud', brand: brandColors.ADOBE },
  { icon: 'netflix', brand: brandColors.NETFLIX },
  { icon: 'apple', brand: brandColors.APPLE },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.grid}>
          {HERO_BADGES.map(({ icon, brand }) => (
            <View key={icon} style={styles.badgeSlot}>
              <View style={[styles.halo, { backgroundColor: brand.bg }]} />
              <View style={[styles.glow, { shadowColor: brand.bg }]}>
                <ServiceBadge icon={icon} size={BADGE_SIZE} backgroundColor={brand.bg} color={brand.text} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.reflectionLarge} />
        <View style={styles.reflectionSmall} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.title}>Effortlessly managing all your subscriptions</Text>

        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: PAGE_COUNT }, (_, index) => (
            <View key={index} style={[styles.dot, index === 0 && styles.dotActive]} />
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1, padding: spacing.xl },
  hero: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: BADGE_SIZE * 2 + 12 },
  badgeSlot: { alignItems: 'center', height: BADGE_SIZE + 6, justifyContent: 'center', width: BADGE_SIZE + 6 },
  halo: {
    borderRadius: radius.pill,
    height: HALO_SIZE,
    opacity: 0.1,
    position: 'absolute',
    width: HALO_SIZE,
  },
  glow: {
    elevation: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
  },
  reflectionLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    height: 70,
    marginTop: spacing.xl,
    width: 110,
  },
  reflectionSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.pill,
    height: 12,
    marginTop: spacing.md,
    width: 120,
  },
  footer: { alignItems: 'center', gap: spacing.lg },
  title: { color: colors.text, fontSize: 24, lineHeight: 32, maxWidth: 280, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { backgroundColor: colors.border, borderRadius: radius.pill, height: 6, width: 6 },
  dotActive: { backgroundColor: colors.text },
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 56,
    width: '100%',
  },
  buttonText: { color: colors.text, fontSize: 16 },
});
