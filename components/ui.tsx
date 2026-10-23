import { StyleSheet, Text, View, type ViewStyle } from "react-native";

/**
 * Shared visual language for the mobile app, mirroring the dark "ink/mist"
 * palette used by the Next.js frontend so both clients feel like one product.
 */

export const palette = {
  ink900: "#05080f",
  ink850: "#0e1628",
  ink700: "#25334f",
  ink600: "#33415c",
  brand500: "#3b82f6",
  brand600: "#2563eb",
  pass400: "#4ade80",
  fail400: "#fb7185",
  warn400: "#fbbf24",
  mist100: "#e6edf8",
  mist300: "#c4d2e6",
  mist400: "#9fb0c9",
  mist500: "#7d90af",
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.ink900,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: palette.ink850,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.ink700,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.mist100,
  },
  subtitle: {
    fontSize: 14,
    color: palette.mist400,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: palette.mist500,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: palette.mist500,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: palette.ink850,
    borderWidth: 1,
    borderColor: palette.ink700,
    borderRadius: 8,
    color: palette.mist100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#2a1420",
    borderWidth: 1,
    borderColor: "#5c2438",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: palette.fail400,
    fontSize: 13,
  },
  successBox: {
    backgroundColor: "#0f2418",
    borderWidth: 1,
    borderColor: "#1f5c37",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: palette.pass400,
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: palette.brand600,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: palette.ink700,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: palette.mist300,
    fontSize: 14,
    fontWeight: "500",
  },
  linkText: {
    color: palette.brand500,
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  headerAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.ink700,
    backgroundColor: palette.ink850,
  },
  headerActionText: {
    color: palette.mist100,
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mono: {
    fontFamily: "monospace",
  },
  muted: {
    color: palette.mist500,
    fontSize: 12,
  },
  value: {
    color: palette.mist300,
    fontSize: 13,
  },
});

/** Colour-coded status pill used for load status and carrier vetting status. */
export function StatusBadge({ status, style }: { status: string; style?: ViewStyle }) {
  const tone = badgeTone(status);
  return (
    <View
      style={[
        {
          backgroundColor: tone.background,
          borderColor: tone.border,
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 3,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text style={{ color: tone.text, fontSize: 10, fontWeight: "700", letterSpacing: 0.6 }}>
        {status.replace(/_/g, " ")}
      </Text>
    </View>
  );
}

function badgeTone(status: string) {
  switch (status) {
    case "PASS":
    case "POSTED":
    case "ASSIGNED":
    case "ACTIVE":
    case "SATISFACTORY":
    case "VERIFIED":
      return { background: "#0f2418", border: "#1f5c37", text: palette.pass400 };
    case "FAIL":
    case "REVOKED":
    case "UNSATISFACTORY":
    case "REJECTED":
    case "EXPIRED":
    case "CANCELLED":
      return { background: "#2a1420", border: "#5c2438", text: palette.fail400 };
    case "NEEDS_REVIEW":
    case "CONDITIONAL":
    case "PENDING":
    case "IN_TRANSIT":
      return { background: "#2a2210", border: "#5c4a1f", text: palette.warn400 };
    default:
      return { background: palette.ink850, border: palette.ink700, text: palette.mist400 };
  }
}

/** Label / value pair used throughout the detail screens. */
export function DataPoint({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <Text style={[styles.value, mono ? styles.mono : null]}>{value || "—"}</Text>
    </View>
  );
}