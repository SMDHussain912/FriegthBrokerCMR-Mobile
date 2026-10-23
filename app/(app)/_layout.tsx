import { Stack, Redirect, Link } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { palette, styles } from "@/components/ui";

/**
 * Header action that exposes the carrier directory.
 *
 * The mobile app has no bottom tab bar yet, so the carriers screen would
 * otherwise be unreachable from the dashboard. This keeps the existing
 * screen discoverable without pulling in a navigation dependency.
 */
function CarriersHeaderAction() {
  return (
    <Link href="/carriers" asChild>
      <Text style={styles.headerActionText} accessibilityRole="link">
        Carriers
      </Text>
    </Link>
  );
}

/**
 * Authenticated app shell. Users without a session are bounced back to login.
 */
export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.ink900 },
        headerTintColor: palette.mist100,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: palette.ink900 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerRight: () => <CarriersHeaderAction />,
        }}
      />
      <Stack.Screen
        name="loads/index"
        options={{
          title: "Loads",
          headerRight: () => <CarriersHeaderAction />,
        }}
      />
      <Stack.Screen name="loads/create" options={{ title: "Post Load" }} />
      <Stack.Screen name="loads/[id]" options={{ title: "Load Detail" }} />
      <Stack.Screen
        name="carriers/index"
        options={{
          title: "Carriers",
          // The carriers screen is reachable from the dashboard and the header
          // action, so it does not need a link back to itself.
          headerRight: () => null,
        }}
      />
    </Stack>
  );
}