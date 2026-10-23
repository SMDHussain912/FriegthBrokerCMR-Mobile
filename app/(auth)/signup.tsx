import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { styles } from "@/components/ui";

const ROLES = [
  { value: "broker", label: "Broker" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "admin", label: "Admin" },
];

/**
 * Account creation. Mirrors the web signup flow: name, email, password
 * (min 8 chars) and a role, sent to POST /api/auth/register.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("broker");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (pending) return;
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      router.replace("/(app)");
    } catch (err: any) {
      setError(err?.message || "Could not create your account.");
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={[styles.subtitle, { marginBottom: 24 }]}>
          Set up your broker account to start posting loads.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Alex Rivera"
          placeholderTextColor="#5b6b87"
          autoCapitalize="words"
        />

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
          placeholder="At least 8 characters"
          placeholderTextColor="#5b6b87"
          secureTextEntry
          textContentType="password"
        />

        <Text style={styles.label}>Role</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {ROLES.map((option) => {
            const selected = role === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setRole(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? "#3b82f6" : "#25334f",
                  backgroundColor: selected ? "#132444" : "#0e1628",
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: selected ? "#e6edf8" : "#9fb0c9",
                    fontSize: 13,
                    fontWeight: selected ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryButton, pending ? styles.primaryButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={pending}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {pending ? "Creating account…" : "Create Account"}
          </Text>
        </Pressable>

        <Link href="/login" asChild>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}