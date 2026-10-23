import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { carriersApi, type Carrier } from "@/components/api";
import { StatusBadge, styles } from "@/components/ui";

/**
 * Carrier directory with live search backed by GET /api/carriers?query=...
 */
export default function CarriersScreen() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const result = await carriersApi.list(query || undefined);
        setCarriers(result?.carriers ?? []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Could not load carriers.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query]
  );

  // Debounce the search so we do not fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={styles.label}>Search</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Name, USDOT or MC number"
          placeholderTextColor="#5b6b87"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {error ? (
        <View style={[styles.errorBox, { marginHorizontal: 20, marginTop: 12 }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={carriers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.card}>
              <Text style={styles.value}>No carriers match this search.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={{ color: "#e6edf8", fontSize: 15, fontWeight: "600" }}>
                  {item.legalName}
                </Text>
                <StatusBadge status={item.overallStatus} />
              </View>
              <Text style={[styles.muted, { marginTop: 6 }]}>
                USDOT {item.dotNumber} · MC {item.mcNumber}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <StatusBadge status={item.authorityStatus} />
                <StatusBadge status={item.safetyRating} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}