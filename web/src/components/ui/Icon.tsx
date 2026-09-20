import {
  Dumbbell, Flame, Zap, HeartPulse, Wind, Sparkles, Target, Swords,
  Users, DoorOpen, Car, Snowflake, Mountain, Clock, MapPin, Phone,
  Check, ArrowRight, ArrowUpRight, Plus, Minus, Star,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Dumbbell, Flame, Zap, HeartPulse, Wind, Sparkles, Target, Swords,
  Users, DoorOpen, Car, Snowflake, Mountain, Clock, MapPin, Phone,
  Check, ArrowRight, ArrowUpRight, Plus, Minus, Star,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = map[name] ?? Dumbbell;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
