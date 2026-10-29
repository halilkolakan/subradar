import { brandColors, type BrandColor } from '../theme';
import type { BillingCycle, SubscriptionCategory } from '../types/api';

export type ServiceIconKey =
  | 'spotify'
  | 'netflix'
  | 'apple'
  | 'cloud'
  | 'ai'
  | 'play'
  | 'tv'
  | 'music'
  | 'gamepad'
  | 'fitness'
  | 'code'
  | 'learn'
  | 'shopping'
  | 'package';

export type SubscriptionGroup = 'ENTERTAINMENT' | 'MUSIC' | 'SOFTWARE' | 'AI' | 'OTHER';

export interface SubscriptionPreset {
  id: string;
  name: string;
  /** Approximate list price in TRY; users can adjust it in the add modal. */
  defaultPrice: number;
  category: SubscriptionCategory;
  billingCycle: BillingCycle;
  brandColor: BrandColor;
  icon: ServiceIconKey;
  group: SubscriptionGroup;
  featured?: boolean;
}

export const PRESETS: readonly SubscriptionPreset[] = [
  { id: 'apple-tv', name: 'Apple TV', defaultPrice: 99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.APPLE, icon: 'apple', group: 'ENTERTAINMENT', featured: true },
  { id: 'netflix', name: 'Netflix', defaultPrice: 229.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.NETFLIX, icon: 'netflix', group: 'ENTERTAINMENT', featured: true },
  { id: 'spotify', name: 'Spotify', defaultPrice: 59.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.SPOTIFY, icon: 'spotify', group: 'MUSIC', featured: true },
  { id: 'chatgpt', name: 'ChatGPT Plus', defaultPrice: 750, category: 'SOFTWARE', billingCycle: 'MONTHLY', brandColor: brandColors.CHATGPT, icon: 'ai', group: 'AI', featured: true },
  { id: 'youtube-premium', name: 'YouTube Premium', defaultPrice: 57.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.YOUTUBE, icon: 'play', group: 'ENTERTAINMENT' },
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', defaultPrice: 899.99, category: 'SOFTWARE', billingCycle: 'MONTHLY', brandColor: brandColors.ADOBE, icon: 'cloud', group: 'SOFTWARE' },
  { id: 'disney-plus', name: 'Disney+', defaultPrice: 134.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.ADOBE, icon: 'tv', group: 'ENTERTAINMENT' },
  { id: 'amazon-prime', name: 'Amazon Prime', defaultPrice: 59, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.PEACH, icon: 'shopping', group: 'ENTERTAINMENT' },
  { id: 'max', name: 'Max', defaultPrice: 149.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.NETFLIX, icon: 'tv', group: 'ENTERTAINMENT' },
  { id: 'apple-music', name: 'Apple Music', defaultPrice: 59.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.APPLE, icon: 'apple', group: 'MUSIC' },
  { id: 'youtube-music', name: 'YouTube Music', defaultPrice: 57.99, category: 'STREAMING', billingCycle: 'MONTHLY', brandColor: brandColors.YOUTUBE, icon: 'music', group: 'MUSIC' },
  { id: 'icloud', name: 'iCloud+', defaultPrice: 12.99, category: 'UTILITIES', billingCycle: 'MONTHLY', brandColor: brandColors.NEUTRAL, icon: 'apple', group: 'SOFTWARE' },
  { id: 'microsoft-365', name: 'Microsoft 365', defaultPrice: 99.99, category: 'SOFTWARE', billingCycle: 'MONTHLY', brandColor: brandColors.ADOBE, icon: 'package', group: 'SOFTWARE' },
  { id: 'google-one', name: 'Google One', defaultPrice: 29.99, category: 'UTILITIES', billingCycle: 'MONTHLY', brandColor: brandColors.SPOTIFY, icon: 'cloud', group: 'SOFTWARE' },
  { id: 'notion', name: 'Notion', defaultPrice: 400, category: 'SOFTWARE', billingCycle: 'MONTHLY', brandColor: brandColors.NEUTRAL, icon: 'package', group: 'SOFTWARE' },
  { id: 'github-copilot', name: 'GitHub Copilot', defaultPrice: 350, category: 'SOFTWARE', billingCycle: 'MONTHLY', brandColor: brandColors.CHATGPT, icon: 'code', group: 'AI' },
  { id: 'duolingo', name: 'Duolingo Plus', defaultPrice: 249.99, category: 'OTHER', billingCycle: 'MONTHLY', brandColor: brandColors.PEACH, icon: 'learn', group: 'OTHER' },
  { id: 'xbox-game-pass', name: 'Xbox Game Pass', defaultPrice: 229, category: 'GAMING', billingCycle: 'MONTHLY', brandColor: brandColors.SPOTIFY, icon: 'gamepad', group: 'ENTERTAINMENT' },
  { id: 'playstation-plus', name: 'PlayStation Plus', defaultPrice: 299, category: 'GAMING', billingCycle: 'MONTHLY', brandColor: brandColors.ADOBE, icon: 'gamepad', group: 'ENTERTAINMENT' },
  { id: 'gym', name: 'Gym Membership', defaultPrice: 900, category: 'FITNESS', billingCycle: 'MONTHLY', brandColor: brandColors.YOUTUBE, icon: 'fitness', group: 'OTHER' },
];

export const FEATURED_PRESETS: readonly SubscriptionPreset[] = PRESETS.filter(
  (preset) => preset.featured,
);

export const findPresetById = (id: string | undefined): SubscriptionPreset | undefined =>
  id ? PRESETS.find((preset) => preset.id === id) : undefined;

const normalize = (value: string): string => value.trim().toLowerCase();

export const findPresetByName = (name: string): SubscriptionPreset | undefined => {
  const target = normalize(name);
  if (target.length < 3) return undefined;
  return (
    PRESETS.find((preset) => normalize(preset.name) === target) ??
    PRESETS.find((preset) => {
      const presetName = normalize(preset.name);
      return target.includes(presetName) || presetName.includes(target);
    })
  );
};

export interface ResolvedBrand {
  brandColor: BrandColor;
  icon: ServiceIconKey;
  group: SubscriptionGroup;
}

const CATEGORY_FALLBACKS: Record<SubscriptionCategory, ResolvedBrand> = {
  STREAMING: { brandColor: brandColors.NETFLIX, icon: 'tv', group: 'ENTERTAINMENT' },
  SOFTWARE: { brandColor: brandColors.ADOBE, icon: 'code', group: 'SOFTWARE' },
  UTILITIES: { brandColor: brandColors.SPOTIFY, icon: 'package', group: 'SOFTWARE' },
  GAMING: { brandColor: brandColors.APPLE, icon: 'gamepad', group: 'ENTERTAINMENT' },
  FITNESS: { brandColor: brandColors.YOUTUBE, icon: 'fitness', group: 'OTHER' },
  OTHER: { brandColor: brandColors.NEUTRAL, icon: 'package', group: 'OTHER' },
};

export const resolveBrand = (name: string, category: SubscriptionCategory): ResolvedBrand => {
  const preset = findPresetByName(name);
  if (preset) {
    return { brandColor: preset.brandColor, icon: preset.icon, group: preset.group };
  }
  return CATEGORY_FALLBACKS[category];
};
