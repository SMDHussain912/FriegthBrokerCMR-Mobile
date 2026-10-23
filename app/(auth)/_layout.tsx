import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { palette } from "@/components/ui";

/**
 * Auth group. Redirects signed-in users to the app shell.
 */
export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.ink900 },
        headerTintColor: palette.mist100,
        contentStyle: { backgroundColor: palette.ink900 },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Sign In" }} />
      <Stack.Screen name="signup" options={{ title: "Create Account" }} />
    </Stack>
  );
}