import { StyleSheet, Text, View } from 'react-native';
import {
  Apple,
  Cloud,
  Code,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Music,
  Package,
  Play,
  ShoppingBag,
  Sparkles,
  Tv,
  type LucideIcon,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import type { ServiceIconKey } from '../constants/presets';

type LucideIconKey = Exclude<ServiceIconKey, 'spotify' | 'netflix'>;

const LUCIDE_ICONS: Record<LucideIconKey, LucideIcon> = {
  apple: Apple,
  cloud: Cloud,
  ai: Sparkles,
  play: Play,
  tv: Tv,
  music: Music,
  gamepad: Gamepad2,
  fitness: Dumbbell,
  code: Code,
  learn: GraduationCap,
  shopping: ShoppingBag,
  package: Package,
};

const GLYPH_RATIO = 0.5;

interface ServiceBadgeProps {
  icon: ServiceIconKey;
  size: number;
  backgroundColor: string;
  color: string;
}

function SpotifyGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 9.2c4.8-1.4 10-1 14.5 1.3" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M5.5 13c3.9-1 7.8-.7 11.2 1" stroke={color} strokeWidth={2.1} strokeLinecap="round" />
      <Path d="M6.6 16.6c3-.7 6-.4 8.6.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function Glyph({ icon, size, color }: { icon: ServiceIconKey; size: number; color: string }) {
  if (icon === 'spotify') return <SpotifyGlyph size={size} color={color} />;
  if (icon === 'netflix') {
    return <Text style={{ color, fontSize: size * 1.15, fontWeight: '900', lineHeight: size * 1.3 }}>N</Text>;
  }
  const Icon = LUCIDE_ICONS[icon];
  return <Icon color={color} size={size} strokeWidth={2.2} />;
}

export function ServiceBadge({ icon, size, backgroundColor, color }: ServiceBadgeProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor, borderRadius: size / 2, height: size, width: size }]}
    >
      <Glyph icon={icon} size={size * GLYPH_RATIO} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
