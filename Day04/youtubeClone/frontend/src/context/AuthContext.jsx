import {
  createContext, // Hook to create a new React context
  useCallback, // Hook to memoize callback functions
  useContext, // Hook to consume context values
  useEffect, // Hook to run side effects
  useMemo, // Hook to memoize expensive computations
  useState, // Hook to manage component state
} from "react";
import { useQueryClient } from "@tanstack/react-query";
// Import the authentication API module for making auth-related requests
import { authApi } from "../api/authApi.js";
// Import the toast notification library for displaying user feedback
import { toast } from "sonner";
import {
  clearOfflineCache,
  readOfflineUser,
  saveOfflineUser,
} from "./offlineCache.js";

const AuthContext = createContext(null);

// AuthProvider component that wraps the entire app to provide authentication state
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readOfflineUser);
  const [loading, setLoading] = useState(() => !readOfflineUser());
  const [error, setError] = useState(null);

  // Memoized async function to fetch the current user's data from the server
  const fetchCurrentUser = useCallback(async () => {
    try {
      setError(null);
      // Call the API to get current user data
      const data = await authApi.currentUser();
      // Update user state with fetched data, or null if no data is returned
      const currentUser = data?.data || null;
      setUser(currentUser);
      saveOfflineUser(currentUser);
    } catch (err) {
      if (err.status >= 400 && err.status < 500) {
        setUser(null);
        queryClient.clear();
        clearOfflineCache();
      } else {
        setUser(readOfflineUser());
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  // useEffect hook to fetch current user when the component first mounts
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Async function to handle user login with provided credentials
  const login = async (credentials) => {
    clearOfflineCache();
    queryClient.clear();
    await authApi.login(credentials);
    await fetchCurrentUser();
  };

  // Async function to handle user logout
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setError(null);
      queryClient.clear();
      clearOfflineCache();
      toast.success("Signed out");
    }
  };

  // Memoize the context value object to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      // Function to refresh/refetch current user data
      refreshUser: fetchCurrentUser,
    }),
    // Re-compute value only when these dependencies change
    [user, loading, error, fetchCurrentUser, queryClient],
  );

  // Provide the auth context value to all child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access authentication context from any component
export const useAuth = () => {
  // Get the current context value
  const context = useContext(AuthContext);

  // Verify that the hook is being used inside an AuthProvider component
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
