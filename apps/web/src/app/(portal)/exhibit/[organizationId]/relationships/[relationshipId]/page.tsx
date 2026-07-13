import { Suspense } from "react";
import { ApiError, getRelationshipWorkspace } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { WorkspaceScreen } from "./workspace-screen";
import { WorkspaceLoading, WorkspaceMessage } from "./workspace-state";

export default function RelationshipWorkspacePage({ params }: { params: Promise<{ organizationId: string; relationshipId: string }> }) {
  return <Suspense fallback={<WorkspaceLoading />}><Workspace params={params} /></Suspense>;
}

async function Workspace({ params }: { params: Promise<{ organizationId: string; relationshipId: string }> }) {
  const { organizationId, relationshipId } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return <WorkspaceMessage title="Sign in required" detail="Sign in to view this relationship." />;
  try {
    const workspace = await getRelationshipWorkspace({ baseUrl: getApiBaseUrl(), accessToken: session.access_token, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }, organizationId, relationshipId);
    return <WorkspaceScreen workspace={workspace} organizationId={organizationId} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return <WorkspaceMessage title="Sign in required" detail="Your session has expired. Please sign in again." />;
    if (error instanceof ApiError && error.status === 404) return <WorkspaceMessage title="Relationship unavailable" detail="This relationship no longer exists or is not available to your organization." />;
    if (error instanceof ApiError && error.status === 403) return <WorkspaceMessage title="Access denied" detail="You do not have access to this relationship." />;
    return <WorkspaceMessage title="Unable to load relationship" detail="Check your connection and try again." />;
  }
}
