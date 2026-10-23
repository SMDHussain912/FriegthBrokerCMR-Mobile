import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { styles } from "@/components/ui";

/**
 * Sign-in screen. Authenticates directly against the Render backend and
 * persists the returned JWT via AsyncStorage (see AuthContext).
 */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (pending) return;
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setPending(true);
    try {
      await login(email.trim(), password);
      router.replace("/(app)");
    } catch (err: any) {
      setError(err?.message || "Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>FreightBrokerCMR</Text>
        <Text style={[styles.subtitle, { marginBottom: 24 }]}>
          Sign in to manage loads and carriers.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@brokerage.com"
          placeholderTextColor="#5b6b87"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#5b6b87"
          secureTextEntry
          textContentType="password"
        />

        <Pressable
          style={[styles.primaryButton, pending ? styles.primaryButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={pending}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {pending ? "Signing in…" : "Sign In"}
          </Text>
        </Pressable>

        <Link href="/signup" asChild>
          <Text style={styles.linkText}>Need an account? Create one</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}