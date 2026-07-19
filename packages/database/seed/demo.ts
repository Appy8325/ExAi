import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

import { generateDemoQrCodes, type DemoBooth } from "./demo-qr";

type LocalConfig = {
  apiUrl: string;
  dbUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  writeLocalEnvironment: boolean;
};

const attendeeNames = [
  "Avery Chen",
  "Jordan Patel",
  "Morgan Reyes",
  "Taylor Okafor",
  "Casey Nguyen",
  "Riley Thompson",
  "Cameron Brooks",
  "Skyler Ahmed",
];
const companies = ["OrbitWorks", "Cedar Health", "Nimble Retail", "MetroGrid"];
const titles = [
  "Director of Engineering",
  "Product Lead",
  "Operations Manager",
  "Revenue Architect",
];
const exhibitors = [
  ["Northstar Cloud", "A-101", "Cloud infrastructure that teams can trust."],
  ["Vector Labs", "A-102", "Developer tools for faster, safer releases."],
  [
    "Signal Forge",
    "A-103",
    "Real-time customer intelligence for product teams.",
  ],
  [
    "Atlas Systems",
    "A-104",
    "Modern operations software for ambitious companies.",
  ],
  ["Brightline AI", "A-105", "Practical AI workflows for revenue teams."],
] as const;

function one<T>(rows: readonly T[]): T {
  const value = rows[0];
  if (!value) throw new Error("Demo seed expected a database row.");
  return value;
}

