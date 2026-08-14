// Import React hooks used for context and state management
import {
  createContext,    // Hook to create a new React context
  useCallback,      // Hook to memoize callback functions
  useContext,       // Hook to consume context values
  useEffect,        // Hook to run side effects
  useMemo,          // Hook to memoize expensive computations
  useState,         // Hook to manage component state
} from "react";
// Import the authentication API module for making auth-related requests
import { authApi } from "../api/authApi.js";
// Import the toast notification library for displaying user feedback
import { toast } from "sonner";

// Create the authentication context with null as default value
const AuthContext = createContext(null);

// AuthProvider component that wraps the entire app to provide authentication state
export const AuthProvider = ({ children }) => {
  // State to store the current authenticated user object
  const [user, setUser] = useState(null);
  // State to track if authentication data is currently being fetched
  const [loading, setLoading] = useState(true);
  // State to store any error messages that occur during authentication
  const [error, setError] = useState(null);

  // Memoized async function to fetch the current user's data from the server
  const fetchCurrentUser = useCallback(async () => {
    try {
      // Set loading to true while fetching user data
      setLoading(true);
      // Clear any previous error messages
      setError(null);
      // Call the API to get current user data
      const data = await authApi.currentUser();
      // Update user state with fetched data, or null if no data is returned
      setUser(data?.data || null);
    } catch (err) {
      // On error, clear the user state
      setUser(null);
      // Store the error message in state
      setError(err.message);
    } finally {
      // Set loading to false after the operation completes (success or error)
      setLoading(false);
    }
  }, []);

  // useEffect hook to fetch current user when the component first mounts
  useEffect(() => {
    // Call fetchCurrentUser on component mount to initialize user state
    fetchCurrentUser();
  }, []);

  // Async function to handle user login with provided credentials
  const login = async (credentials) => {
    // Call API to authenticate user with provided credentials
    await authApi.login(credentials);
    // After successful login, fetch and update the current user's data
    await fetchCurrentUser();
  };

  // Async function to handle user logout
  const logout = async () => {
    try {
      // Call API to logout and invalidate the session
      await authApi.logout();
    } finally {
      // Clear user data after logout
      setUser(null);
      // Clear any error messages
      setError(null);
      // Display a success message to the user
      toast.success("Signed out");
    }
  };

  // Memoize the context value object to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      // Current authenticated user object
      user,
      // Loading state indicating if auth operations are in progress
      loading,
      // Error message if authentication failed
      error,
      // Function to login a user
      login,
      // Function to logout a user
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
    // Throw an error if useAuth is used outside of AuthProvider
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Return the context value for use in the component
  return context;
};
