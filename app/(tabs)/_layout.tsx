import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";
import { fonts } from "@/src/typography";

const TABS = [
  { name: "index", label: "Accueil", icon: "House", sf: "house.fill" },
  { name: "cours", label: "Cours", icon: "BookOpen", sf: "book.fill" },
  { name: "calculs", label: "Calculs", icon: "Calculator", sf: "function" },
  { name: "assistant", label: "Assistant", icon: "MagicWand", sf: "wand.and.stars" },
];

export default function TabsLayout() {
  const { colors } = useTheme();

  if (usesNativeTabs) {
    return (
      <NativeTabs>
        {TABS.map((t) => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <NativeTabs.Trigger.Icon sf={t.sf as never} />
            <NativeTabs.Trigger.Label>{t.label}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.extrabold, fontSize: 11, marginTop: 2 },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarStyle: {
          backgroundColor: colors.surfaceTertiary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: colors.brand,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
          ...(Platform.OS === "web" ? { height: 70, paddingTop: 6, paddingBottom: 6 } : { paddingTop: 5 }),
        },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={t.icon} size={24} color={String(color)} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
