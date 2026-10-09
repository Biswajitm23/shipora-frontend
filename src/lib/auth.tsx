"use client";

/**
 * Auth state for the website (AUTH-002).
 *
 * The access token lives in memory (lib/api.ts); the refresh token is kept in
 * localStorage so a reload stays logged in (Phase 3 hardening may move it to an
 * httpOnly cookie). On load, a stored refresh token is exchanged for an access token
 * and the user is fetched from /api/auth/me/.
 */

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Loading } from "@/components/states";
import { can, type Permission } from "@/lib/access";
import { api, setAccessToken, setRefreshHandler } from "@/lib/api";

export type Role = "CUSTOMER" | "STAFF" | "AGENT" | "ADMIN";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: Role;
  email_verified: boolean;
  permissions: Permission[];
};

type LoginResult = { access: string; refresh: string; user: User };

type AuthState =
  | { status: "loading"; user: null }
  // loggedOut: the user chose to log out (vs. never logged in / session expired).
  | { status: "anonymous"; user: null; loggedOut?: boolean }
  | { status: "authenticated"; user: User };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const REFRESH_KEY = "shipora.refresh";

/** Each account type's own area: where it lands after logging in. */
export const AREA_PATHS: Record<Role, string> = {
  CUSTOMER: "/customer",
  STAFF: "/staff",
  AGENT: "/agent",
  ADMIN: "/admin",
};

export const AREA_NAMES: Record<Role, string> = {
  CUSTOMER: "Customer",
  STAFF: "Logistics Staff",
  AGENT: "Delivery Agent",
  ADMIN: "Admin",
};

/** Only follow same-site paths from a ?next= parameter. */
export function safeNextPath(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

function readRefresh(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefresh(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(REFRESH_KEY, token);
    else window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage unavailable (private mode): the session just won't survive a reload.
  }
}

/** Exchange the stored refresh token for a new access token. */
async function renewAccess(): Promise<string | null> {
  const refresh = readRefresh();
  if (!refresh) return null;
  try {
    const { access } = await api.post<{ access: string }>("/api/auth/refresh/", { refresh });
    setAccessToken(access);
    return access;
  } catch {
    setAccessToken(null);
    writeRefresh(null);
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  const clearSession = useCallback((loggedOut = false) => {
    setAccessToken(null);
    writeRefresh(null);
    setState({ status: "anonymous", user: null, loggedOut });
  }, []);

  const logout = useCallback(() => clearSession(true), [clearSession]);

  useEffect(() => {
    setRefreshHandler(async () => {
      const access = await renewAccess();
      if (!access) setState({ status: "anonymous", user: null });
      return access;
    });

    let cancelled = false;
    (async () => {
      const access = await renewAccess();
      const user = access ? await api.get<User>("/api/auth/me/").catch(() => null) : null;
      if (cancelled) return;
      if (user) setState({ status: "authenticated", user });
      else clearSession();
    })();

    return () => {
      cancelled = true;
      setRefreshHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<LoginResult>("/api/auth/login/", { email, password });
    setAccessToken(result.access);
    writeRefresh(result.refresh);
    setState({ status: "authenticated", user: result.user });
    return result.user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}

/**
 * Guard for an account area. Logged-out visitors go to /login (and come back
 * afterwards), except right after logging out, which goes to the home page; a user
 * of another account type, or without the page's access rule (ROLE-002), goes to
 * their own area.
 */
export function RequireAuth({
  role,
  permission,
  children,
}: {
  role: Role;
  permission?: Permission;
  children: ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed =
    auth.status === "authenticated" &&
    auth.user.role === role &&
    (!permission || can(auth.user, permission));

  useEffect(() => {
    if (auth.status === "anonymous") {
      router.replace(auth.loggedOut ? "/" : `/login?next=${encodeURIComponent(pathname)}`);
    } else if (auth.status === "authenticated" && !allowed) {
      router.replace(AREA_PATHS[auth.user.role]);
    }
  }, [auth, allowed, pathname, router]);

  if (!allowed) {
    return (
      <main>
        <Loading />
      </main>
    );
  }
  return <>{children}</>;
}
