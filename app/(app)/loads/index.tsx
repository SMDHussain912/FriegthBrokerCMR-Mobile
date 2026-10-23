import { useCallback, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { loadsApi, type Load } from "@/components/api";
import { StatusBadge, styles } from "@/components/ui";

const FILTERS = [
  { value: "", label: "All" },
  { value: "POSTED", label: "Posted" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
];

/**
 * Load board — the full list of loads with status filtering.
 */
export default function LoadsScreen() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const result = await loadsApi.list(undefined, status || undefined);
        setLoads(result?.loads ?? []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Could not load loads.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status]
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.screen}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        {FILTERS.map((filter) => {
          const selected = status === filter.value;
          return (
            <Pressable
              key={filter.value || "all"}
              onPress={() => {
                setStatus(filter.value);
                setLoading(true);
              }}
              style={{
                borderWidth: 1,
                borderColor: selected ? "#3b82f6" : "#25334f",
                backgroundColor: selected ? "#132444" : "#0e1628",
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{
                  color: selected ? "#e6edf8" : "#9fb0c9",
                  fontSize: 12,
                  fontWeight: selected ? "600" : "400",
                }}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={[styles.errorBox, { marginHorizontal: 20 }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={loads}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 48 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.card}>
              <Text style={styles.value}>No loads match this filter.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Link href={`/loads/${item._id}`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.row}>
                  <Text style={{ color: "#e6edf8", fontSize: 15, fontWeight: "600" }}>
                    {item.loadNumber}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={[styles.muted, { marginTop: 6 }]}>
                  {item.origin?.city}, {item.origin?.state} → {item.destination?.city},{" "}
                  {item.destination?.state}
                </Text>
                <Text style={[styles.muted, { marginTop: 2 }]}>
                  {item.equipmentType?.replace(/_/g, " ")} · {item.commodity}
                </Text>
                {item.assignedCarrier ? (
                  <Text style={[styles.muted, { marginTop: 6, color: "#4ade80" }]}>
                    Assigned to {item.assignedCarrier.legalName}
                  </Text>
                ) : null}
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}