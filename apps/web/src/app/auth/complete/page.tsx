"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function CompleteAttendeeAuthPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    const complete = async () => {
      try {
        const supabase = createClient();
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const code = new URLSearchParams(window.location.search).get("code");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          window.history.replaceState(null, "", window.location.pathname);
        } else if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session)
          throw new Error("Authenticated session was not established.");
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user)
          throw new Error("Authenticated attendee could not be confirmed.");
        const response = await fetch(
          `${getApiBaseUrl()}/v1/public/enroll/complete`,
          {
            method: "POST",
            headers: { authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          },
        );
        if (!response.ok) throw new Error("Enrollment could not be completed.");
        const result = (await response.json()) as { publicQrToken?: string };
        if (!result.publicQrToken)
          throw new Error("The booth connection is no longer available.");
        if (active)
          router.replace(
            `/visit/${encodeURIComponent(result.publicQrToken)}?connected=1`,
          );
      } catch {
        if (active)
          setError(
            "We could not complete sign-in. Request a new Magic Link and try again.",
          );
      }
    };
    void complete();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-canvas px-gutter py-section">
      <Card className="space-y-3">
        <h1 className="text-title font-semibold">Completing your connection</h1>
        <p className="text-body text-secondary" aria-live="polite">
          {error ??
            "Confirming your secure session and connecting you to the booth…"}
        </p>
      </Card>
    </main>
  );
}
