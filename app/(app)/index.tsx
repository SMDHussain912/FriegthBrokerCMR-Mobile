import { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { loadsApi, type Load } from "@/components/api";
import { StatusBadge, styles } from "@/components/ui";

/**
 * Dashboard — a quick read on the load board plus shortcuts to the main flows.
 */
export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const result = await loadsApi.list(undefined);
      setLoads(result?.loads ?? []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Could not load the load board.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const posted = loads.filter((l) => l.status === "POSTED");
  const assigned = loads.filter((l) => l.status === "ASSIGNED");

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          tintColor="#3b82f6"
        />
      }
    >
      <Text style={styles.title}>Welcome, {user?.name}</Text>
      <Text style={[styles.subtitle, { marginBottom: 20 }]}>
        Signed in as {user?.email} · {user?.role?.replace(/_/g, " ")}
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total loads" value={loads.length} />
        <StatCard label="Posted" value={posted.length} />
        <StatCard label="Assigned" value={assigned.length} />
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <Link href="/loads/create" asChild>
          <Pressable style={[styles.primaryButton, { flex: 1, marginTop: 0 }]}>
            <Text style={styles.primaryButtonText}>Post Load</Text>
          </Pressable>
        </Link>
        <Link href="/loads" asChild>
          <Pressable style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]}>
            <Text style={styles.secondaryButtonText}>All Loads</Text>
          </Pressable>
        </Link>
      </View>

      {/*
        The app has no bottom tab bar yet, so the carrier directory needs its
        own entry point on the dashboard to stay discoverable.
      */}
      <Link href="/carriers" asChild>
        <Pressable style={[styles.secondaryButton, { marginTop: 0, marginBottom: 24 }]}>
          <Text style={styles.secondaryButtonText}>Browse Carriers</Text>
        </Pressable>
      </Link>

      <Text style={styles.sectionTitle}>Recent loads</Text>

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 24 }} />
      ) : loads.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.value}>No loads yet. Post your first load to get started.</Text>
        </View>
      ) : (
        loads.slice(0, 5).map((load) => (
          <Link key={load._id} href={`/loads/${load._id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.row}>
                <Text style={{ color: "#e6edf8", fontSize: 15, fontWeight: "600" }}>
                  {load.loadNumber}
                </Text>
                <StatusBadge status={load.status} />
              </View>
              <Text style={[styles.muted, { marginTop: 6 }]}>
                {load.origin?.city}, {load.origin?.state} → {load.destination?.city},{" "}
                {load.destination?.state}
              </Text>
              <Text style={[styles.muted, { marginTop: 2 }]}>
                {load.equipmentType?.replace(/_/g, " ")} · {load.shipperName}
              </Text>
            </Pressable>
          </Link>
        ))
      )}

      <Pressable style={styles.secondaryButton} onPress={logout}>
        <Text style={[styles.secondaryButtonText, { color: "#fb7185" }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 12 }]}>
      <Text style={[styles.muted, { marginBottom: 4 }]}>{label}</Text>
      <Text style={{ color: "#e6edf8", fontSize: 22, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}