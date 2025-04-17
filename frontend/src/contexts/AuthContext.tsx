import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/services/api";

type UserRole = "admin" | "hospital" | "recipient" | "bank" | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isHospital: () => boolean;
  isBloodBank: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for user session
    const storedUser = localStorage.getItem("bloodbank_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Use real API for authentication
      const response = await authApi.login({ email, password });

      // Store token first
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }

      // Handle user data from response
      const userData = {
        id: response.user?.id || response.user?.user_id || "",
        email: response.user?.email || "",
        name: response.user?.name || "",
        role: (response.user?.role as UserRole) || "recipient",
      };

      setUser(userData);
      localStorage.setItem("bloodbank_user", JSON.stringify(userData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Determine role - for now we're assuming all new registrations are for hospitals
      const role = "hospital";

      // Use real API for registration
      const response = await authApi.register({ name, email, password, role });

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      // Return success to the component
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      // Pass the error back to the component
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bloodbank_user");
    localStorage.removeItem("auth_token");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isHospital = () => {
    // Support both 'hospital' and 'recipient' roles for hospital users
    return user?.role === "hospital" || user?.role === "recipient";
  };

  const isBloodBank = () => {
    return user?.role === "bank";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isHospital,
        isBloodBank,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
