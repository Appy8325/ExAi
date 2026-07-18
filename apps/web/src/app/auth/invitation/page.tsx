"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function InvitationCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function acceptInvitation() {
      try {
        const params = new URLSearchParams(window.location.search);
        const invitation = params.get("invitation");
        if (!invitation) throw new Error("Invitation token is missing.");

        const supabase = createClient();
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}`,
          );
        }

        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("Invitation sign-in could not be verified.");
        }
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Invitation session is unavailable.");

        const response = await fetch(
          `${getApiBaseUrl()}/v1/organizer/invitations/accept`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ token: invitation }),
          },
        );
        if (!response.ok) {
          const problem = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(
            problem.message ?? "Invitation could not be accepted.",
          );
        }

        const accepted = (await response.json()) as { redirectTo?: string };
        const next = accepted.redirectTo ?? params.get("next");
        if (!cancelled) router.replace(isLocalPath(next) ? next : "/demo");
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Invitation failed.",
          );
        }
      }
    }

    void acceptInvitation();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
      <div className="w-full rounded-xl border border-default bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-primary">
          Accepting invitation
        </h1>
        <p className="mt-2 text-sm text-secondary">
          {error || "Confirming your account and access…"}
        </p>
      </div>
    </main>
  );
}

function isLocalPath(value: string | null): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}
