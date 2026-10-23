import { useState } from "react";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { loadsApi } from "@/components/api";
import { styles } from "@/components/ui";

const EQUIPMENT_TYPES = ["DRY_VAN", "REEFER", "FLATBED"];

/**
 * Post a new load. Mirrors the web "Post Load" form and posts to
 * POST /api/loads with the bearer token.
 */
export default function CreateLoadScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState({
    loadNumber: "",
    shipperName: "",
    originCity: "",
    originState: "",
    destinationCity: "",
    destinationState: "",
    commodity: "",
    equipmentType: "DRY_VAN",
    targetTemperature: "",
    declaredCargoValue: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit() {
    if (pending) return;
    setError(null);

    if (!token) {
      setError("You are not signed in.");
      return;
    }
    if (!form.loadNumber.trim() || !form.shipperName.trim()) {
      setError("Load number and shipper name are required.");
      return;
    }
    if (!form.originCity.trim() || !form.originState.trim()) {
      setError("Origin city and state are required.");
      return;
    }
    if (!form.destinationCity.trim() || !form.destinationState.trim()) {
      setError("Destination city and state are required.");
      return;
    }
    if (!form.commodity.trim()) {
      setError("Commodity is required.");
      return;
    }
    const declaredValue = Number(form.declaredCargoValue);
    if (!Number.isFinite(declaredValue) || declaredValue < 0) {
      setError("Declared cargo value must be a positive number.");
      return;
    }
    if (form.equipmentType === "REEFER" && !form.targetTemperature.trim()) {
      setError("Target temperature is required for refrigerated freight.");
      return;
    }

    setPending(true);
    try {
      const result = await loadsApi.create(
        {
          loadNumber: form.loadNumber.trim(),
          shipperName: form.shipperName.trim(),
          origin: { city: form.originCity.trim(), state: form.originState.trim() },
          destination: {
            city: form.destinationCity.trim(),
            state: form.destinationState.trim(),
          },
          commodity: form.commodity.trim(),
          equipmentType: form.equipmentType as "DRY_VAN" | "REEFER" | "FLATBED",
          targetTemperature:
            form.equipmentType === "REEFER" ? Number(form.targetTemperature) : undefined,
          declaredCargoValue: declaredValue,
        },
        token
      );
      const created = result?.load;
      router.replace(created?._id ? `/loads/${created._id}` : "/loads");
    } catch (err: any) {
      setError(err?.message || "Could not post the load.");
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Post a load</Text>
        <Text style={[styles.subtitle, { marginBottom: 16 }]}>
          Publish a load to the board so carriers can be vetted and assigned.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Load number</Text>
        <TextInput
          style={styles.input}
          value={form.loadNumber}
          onChangeText={(v) => update("loadNumber", v)}
          placeholder="LD-2026-0142"
          placeholderTextColor="#5b6b87"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Shipper name</Text>
        <TextInput
          style={styles.input}
          value={form.shipperName}
          onChangeText={(v) => update("shipperName", v)}
          placeholder="Acme Manufacturing"
          placeholderTextColor="#5b6b87"
        />

        <Text style={styles.label}>Origin city</Text>
        <TextInput
          style={styles.input}
          value={form.originCity}
          onChangeText={(v) => update("originCity", v)}
          placeholder="Atlanta"
          placeholderTextColor="#5b6b87"
        />

        <Text style={styles.label}>Origin state</Text>
        <TextInput
          style={styles.input}
          value={form.originState}
          onChangeText={(v) => update("originState", v)}
          placeholder="GA"
          placeholderTextColor="#5b6b87"
          autoCapitalize="characters"
          maxLength={2}
        />

        <Text style={styles.label}>Destination city</Text>
        <TextInput
          style={styles.input}
          value={form.destinationCity}
          onChangeText={(v) => update("destinationCity", v)}
          placeholder="Nashville"
          placeholderTextColor="#5b6b87"
        />

        <Text style={styles.label}>Destination state</Text>
        <TextInput
          style={styles.input}
          value={form.destinationState}
          onChangeText={(v) => update("destinationState", v)}
          placeholder="TN"
          placeholderTextColor="#5b6b87"
          autoCapitalize="characters"
          maxLength={2}
        />

        <Text style={styles.label}>Commodity</Text>
        <TextInput
          style={styles.input}
          value={form.commodity}
          onChangeText={(v) => update("commodity", v)}
          placeholder="Electronics"
          placeholderTextColor="#5b6b87"
        />

        <Text style={styles.label}>Equipment type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {EQUIPMENT_TYPES.map((type) => {
            const selected = form.equipmentType === type;
            return (
              <Pressable
                key={type}
                onPress={() => update("equipmentType", type)}
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
                  {type.replace("_", " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {form.equipmentType === "REEFER" ? (
          <>
            <Text style={styles.label}>Target temperature (°F)</Text>
            <TextInput
              style={styles.input}
              value={form.targetTemperature}
              onChangeText={(v) => update("targetTemperature", v)}
              placeholder="38"
              placeholderTextColor="#5b6b87"
              keyboardType="numeric"
            />
          </>
        ) : null}

        <Text style={styles.label}>Declared cargo value ($)</Text>
        <TextInput
          style={styles.input}
          value={form.declaredCargoValue}
          onChangeText={(v) => update("declaredCargoValue", v)}
          placeholder="100000"
          placeholderTextColor="#5b6b87"
          keyboardType="numeric"
        />

        <Pressable
          style={[styles.primaryButton, pending ? styles.primaryButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={pending}
        >
          <Text style={styles.primaryButtonText}>
            {pending ? "Posting load…" : "Post load"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
