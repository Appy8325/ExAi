"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthState = "loading" | "signed-out" | "signed-in";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  initials: string;
};

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser ? projectUser(sessionUser) : null);
      setState(sessionUser ? "signed-in" : "signed-out");
    } catch {
      setUser(null);
      setState("signed-out");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    refresh();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? projectUser(session.user) : null);
      setState(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    setUser(null);
    setState("signed-out");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, user, signOut, refresh }),
    [state, user, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return context;
}

function projectUser(user: { id: string; email?: string | null; user_metadata?: { full_name?: string; name?: string } | null }) {
  const meta = user.user_metadata ?? {};
  const metaName = (meta.full_name ?? meta.name ?? "").trim();
  const email = user.email ?? "";
  const displayName = metaName || email.split("@")[0] || "Account";
  const initialsSource =
    metaName.replace(/\s+/g, " ").trim() ||
    email.split("@")[0] ||
    "EX";
  const initials = initialsSource
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
  return {
    id: user.id,
    email,
    displayName,
    initials: initials || "EX",
  };
}
