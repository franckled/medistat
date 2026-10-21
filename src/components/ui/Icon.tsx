import * as Phosphor from "phosphor-react-native";

import { useTheme } from "@/src/theme";

type Weight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

type Props = {
  name: string;
  size?: number;
  color?: string;
  weight?: Weight;
};

export function Icon({ name, size = 24, color, weight = "bold" }: Props) {
  const { colors } = useTheme();
  const Cmp = (Phosphor as Record<string, React.ComponentType<any>>)[name] ?? Phosphor.CircleDashed;
  return <Cmp size={size} color={color ?? colors.onSurface} weight={weight} />;
}
