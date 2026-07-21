import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

import { generateDemoQrCodes, type DemoBooth } from "./demo-qr";

type LocalConfig = {
  apiUrl: string;
  dbUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  writeLocalEnvironment: boolean;
};

type DemoSeed = {
  meta: { seed: number; generatedAt: string; version: string };
  event: { name: string; slug: string; venue: string; timezone: string; startAt: string; endAt: string; status: string };
  organizers: Array<{ id: string; email: string; fullName: string; title: string }>;
  exhibitors: Array<{
    id: string; organizationId: string; slug: string; name: string; booth: string;
    tagline: string; industry: string; description: string; website: string; phone: string;
    logo: string; brandColor: string; socialLinks: Record<string, string>;
    contacts: Array<{ name: string; title: string; email: string }>;
    products: Array<{ name: string; description: string; category: string }>;
    knowledgeDocuments: Array<{ title: string; content: string }>;
    brochures: Array<{ title: string; contentType: string }>;
  }>;
  attendees: Array<{
    id: string; email: string; fullName: string; title: string; company: string;
    country: string; industry: string; department: string; buyingIntent: number;
    interests: string[]; ticketType: string; profileType: string;
  }>;
};

function one<T>(rows: readonly T[]): T {
  const value = rows[0];
  if (!value) throw new Error("Demo seed expected a database row.");
  return value;
}

