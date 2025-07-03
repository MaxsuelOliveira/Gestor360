import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Tenta carregar o usuário salvo
  useEffect(() => {
    const storedUser =
      sessionStorage.getItem("userAuth") || localStorage.getItem("userAuth");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Faz login a partir do token JWT
  const login = (token: string, remember = true) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload || !payload.id || !payload.email) throw new Error();

      // Armazena token e user
      localStorage.setItem("token", token);
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("userAuth", JSON.stringify(payload));
      setUser(payload);
    } catch {
      console.error("Token inválido");
      logout();
    }
  };

  // Faz logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userAuth");
    sessionStorage.removeItem("userAuth");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user?.is_admin;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);