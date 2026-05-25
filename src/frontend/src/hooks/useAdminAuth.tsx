import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useActor } from "./useActor";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  token: string | null;
  login: (
    username: string,
    password: string,
    challengeId: string,
    challengeAnswer: bigint,
    onError?: (msg: string) => void,
  ) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const ADMIN_TOKEN_KEY = "vocabchain_admin_token";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY),
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { actor, isFetching } = useActor();
  const validationAttempted = useRef(false);

  // Validate stored token on mount / once actor is ready
  useEffect(() => {
    if (isFetching || !actor) return;
    if (validationAttempted.current) return;
    validationAttempted.current = true;

    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const valid = await actor.isAuthenticatedAdminByToken(storedToken);
        if (valid) {
          setToken(storedToken);
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setToken(null);
          setIsAdminAuthenticated(false);
        }
      } catch {
        // Network error — keep token, treat as unauthenticated for safety
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setIsAdminAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [actor, isFetching]);

  const login = useCallback(
    async (
      username: string,
      password: string,
      challengeId: string,
      challengeAnswer: bigint,
      onError?: (msg: string) => void,
    ): Promise<boolean> => {
      if (!actor) {
        toast.error("Backend not available. Please try again.");
        return false;
      }

      setIsLoggingIn(true);
      try {
        const result = await actor.adminLogin(
          username,
          password,
          challengeId,
          challengeAnswer,
        );

        if (result.ok && result.token) {
          localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
          setToken(result.token);
          setIsAdminAuthenticated(true);
          toast.success("Admin login successful!");
          return true;
        }

        const errMsg = result.error || "Invalid credentials. Please try again.";
        onError?.(errMsg);
        toast.error(errMsg);
        return false;
      } catch (err: unknown) {
        console.error("Admin login error:", err);
        const errMsg = "Login failed. Please try again.";
        onError?.(errMsg);
        toast.error(errMsg);
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor],
  );

  const logout = useCallback(() => {
    const currentToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (currentToken && actor) {
      // Fire-and-forget server-side invalidation
      actor.adminLogout(currentToken).catch(() => {});
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setIsAdminAuthenticated(false);
    toast.success("Logged out successfully");
  }, [actor]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        isLoading,
        isLoggingIn,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
