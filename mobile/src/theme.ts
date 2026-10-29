export interface BrandColor {
  bg: string;
  text: string;
}

export const colors = {
  background: '#15161A',
  surface: '#202126',
  surfaceAlt: '#2A2B32',
  border: '#2C2D35',
  text: '#FFFFFF',
  textMuted: '#8E92A0',
  primary: '#B9F0E0',
  primaryText: '#15161A',
  danger: '#FF8A95',
  warning: '#F8F397',
  success: '#B9F0E0',
} as const;

const INK = '#15161A';

export const brandColors = {
  SPOTIFY: { bg: '#B9F0E0', text: INK },
  NETFLIX: { bg: '#DDD0F7', text: INK },
  APPLE: { bg: '#F8F397', text: INK },
  ADOBE: { bg: '#CCD7FE', text: INK },
  CHATGPT: { bg: '#C2F5E9', text: INK },
  YOUTUBE: { bg: '#FFD1D5', text: INK },
  PEACH: { bg: '#FFDDBF', text: INK },
  NEUTRAL: { bg: '#DADCE5', text: INK },
} as const satisfies Record<string, BrandColor>;

// Translucent dark tones used on top of pastel cards.
export const ink = {
  text: INK,
  muted: 'rgba(21, 22, 26, 0.55)',
  badge: 'rgba(21, 22, 26, 0.14)',
  line: 'rgba(21, 22, 26, 0.28)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { md: 14, lg: 24, xl: 28, pill: 999 } as const;

export const categoryLabels = {
  STREAMING: 'Streaming',
  SOFTWARE: 'Software',
  UTILITIES: 'Utilities',
  GAMING: 'Gaming',
  FITNESS: 'Fitness',
  OTHER: 'Other',
} as const;
