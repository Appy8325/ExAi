import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

import { generateDemoQrCodes, type DemoBooth } from "./demo-qr";

type LocalConfig = {
  apiUrl: string;
  dbUrl: string;
  serviceRoleKey: string;
  anonKey: string;
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
    const organizer = await authUser(
      sql,
      config,
      "organizer@techexpo.local",
      "Olivia Grant",
    );
    const exhibitorUser = await authUser(
      sql,
      config,
      "exhibitor@techexpo.local",
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
          await tx`INSERT INTO event_exhibitors(organization_id,event_id,organizer_organization_id,booth_name,booth_number,description,status) VALUES (${org.id},${event.id},${organizerOrg.id},${name},${number},${description},'ready') ON CONFLICT (event_id,organization_id) DO UPDATE SET booth_name=EXCLUDED.booth_name,booth_number=EXCLUDED.booth_number,description=EXCLUDED.description,status='ready' RETURNING id,booth_name,booth_number`,
        );
        const form = one(
          await tx`INSERT INTO lead_forms(event_exhibitor_id,name,is_default,status) VALUES (${booth.id},'Connect at TechExpo',true,'active') ON CONFLICT (event_exhibitor_id,name) DO UPDATE SET is_default=true,status='active' RETURNING id`,
        );
        const field = one(
          await tx`INSERT INTO lead_form_fields(lead_form_id,key,label,type,required,sort_order,validation,status) VALUES (${form.id},'email','Work email','email',true,0,'{}','active') ON CONFLICT (lead_form_id,key) DO UPDATE SET status='active' RETURNING id`,
        );
        const demoBooth: DemoBooth = {
          id: booth.id,
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
    await generateDemoQrCodes(booths);
    await writeLocalEnvironment(config);
  } finally {
    await sql.end();
  }
  process.stdout.write(
    "Demo seed complete: TechExpo 2027, 5 booths, 200 attendees, and 500 relationships.\n",
  );
}

function localConfig(): LocalConfig {
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
  output = execFileSync(
    "npx",
    ["supabase", "status", "-o", "env"],
    {
      encoding: "utf8",
    },
  );
};
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
  return { apiUrl, dbUrl, serviceRoleKey, anonKey };
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
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
