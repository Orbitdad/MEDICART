import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "medicart_token";
const ROLE_KEY = "medicart_role";
const USER_KEY = "medicart_user";

/* =========================
   SAFE HELPERS
========================= */
function safeValue(value) {
  if (!value || value === "undefined" || value === "null") {
    return null;
  }
  return value;
}

function safeParse(value) {
  try {
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/* =========================
   PROVIDER
========================= */
export function AuthProvider({ children }) {
  // ✅ NEVER use undefined in global context
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ CRITICAL: hydration flag
  const [loading, setLoading] = useState(true);

  /* =========================
     HYDRATE FROM STORAGE
  ========================= */
  useEffect(() => {
    const storedToken = safeValue(localStorage.getItem(TOKEN_KEY));
    const storedRole = safeValue(localStorage.getItem(ROLE_KEY));
    const storedUser = safeParse(localStorage.getItem(USER_KEY));

    setToken(storedToken);
    setRole(storedRole);
    setUser(storedUser);

    // ✅ hydration complete
    setLoading(false);
  }, []);

  /* =========================
     LOGIN
  ========================= */
  const login = ({ token, role, user }) => {
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setToken(token);
    setRole(role);
    setUser(user);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setRole(null);
    setToken(null);
    setRole(null);
    setUser(null);
  };

  /* =========================
     UPDATE USER
     ========================= */
  const updateUser = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading, // ✅ EXPOSE loading
        login,
        logout,
        updateUser,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export function useAuth() {
  return useContext(AuthContext);
}
