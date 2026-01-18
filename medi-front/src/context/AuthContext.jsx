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

export function AuthProvider({ children }) {
  const [token, setToken] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const [user, setUser] = useState(undefined);

  // 🔥 hydrate after mount
  useEffect(() => {
    setToken(safeValue(localStorage.getItem(TOKEN_KEY)));
    setRole(safeValue(localStorage.getItem(ROLE_KEY)));
    setUser(safeParse(localStorage.getItem(USER_KEY)));
  }, []);

  const login = ({ token, role, user }) => {
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setToken(token);
    setRole(role);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