async function main() {
  const config = localConfig();
  const sql = postgres(config.dbUrl);

  // ── Load seed data from deterministic JSON ──────────────────
  const _seedDir = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
  const seedPath = resolve(_seedDir, "demo_seed.json");
  let seedJson: string | null = null;
  try {
    seedJson = await readFile(seedPath, "utf8");
  } catch {
    throw new Error(`demo_seed.json not found at ${seedPath}. Run \`pnpm demo:seed\` or \`tsx scripts/generate-demo-seed.ts\` first.`);
  }
  const seed: DemoSeed = JSON.parse(seedJson);

  try {
    const knowledgeUploads: Array<{ fileId: string; sourceId: string; storageKey: string; content: string }> = [];

    // ── Organizer / Exihibitor users ──────────────────────────
    const organizerUsers: Array<{ id: string; email: string }> = [];
    for (const org of seed.organizers) {
      const u = await authUser(sql, config, org.email, org.fullName);
      organizerUsers.push(u);
    }
    const organizer = organizerUsers[0]!;

    const exhibitorUser = await authUser(
      sql, config,
      process.env.DEMO_EXHIBITOR_EMAIL ?? "exhibitor@techexpo.local",
      "Elena Park",
    );

    // ── Attendee users ────────────────────────────────────────
    const attendeeUsers: Array<{ id: string; email: string; fullName: string }> = [];
    for (const a of seed.attendees) {
      const u = await authUser(sql, config, a.email, a.fullName);
      attendeeUsers.push({ ...u, fullName: a.fullName });
    }

    // ── Create all DB records in a transaction ─────────────────
    const booths = await sql.begin(async (tx) => {
      // Organizer organization
      const organizerOrg = one(
        await tx`INSERT INTO organizations(kind,slug,name) VALUES ('organizer','techexpo-organizer','TechExpo Events') ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      );
      await tx`INSERT INTO organization_memberships(organization_id,user_id,role,status) VALUES (${organizerOrg.id},${organizer.id},'owner','active') ON CONFLICT (organization_id,user_id) DO NOTHING`;

      // Event
      const event = one(
        await tx`INSERT INTO events(organization_id,name,slug,timezone,start_at,end_at,status) VALUES (${organizerOrg.id},${seed.event.name},${seed.event.slug},${seed.event.timezone},${seed.event.startAt},${seed.event.endAt},'published') ON CONFLICT (organization_id,slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      );

      const booths: DemoBooth[] = [];

      for (const exhibitor of seed.exhibitors) {
        // Exhibitor organization
        const org = one(
          await tx`INSERT INTO organizations(kind,slug,name) VALUES ('exhibitor',${exhibitor.slug},${exhibitor.name}) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        );
        await tx`INSERT INTO organization_memberships(organization_id,user_id,role,status) VALUES (${org.id},${exhibitorUser.id},'owner','active') ON CONFLICT (organization_id,user_id) DO NOTHING`;

        const socialLinksJson = JSON.stringify(exhibitor.socialLinks);

        // Booth
        const booth = one(
          await tx`INSERT INTO event_exhibitors(organization_id,event_id,organizer_organization_id,booth_name,booth_number,description,website,contact_email,contact_phone,social_links,status,published_at) VALUES (${org.id},${event.id},${organizerOrg.id},${exhibitor.name},${exhibitor.booth},${exhibitor.description},${exhibitor.website},${`hello@${exhibitor.slug}.example.com`},${exhibitor.phone},${socialLinksJson}::jsonb,'ready',now()) ON CONFLICT (event_id,organization_id) DO UPDATE SET booth_name=EXCLUDED.booth_name,booth_number=EXCLUDED.booth_number,description=EXCLUDED.description,website=EXCLUDED.website,contact_email=EXCLUDED.contact_email,social_links=EXCLUDED.social_links,status='ready',published_at=now() RETURNING id,booth_name,booth_number`,
        );

        // ── Knowledge documents ─────────────────────────────
        for (const doc of exhibitor.knowledgeDocuments) {
          const existing = await tx`SELECT source.id AS source_id, source.file_id, file.storage_key FROM kb_sources source JOIN files file ON file.id = source.file_id WHERE source.event_exhibitor_id = ${booth.id} AND source.title = ${doc.title} LIMIT 1`;
          if (!existing.length) {
            const kbId = crypto.randomUUID();
            const orgId = org.id;
            const exhibitorUserId = exhibitorUser.id;
            const eventId = event.id;
            const boothId = booth.id;
            const organizerOrgId = organizerOrg.id;
            const storageKey = `org/${orgId}/kb_document/${kbId}/${slugify(doc.title)}.txt`;
            await tx`INSERT INTO files(id, organization_id, uploaded_by_user_id, purpose, storage_key, content_type, byte_size, status) VALUES (${kbId}, ${orgId}, ${exhibitorUserId}, 'kb_document', ${storageKey}, 'text/plain', 1, 'pending')`;
            await tx`INSERT INTO kb_sources(event_id, event_exhibitor_id, organizer_organization_id, owner_organization_id, kind, source_type, title, file_id, status) VALUES (${eventId}, ${boothId}, ${organizerOrgId}, ${orgId}, 'uploaded_document', 'faq', ${doc.title}, ${kbId}, 'processing')`;
            knowledgeUploads.push({
              fileId: kbId,
              sourceId: kbId,
              storageKey: storageKey,
              content: doc.content,
            });
          } else {
            const record = one(existing);
            knowledgeUploads.push({
              fileId: record.file_id,
              sourceId: record.source_id,
              storageKey: record.storage_key,
              content: doc.content,
            });
          }
        }

        // ── Lead form ────────────────────────────────────────
        const form = one(
          await tx`INSERT INTO lead_forms(event_exhibitor_id,name,consent_text,version,is_default,status) VALUES (${booth.id},'Connect at TechExpo','I agree to share my submitted information with this exhibitor.',1,true,'draft') ON CONFLICT (event_exhibitor_id,name,version) DO UPDATE SET is_default=true RETURNING id,status`,
        );
        const existingField = await tx`SELECT id FROM lead_form_fields WHERE lead_form_id=${form.id} AND key='email'`;
        const field = existingField.length
          ? one(existingField)
          : one(await tx`INSERT INTO lead_form_fields(lead_form_id,key,label,type,required,sort_order,validation,status) VALUES (${form.id},'email','Work email','email',true,0,'{}','active') RETURNING id`);
        if (form.status === "draft") {
          await tx`INSERT INTO lead_form_fields(lead_form_id,key,label,type,required,sort_order,validation,status) VALUES (${form.id},'consent','I agree to be contacted','consent_checkbox',true,1,'{}','active') ON CONFLICT (lead_form_id,key) DO NOTHING`;
          await tx`UPDATE lead_forms SET status='published',published_at=now() WHERE id=${form.id}`;
        }

        // ── QR credentials ───────────────────────────────────
        const publicToken = createHash("sha256")
          .update(`demo-booth:${booth.id}`)
          .digest("base64url");
        await tx`INSERT INTO booth_qr_credentials(event_exhibitor_id,public_token,active) VALUES (${booth.id},${publicToken},true) ON CONFLICT (public_token) DO UPDATE SET active=true,revoked_at=NULL`;

        const demoBooth: DemoBooth = {
          id: booth.id,
          publicToken,
          name: booth.booth_name,
          number: booth.booth_number ?? exhibitor.booth,
          organizationId: org.id,
        };

        // ── Relationships & lead submissions ─────────────────
        for (let index = 0; index < attendeeUsers.length; index++) {
          const attendee = attendeeUsers[index]!;
          const ap = seed.attendees[index]!;
          await tx`INSERT INTO attendee_profiles(user_id,company,job_title,industry) VALUES (${attendee.id},${ap.company},${ap.title},${ap.industry}) ON CONFLICT (user_id) DO NOTHING`;
          await tx`INSERT INTO attendee_profile_consents(user_id,share_profile_with_exhibitors) VALUES (${attendee.id},true) ON CONFLICT (user_id) DO UPDATE SET share_profile_with_exhibitors=true`;

          const interactionCount = (index % 3) + 1;
          const firstInteractionAt = new Date(Date.now() - (500 - index) * 60 * 1000);
          const latestInteractionAt = new Date(Date.now() - (index % 90) * 60 * 1000);
          const rel = one(
            await tx`INSERT INTO exhibitor_relationships(event_exhibitor_id,attendee_user_id,interaction_count,first_interaction_at,latest_interaction_at,has_potential_duplicate) VALUES (${booth.id},${attendee.id},${interactionCount},${firstInteractionAt},${latestInteractionAt},${index % 19 === 0}) ON CONFLICT (event_exhibitor_id,attendee_user_id) DO UPDATE SET interaction_count=EXCLUDED.interaction_count,latest_interaction_at=EXCLUDED.latest_interaction_at RETURNING id`,
          );

          const key = `demo-${booth.id}-${attendee.id}`;
          const submittedAt = new Date(Date.now() - (index % 90) * 60 * 1000);
          await tx`INSERT INTO lead_submissions(event_id,event_exhibitor_id,attendee_user_id,relationship_id,lead_form_id,idempotency_key,interaction_source,potential_duplicate,submitted_at) VALUES (${event.id},${booth.id},${attendee.id},${rel.id},${form.id},${key},'visitor_qr',${index % 19 === 0},${submittedAt}) ON CONFLICT (event_exhibitor_id,idempotency_key) DO NOTHING`;

          if (index % 20 === 0)
            await tx`INSERT INTO exhibitor_relationship_notes(relationship_id,body,created_by_user_id) SELECT ${rel.id},'Met at the booth. Follow up with a tailored product overview.',${exhibitorUser.id} WHERE NOT EXISTS (SELECT 1 FROM exhibitor_relationship_notes WHERE relationship_id=${rel.id})`;
          if (index % 10 === 0) {
            const enrichmentAt = new Date(Date.now() - (index % 60) * 60 * 1000);
            await tx`INSERT INTO relationship_enrichments(relationship_id,field_name,change_type,created_at) SELECT ${rel.id},'company','added',${enrichmentAt} WHERE NOT EXISTS (SELECT 1 FROM relationship_enrichments WHERE relationship_id=${rel.id} AND field_name='company')`;
          }
        }

        await tx`INSERT INTO exhibitor_dashboard_visits(organization_id,event_exhibitor_id,user_id,last_visited_at) VALUES (${org.id},${booth.id},${exhibitorUser.id},now()-interval '2 hours') ON CONFLICT (organization_id,event_exhibitor_id,user_id) DO UPDATE SET last_visited_at=EXCLUDED.last_visited_at`;
        demoBooth.relationshipId = one(
          await tx`SELECT id FROM exhibitor_relationships WHERE event_exhibitor_id=${booth.id} ORDER BY first_interaction_at LIMIT 1`,
        ).id;
        booths.push(demoBooth);
      }

      return booths;
    });

    // ── Upload knowledge documents to storage ─────────────────
    for (const upload of knowledgeUploads) {
      const response = await fetch(
        `${config.apiUrl}/storage/v1/object/uploads/${upload.storageKey}`,
        {
          method: "POST",
          headers: { ...authHeaders(config), "content-type": "text/plain", "x-upsert": "true" },
          body: upload.content,
        },
      );
      if (!response.ok) throw new Error(`Could not seed knowledge file: ${await response.text()}`);
      await sql`UPDATE files SET byte_size = ${Buffer.byteLength(upload.content)}, status = 'scanning', updated_at = now() WHERE id = ${upload.fileId}`;
      await sql`UPDATE kb_sources SET status = 'pending', attempt_count = 0, error_message = NULL, updated_at = now() WHERE id = ${upload.sourceId}`;
    }

    await generateDemoQrCodes(booths);
    if (config.writeLocalEnvironment) await writeLocalEnvironment(config);

    process.stdout.write(
      `Demo seed complete: ${seed.event.name}, ${seed.exhibitors.length} booths, ${seed.attendees.length} attendees, and ${seed.exhibitors.length * seed.attendees.length} relationships.\n`,
    );
  } finally {
    await sql.end();
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
}

function localConfig(): LocalConfig {
  const configuredApiUrl = process.env.API_SUPABASE_URL;
  const configuredDbUrl = process.env.API_DATABASE_URL;
  const configuredServiceRoleKey = process.env.API_SUPABASE_SERVICE_ROLE_KEY;
  const configuredAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (configuredApiUrl && configuredDbUrl && configuredServiceRoleKey && configuredAnonKey) {
    return { apiUrl: configuredApiUrl, dbUrl: configuredDbUrl, serviceRoleKey: configuredServiceRoleKey, anonKey: configuredAnonKey, writeLocalEnvironment: false };
  }

  let output: string;
  if (process.platform === "win32") {
    output = execFileSync("cmd.exe", ["/c", "npx", "supabase", "status", "-o", "env"], { encoding: "utf8" });
  } else {
    output = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
  }
  const env = Object.fromEntries(
    output.split(/\r?\n/).map((line) => line.match(/^([A-Z_]+)=(?:"([^"]*)"|(.*))$/)).filter((m): m is RegExpMatchArray => Boolean(m)).map((m) => [m[1]!, m[2] ?? m[3] ?? ""]),
  );
  const apiUrl = env.API_URL ?? env.SUPABASE_URL;
  const dbUrl = env.DB_URL;
  const serviceRoleKey = env.SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.ANON_KEY ?? env.SUPABASE_ANON_KEY;
  if (!apiUrl || !dbUrl || !serviceRoleKey || !anonKey)
    throw new Error("Start local Supabase before running the demo seed.");
  return { apiUrl, dbUrl, serviceRoleKey, anonKey, writeLocalEnvironment: true };
}

async function authUser(sql: postgres.Sql, config: LocalConfig, email: string, fullName: string) {
  const existing = (await sql<{ id: string; email: string }[]>`SELECT id, email FROM users WHERE email=${email}`)[0];
  if (existing) return existing;
  const response = await fetch(`${config.apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(config), "content-type": "application/json" },
    body: JSON.stringify({ email, email_confirm: true, user_metadata: { full_name: fullName } }),
  });
  if (!response.ok) throw new Error(`Could not create demo account ${email}: ${await response.text()}`);
  return (await response.json()) as { id: string; email: string };
}

function authHeaders(config: LocalConfig) {
  return { apikey: config.serviceRoleKey, authorization: `Bearer ${config.serviceRoleKey}` };
}

async function writeLocalEnvironment(config: LocalConfig) {
  const root = resolve(process.cwd(), "../..");
  await writeFile(resolve(root, "apps/api/.env"),
    `API_DATABASE_URL=${config.dbUrl}\nAPI_SUPABASE_URL=${config.apiUrl}\nAPI_SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}\nAPI_PUBLIC_WEB_ORIGIN=http://localhost:3000\nAPI_CORS_ORIGIN=http://localhost:3000\n`);
  await writeFile(resolve(root, "apps/web/.env.local"),
    `NEXT_PUBLIC_SUPABASE_URL=${config.apiUrl}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${config.anonKey}\nNEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001\n`);
  const workerPath = resolve(root, "apps/worker/.env");
  const currentWorker = await readFile(workerPath, "utf8").catch(() => "");
  const aiVariables = currentWorker.split(/\r?\n/).filter((line) => line.startsWith("NVIDIA_")).join("\n");
  await writeFile(workerPath,
    `WORKER_DATABASE_URL=${config.dbUrl}\nWORKER_REDIS_URL=redis://127.0.0.1:6379\nWORKER_SUPABASE_URL=${config.apiUrl}\nWORKER_SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}\nWORKER_CLAMAV_HOST=127.0.0.1\nWORKER_CLAMAV_PORT=3310\n${aiVariables}${aiVariables ? "\n" : ""}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
