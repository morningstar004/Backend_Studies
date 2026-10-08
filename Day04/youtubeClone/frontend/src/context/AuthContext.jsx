import {
  createContext, // Hook to create a new React context
  useCallback, // Hook to memoize callback functions
  useContext, // Hook to consume context values
  useEffect, // Hook to run side effects
  useMemo, // Hook to memoize expensive computations
  useState, // Hook to manage component state
} from "react";
// Import the authentication API module for making auth-related requests
import { authApi } from "../api/authApi.js";
// Import the toast notification library for displaying user feedback
import { toast } from "sonner";

const AuthContext = createContext(null);

// AuthProvider component that wraps the entire app to provide authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized async function to fetch the current user's data from the server
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Call the API to get current user data
      const data = await authApi.currentUser();
      // Update user state with fetched data, or null if no data is returned
      setUser(data?.data || null);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect hook to fetch current user when the component first mounts
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Async function to handle user login with provided credentials
  const login = async (credentials) => {
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
    [user, loading, error, fetchCurrentUser],
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