async function main() {
  const config = localConfig();
  const sql = postgres(config.dbUrl);
  try {
    const knowledgeUploads: Array<{ fileId: string; sourceId: string; storageKey: string; content: string }> = [];
    const organizer = await authUser(
      sql,
      config,
      process.env.DEMO_ORGANIZER_EMAIL ?? "organizer@techexpo.local",
      "Olivia Grant",
    );
    const exhibitorUser = await authUser(
      sql,
      config,
      process.env.DEMO_EXHIBITOR_EMAIL ?? "exhibitor@techexpo.local",
      "Elena Park",
    );
    const attendees = [] as Array<{ id: string; email: string }>;
    for (let index = 0; index < 200; index += 1) {
      const email = `attendee-${index + 1}@techexpo.local`;
      const fullName = `${attendeeNames[index % attendeeNames.length]!} ${String(Math.floor(index / attendeeNames.length) + 1).padStart(2, "0")}`;
      attendees.push(await authUser(sql, config, email, fullName));
    }
    const booths = await sql.begin(async (tx) => {
      const organizerOrg = one(
        await tx`INSERT INTO organizations(kind,slug,name) VALUES ('organizer','techexpo-organizer','TechExpo Events') ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      );
      await tx`INSERT INTO organization_memberships(organization_id,user_id,role,status) VALUES (${organizerOrg.id},${organizer.id},'owner','active') ON CONFLICT (organization_id,user_id) DO NOTHING`;
      const event = one(
        await tx`INSERT INTO events(organization_id,name,slug,timezone,start_at,end_at,status) VALUES (${organizerOrg.id},'TechExpo 2027','techexpo-2027','America/Los_Angeles','2027-05-12T16:00:00Z','2027-05-15T01:00:00Z','published') ON CONFLICT (organization_id,slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      );
      const booths: DemoBooth[] = [];
      for (const [name, number, description] of exhibitors) {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-$/, "");
        const org = one(
          await tx`INSERT INTO organizations(kind,slug,name) VALUES ('exhibitor',${slug},${name}) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        );
        await tx`INSERT INTO organization_memberships(organization_id,user_id,role,status) VALUES (${org.id},${exhibitorUser.id},'owner','active') ON CONFLICT (organization_id,user_id) DO NOTHING`;
        const booth = one(
          await tx`INSERT INTO event_exhibitors(organization_id,event_id,organizer_organization_id,booth_name,booth_number,description,website,contact_email,status,published_at) VALUES (${org.id},${event.id},${organizerOrg.id},${name},${number},${description},${`https://${slug}.example.com`},${`hello@${slug}.example.com`},'ready',now()) ON CONFLICT (event_id,organization_id) DO UPDATE SET booth_name=EXCLUDED.booth_name,booth_number=EXCLUDED.booth_number,description=EXCLUDED.description,website=EXCLUDED.website,contact_email=EXCLUDED.contact_email,status='ready',published_at=now() RETURNING id,booth_name,booth_number`,
        );
        const knowledgeTitle = `${name} company knowledge`;
        const knowledge = one(await tx`
          SELECT source.id AS source_id, source.file_id, file.storage_key
          FROM kb_sources source JOIN files file ON file.id = source.file_id
          WHERE source.event_exhibitor_id = ${booth.id} AND source.title = ${knowledgeTitle}
          LIMIT 1
        `.then((rows) => rows.length ? rows : tx`
          WITH generated AS (SELECT concourse.uuid_generate_v7() AS id),
          inserted_file AS (
            INSERT INTO files(id, organization_id, uploaded_by_user_id, purpose, storage_key,
              content_type, byte_size, status)
            SELECT id, ${org.id}, ${exhibitorUser.id}, 'kb_document',
              ${`org/${org.id}/kb_document/`} || id || '/company-knowledge.txt',
              'text/plain', 1, 'pending' FROM generated RETURNING id, storage_key
          )
          INSERT INTO kb_sources(event_id, event_exhibitor_id, organizer_organization_id,
            owner_organization_id, kind, source_type, title, file_id, status)
          SELECT ${event.id}, ${booth.id}, ${organizerOrg.id}, ${org.id}, 'uploaded_document',
            'faq', ${knowledgeTitle}, id, 'processing' FROM inserted_file
          RETURNING id AS source_id, file_id,
            (SELECT storage_key FROM inserted_file) AS storage_key
        `));
        const knowledgeContent = `${name}\nBooth ${number}\n${description}\n\nProducts and services are available for enterprise teams. Contact ${`hello@${slug}.example.com`} for pricing and implementation guidance. Booth staff answer product, security, integration, and deployment questions throughout TechExpo 2027.`;
        knowledgeUploads.push({
          fileId: knowledge.file_id,
          sourceId: knowledge.source_id,
          storageKey: knowledge.storage_key,
          content: knowledgeContent,
        });
        const form = one(
          await tx`INSERT INTO lead_forms(event_exhibitor_id,name,consent_text,version,is_default,status) VALUES (${booth.id},'Connect at TechExpo','I agree to share my submitted information with this exhibitor.',1,true,'draft') ON CONFLICT (event_exhibitor_id,name,version) DO UPDATE SET is_default=true RETURNING id,status`,
        );
        const existingField =
          await tx`SELECT id FROM lead_form_fields WHERE lead_form_id=${form.id} AND key='email'`;
        const field = existingField.length
          ? one(existingField)
          : one(
              await tx`INSERT INTO lead_form_fields(lead_form_id,key,label,type,required,sort_order,validation,status) VALUES (${form.id},'email','Work email','email',true,0,'{}','active') RETURNING id`,
            );
        if (form.status === "draft") {
          await tx`INSERT INTO lead_form_fields(lead_form_id,key,label,type,required,sort_order,validation,status) VALUES (${form.id},'consent','I agree to be contacted','consent_checkbox',true,1,'{}','active') ON CONFLICT (lead_form_id,key) DO NOTHING`;
          await tx`UPDATE lead_forms SET status='published',published_at=now() WHERE id=${form.id}`;
        }
        const publicToken = createHash("sha256")
          .update(`demo-booth:${booth.id}`)
          .digest("base64url");
        await tx`INSERT INTO booth_qr_credentials(event_exhibitor_id,public_token,active) VALUES (${booth.id},${publicToken},true) ON CONFLICT (public_token) DO UPDATE SET active=true,revoked_at=NULL`;
        const demoBooth: DemoBooth = {
          id: booth.id,
          publicToken,
          name: booth.booth_name,
          number: booth.booth_number ?? number,
          organizationId: org.id,
        };
        booths.push(demoBooth);
        for (let index = 0; index < 100; index += 1) {
          const attendeeIndex =
            booths.length === 1 ? index : index + (booths.length - 1) * 100;
          const email = `attendee-${(attendeeIndex % 200) + 1}@techexpo.local`;
          const attendee = attendees[attendeeIndex % attendees.length]!;
          await tx`INSERT INTO attendee_profiles(user_id,company,job_title,industry) VALUES (${attendee.id},${companies[attendeeIndex % companies.length]!},${titles[attendeeIndex % titles.length]!},'Technology') ON CONFLICT (user_id) DO NOTHING`;
          await tx`INSERT INTO attendee_profile_consents(user_id,share_profile_with_exhibitors) VALUES (${attendee.id},true) ON CONFLICT (user_id) DO UPDATE SET share_profile_with_exhibitors=true`;
          const relationship = one(
            await tx`INSERT INTO exhibitor_relationships(event_exhibitor_id,attendee_user_id,interaction_count,first_interaction_at,latest_interaction_at,has_potential_duplicate) VALUES (${booth.id},${attendee.id},${(index % 3) + 1},now() - ${500 - attendeeIndex} * interval '1 minute',now() - ${attendeeIndex % 90} * interval '1 minute',${index % 19 === 0}) ON CONFLICT (event_exhibitor_id,attendee_user_id) DO UPDATE SET interaction_count=EXCLUDED.interaction_count,latest_interaction_at=EXCLUDED.latest_interaction_at RETURNING id`,
          );
          const key = `demo-${booth.id}-${attendee.id}`;
          const created =
            await tx`INSERT INTO lead_submissions(event_id,event_exhibitor_id,attendee_user_id,relationship_id,lead_form_id,idempotency_key,interaction_source,potential_duplicate,submitted_at) VALUES (${event.id},${booth.id},${attendee.id},${relationship.id},${form.id},${key},'visitor_qr',${index % 19 === 0},now() - ${attendeeIndex % 90} * interval '1 minute') ON CONFLICT (event_exhibitor_id,idempotency_key) DO NOTHING RETURNING id`;
          const submission = one(
            created.length > 0
              ? created
              : await tx`SELECT id FROM lead_submissions WHERE event_exhibitor_id=${booth.id} AND idempotency_key=${key}`,
          );
          await tx`INSERT INTO lead_submission_values(lead_submission_id,lead_form_field_id,value,field_snapshot) VALUES (${submission.id},${field.id},${JSON.stringify(email)}::jsonb,${JSON.stringify({ key: "email", label: "Work email", type: "email" })}::jsonb) ON CONFLICT (lead_submission_id,lead_form_field_id) DO NOTHING`;
          if (index % 20 === 0)
            await tx`INSERT INTO exhibitor_relationship_notes(relationship_id,body,created_by_user_id) SELECT ${relationship.id},'Met at the booth. Follow up with a tailored product overview.',${exhibitorUser.id} WHERE NOT EXISTS (SELECT 1 FROM exhibitor_relationship_notes WHERE relationship_id=${relationship.id} AND body='Met at the booth. Follow up with a tailored product overview.')`;
          if (index % 10 === 0)
            await tx`INSERT INTO relationship_enrichments(relationship_id,field_name,change_type,created_at) SELECT ${relationship.id},'company','added',now() - ${attendeeIndex % 60} * interval '1 minute' WHERE NOT EXISTS (SELECT 1 FROM relationship_enrichments WHERE relationship_id=${relationship.id} AND field_name='company')`;
        }
        await tx`INSERT INTO exhibitor_dashboard_visits(organization_id,event_exhibitor_id,user_id,last_visited_at) VALUES (${org.id},${booth.id},${exhibitorUser.id},now()-interval '2 hours') ON CONFLICT (organization_id,event_exhibitor_id,user_id) DO UPDATE SET last_visited_at=EXCLUDED.last_visited_at`;
        demoBooth.relationshipId = one(
          await tx`SELECT id FROM exhibitor_relationships WHERE event_exhibitor_id=${booth.id} ORDER BY first_interaction_at LIMIT 1`,
        ).id;
      }
      return booths;
    });
    for (const upload of knowledgeUploads) {
      const response = await fetch(
        `${config.apiUrl}/storage/v1/object/uploads/${upload.storageKey}`,
        {
          method: "POST",
          headers: {
            ...authHeaders(config),
            "content-type": "text/plain",
            "x-upsert": "true",
          },
          body: upload.content,
        },
      );
      if (!response.ok)
        throw new Error(`Could not seed knowledge file: ${await response.text()}`);
      await sql`UPDATE files SET byte_size = ${Buffer.byteLength(upload.content)}, status = 'scanning', updated_at = now() WHERE id = ${upload.fileId}`;
      await sql`UPDATE kb_sources SET status = 'pending', attempt_count = 0, error_message = NULL, updated_at = now() WHERE id = ${upload.sourceId}`;
    }
    await generateDemoQrCodes(booths);
    if (config.writeLocalEnvironment) await writeLocalEnvironment(config);
  } finally {
    await sql.end();
  }
  process.stdout.write(
    "Demo seed complete: TechExpo 2027, 5 booths, 200 attendees, and 500 relationships.\n",
  );
}

function localConfig(): LocalConfig {
  const configuredApiUrl = process.env.API_SUPABASE_URL;
  const configuredDbUrl = process.env.API_DATABASE_URL;
  const configuredServiceRoleKey = process.env.API_SUPABASE_SERVICE_ROLE_KEY;
  const configuredAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (
    configuredApiUrl &&
    configuredDbUrl &&
    configuredServiceRoleKey &&
    configuredAnonKey
  ) {
    return {
      apiUrl: configuredApiUrl,
      dbUrl: configuredDbUrl,
      serviceRoleKey: configuredServiceRoleKey,
      anonKey: configuredAnonKey,
      writeLocalEnvironment: false,
    };
  }

  let output: string;

  if (process.platform === "win32") {
    output = execFileSync(
      "cmd.exe",
      ["/c", "npx", "supabase", "status", "-o", "env"],
      {
        encoding: "utf8",
      },
    );
  } else {
    output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
    });
  }
  const env = Object.fromEntries(
    output
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)=(?:"([^"]*)"|(.*))$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1]!, match[2] ?? match[3] ?? ""]),
  );
  const apiUrl = env.API_URL ?? env.SUPABASE_URL;
  const dbUrl = env.DB_URL;
  const serviceRoleKey = env.SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.ANON_KEY ?? env.SUPABASE_ANON_KEY;
  if (!apiUrl || !dbUrl || !serviceRoleKey || !anonKey)
    throw new Error("Start local Supabase before running the demo seed.");
  return {
    apiUrl,
    dbUrl,
    serviceRoleKey,
    anonKey,
    writeLocalEnvironment: true,
  };
}

async function authUser(
  sql: postgres.Sql,
  config: LocalConfig,
  email: string,
  fullName: string,
) {
  const existing = (
    await sql<
      { id: string; email: string }[]
    >`SELECT id, email FROM users WHERE email=${email}`
  )[0];
  if (existing) return existing;
  const response = await fetch(`${config.apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(config), "content-type": "application/json" },
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  if (!response.ok)
    throw new Error(
      `Could not create demo account ${email}: ${await response.text()}`,
    );
  return (await response.json()) as { id: string; email: string };
}

function authHeaders(config: LocalConfig) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
  };
}

async function writeLocalEnvironment(config: LocalConfig) {
  const root = resolve(process.cwd(), "../..");
  await writeFile(
    resolve(root, "apps/api/.env"),
    `API_DATABASE_URL=${config.dbUrl}\nAPI_SUPABASE_URL=${config.apiUrl}\nAPI_SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}\nAPI_PUBLIC_WEB_ORIGIN=http://localhost:3000\nAPI_CORS_ORIGIN=http://localhost:3000\n`,
  );
  await writeFile(
    resolve(root, "apps/web/.env.local"),
    `NEXT_PUBLIC_SUPABASE_URL=${config.apiUrl}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${config.anonKey}\nNEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001\n`,
  );
  const workerPath = resolve(root, "apps/worker/.env");
  const currentWorker = await readFile(workerPath, "utf8").catch(() => "");
  const aiVariables = currentWorker
    .split(/\r?\n/)
    .filter((line) => line.startsWith("NVIDIA_"))
    .join("\n");
  await writeFile(
    workerPath,
    `WORKER_DATABASE_URL=${config.dbUrl}\nWORKER_REDIS_URL=redis://127.0.0.1:6379\nWORKER_SUPABASE_URL=${config.apiUrl}\nWORKER_SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}\nWORKER_CLAMAV_HOST=127.0.0.1\nWORKER_CLAMAV_PORT=3310\n${aiVariables}${aiVariables ? "\n" : ""}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
