import { useCallback, useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { carriersApi, loadsApi, type Carrier, type Load } from "@/components/api";
import { DataPoint, StatusBadge, styles } from "@/components/ui";

/**
 * Load detail — shows the load dossier and lets a broker assign a carrier.
 * Assignment runs the backend vetting engine; a rejected carrier surfaces the
 * server's failure reason.
 */
export default function LoadDetailScreen() {
  // expo-router returns string | null for path params; the `/:id` route
  // guarantees a non-null value at runtime.
  const { id } = useLocalSearchParams() as { id: string };
  const idStr: string = id as unknown as string;
  const router = useRouter();
  const { token, user } = useAuth();

  const [load, setLoad] = useState<Load | null>(null);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchLoad = useCallback(async () => {
    if (!idStr || !token) return;
    try {
      const result = await loadsApi.get(idStr, token);
      setLoad(result?.load ?? null);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Could not load this load.");
    } finally {
      setLoading(false);
    }
  }, [idStr, token]);

  useEffect(() => {
    fetchLoad();
  }, [fetchLoad]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await carriersApi.list();
        if (!cancelled) setCarriers(result?.carriers ?? []);
      } catch {
        // The carrier picker is optional; the load view still works without it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleAssign() {
    if (!load || !selectedCarrierId || !token || assigning) return;
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      // Backend /loads/:id/assign derives actor identity + role from the JWT
      // and expects { carrierId, overrideReason?, allowOverride? } only.
      const result = await loadsApi.assign(
        load._id,
        selectedCarrierId
      );
      const name = result?.assignment?.carrierName ?? "Carrier";
      setSuccess(`${name} assigned to ${load.loadNumber}.`);
      setSelectedCarrierId(null);
      await fetchLoad();
    } catch (err: any) {
      setError(err?.message || "Assignment failed.");
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (!load) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error ?? "Load not found."}</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: load.loadNumber }} />

      <View style={styles.row}>
        <Text style={styles.title}>{load.loadNumber}</Text>
        <StatusBadge status={load.status} />
      </View>
      <Text style={[styles.subtitle, { marginBottom: 20 }]}>
        {load.origin?.city}, {load.origin?.state} → {load.destination?.city},{" "}
        {load.destination?.state}
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <DataPoint label="Shipper" value={load.shipperName} />
        <DataPoint label="Commodity" value={load.commodity} />
        <DataPoint label="Equipment" value={load.equipmentType?.replace(/_/g, " ")} mono />
        <DataPoint
          label="Declared value"
          value={
            load.declaredCargoValue != null
              ? `$${Number(load.declaredCargoValue).toLocaleString()}`
              : null
          }
          mono
        />
        <DataPoint label="Pickup" value={formatDate(load.origin?.pickupDate)} />
        <DataPoint label="Delivery" value={formatDate(load.destination?.deliveryDate)} />
        {load.assignedCarrier ? (
          <>
            <DataPoint label="Assigned carrier" value={load.assignedCarrier.legalName} />
            <DataPoint
              label="DOT / MC"
              value={`${load.assignedCarrier.dotNumber} / ${load.assignedCarrier.mcNumber}`}
              mono
            />
          </>
        ) : null}
      </View>

      {load.status === "POSTED" ? (
        <View style={styles.card}>
          <Text style={styles.title}>Accept load</Text>
          <Text style={[styles.subtitle, { marginTop: 4, marginBottom: 12 }]}>
            Assign a carrier. Vetting runs automatically before assignment.
          </Text>

          {carriers.length === 0 ? (
            <Text style={styles.value}>No carriers available.</Text>
          ) : (
            carriers.map((carrier) => {
              const selected = selectedCarrierId === carrier._id;
              return (
                <Pressable
                  key={carrier._id}
                  onPress={() => setSelectedCarrierId(carrier._id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? "#3b82f6" : "#25334f",
                    backgroundColor: selected ? "#132444" : "#0e1628",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View style={styles.row}>
                    <Text style={{ color: "#e6edf8", fontSize: 14, fontWeight: "600" }}>
                      {carrier.legalName}
                    </Text>
                    <StatusBadge status={carrier.overallStatus} />
                  </View>
                  <Text style={[styles.muted, { marginTop: 4 }]}>
                    USDOT {carrier.dotNumber} · MC {carrier.mcNumber} ·{" "}
                    {carrier.safetyRating?.replace(/_/g, " ")}
                  </Text>
                </Pressable>
              );
            })
          )}

          <Pressable
            style={[
              styles.primaryButton,
              !selectedCarrierId || assigning ? styles.primaryButtonDisabled : null,
            ]}
            onPress={handleAssign}
            disabled={!selectedCarrierId || assigning}
          >
            <Text style={styles.primaryButtonText}>
              {assigning ? "Assigning…" : "Accept & assign carrier"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}
