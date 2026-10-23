import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/components/AuthContext";
import { palette } from "@/components/ui";

/**
 * Root layout. Wraps the app in the AuthProvider so every screen can read
 * the persisted session, and configures the global stack navigator.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.ink900 },
            headerTintColor: palette.mist100,
            headerTitleStyle: { fontWeight: "600" },
            contentStyle: { backgroundColor: palette.ink900 },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}