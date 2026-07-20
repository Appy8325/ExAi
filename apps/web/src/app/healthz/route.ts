import { handleApiRequest } from "@/lib/api/serverless-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const GET = handleApiRequest;
export const HEAD = handleApiRequest;
// VERCEL_TOKEN secret configured at 2026-07-20 19:12:10
