import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, ApiError, type User } from "./api";

/**
 * Key used to persist the JWT. The web app stores its token in an httpOnly
 * cookie, but a mobile client has no cookie jar, so we persist the JWT
 * ourselves via AsyncStorage.
 */
const TOKEN_KEY = "fbc_session";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore a persisted session on cold start. The stored token is validated
  // against the backend so revoked/expired tokens are discarded immediately.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (!stored) return;
        const result = await authApi.me(stored);
        if (cancelled) return;
        setToken(stored);
        setUser(result?.user ?? null);
      } catch (error) {
        // Distinguish a server-reported invalid/expired token from a transient
        // network failure. Only the former clears the stored session.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          await AsyncStorage.removeItem(TOKEN_KEY);
        } else {
          console.warn("[auth] Session restore failed (transient/none server-side), keeping token.", error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (jwt: string, profile: User) => {
    await AsyncStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(profile);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      await persist(result.token, result.user);
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      // Server always enforces broker role; the client does not transmit a role.
      const result = await authApi.register(name, email, password);
      await persist(result.token, result.user);
    },
    [persist]
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}