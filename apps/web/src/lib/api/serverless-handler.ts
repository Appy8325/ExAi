const BODYLESS = new Set(["GET", "HEAD"]);

export async function handleApiRequest(request: Request) {
  const { injectApiRequest } = await import("api/serverless");
  const url = new URL(request.url);
  const response = await injectApiRequest({
    method: request.method,
    url: `${url.pathname}${url.search}`,
    headers: Object.fromEntries(request.headers),
    payload: BODYLESS.has(request.method) ? undefined : Buffer.from(await request.arrayBuffer()),
  });
  const headers = new Headers();
  for (const [name, value] of Object.entries(response.headers)) {
    if (value === undefined || ["content-length", "transfer-encoding", "connection"].includes(name)) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, String(item));
  }
  return new Response(new Uint8Array(response.rawPayload), { status: response.statusCode, headers });
}
