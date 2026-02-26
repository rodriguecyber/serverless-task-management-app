import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, signIn, signOut, fetchAuthSession } from "aws-amplify/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSession = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (idToken) {
        const u = await getCurrentUser();
        setUser(u);
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      await signIn({ username: username.trim(), password });
      await loadSession();
    } catch (err) {
      const message = err.message || err.name || "Sign in failed";
      setError(message);
      throw err;
    }
  }, [loadSession]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
      setToken(null);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, refreshSession: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
