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
const industries = ["Technology", "Healthcare", "Retail", "Infrastructure"];
const titles = [
  "Director of Engineering",
  "Product Lead",
  "Operations Manager",
  "Revenue Architect",
];

type ExhibitorSeed = {
  name: string;
  booth: string;
  tagline: string;
  industry: string;
  description: string;
  products: string[];
  brochureUrl: string;
  phone: string;
  socialLinks: Record<string, string>;
};

const exhibitors: ExhibitorSeed[] = [
  {
    name: "Microsoft",
    booth: "A-101",
    tagline: "Empowering every person and every organization on the planet to achieve more.",
    industry: "Technology",
    description: "Microsoft is a multinational technology company that develops, licenses, and supports software, services, devices, and solutions. Its products include Microsoft 365, Azure cloud services, Dynamics 365, LinkedIn, GitHub, and the Microsoft Copilot AI assistant. Microsoft is headquartered in Redmond, Washington.",
    products: ["Microsoft 365", "Microsoft Azure", "Microsoft Copilot", "Microsoft Teams", "GitHub Copilot", "Dynamics 365", "LinkedIn", "Windows 11", "Visual Studio"],
    brochureUrl: "https://www.microsoft.com/en-us/microsoft-365",
    phone: "+1-800-642-7676",
    socialLinks: { linkedin: "https://linkedin.com/company/microsoft", twitter: "https://twitter.com/Microsoft", website: "https://www.microsoft.com" },
  },
  {
    name: "Apple",
    booth: "A-102",
    tagline: "Think different.",
    industry: "Technology",
    description: "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. Its product lineup includes iPhone, Mac, iPad, Apple Watch, AirPods, Apple Vision Pro, and services such as Apple Music, iCloud, the App Store, and Apple Pay. Apple is headquartered in Cupertino, California.",
    products: ["iPhone", "Mac", "iPad", "Apple Watch", "Apple Vision Pro", "AirPods", "Apple Music", "iCloud", "App Store", "Apple Pay"],
    brochureUrl: "https://www.apple.com",
    phone: "+1-800-275-2273",
    socialLinks: { linkedin: "https://linkedin.com/company/apple", twitter: "https://twitter.com/Apple", website: "https://www.apple.com" },
  },
  {
    name: "Google",
    booth: "A-103",
    tagline: "Organize the world's information and make it universally accessible and useful.",
    industry: "Technology",
    description: "Google is a multinational technology company specializing in internet-related services and products. Its offerings include Google Search, Google Cloud Platform, Android, YouTube, Google Workspace, Google Maps, Google Gemini AI, and Google Pixel hardware. Google is headquartered in Mountain View, California and is a subsidiary of Alphabet Inc.",
    products: ["Google Cloud Platform", "Google Workspace", "Android", "YouTube", "Google Search", "Google Maps", "Google Gemini", "Google Pixel", "Chrome", "TensorFlow"],
    brochureUrl: "https://cloud.google.com",
    phone: "+1-650-253-0000",
    socialLinks: { linkedin: "https://linkedin.com/company/google", twitter: "https://twitter.com/Google", website: "https://www.google.com" },
  },
  {
    name: "NVIDIA",
    booth: "A-104",
    tagline: "The world leader in accelerated computing.",
    industry: "Semiconductors & AI",
    description: "NVIDIA is a multinational technology company that designs graphics processing units (GPUs) for gaming, professional visualization, data centers, and automotive markets. Its CUDA platform enables parallel computing and its AI platforms include DGX systems, NVIDIA AI Enterprise, Omniverse, and the DRIVE platform for autonomous vehicles. NVIDIA is headquartered in Santa Clara, California.",
    products: ["GeForce GPUs", "CUDA", "NVIDIA AI Enterprise", "DGX Systems", "NVIDIA Omniverse", "NVIDIA DRIVE", "NVIDIA Clara", "NVIDIA Jetson", "NVIDIA Spectrum"],
    brochureUrl: "https://www.nvidia.com/en-us/data-center/",
    phone: "+1-408-486-2000",
    socialLinks: { linkedin: "https://linkedin.com/company/nvidia", twitter: "https://twitter.com/nvidia", website: "https://www.nvidia.com" },
  },
  {
    name: "Cisco",
    booth: "B-101",
    tagline: "Powering an inclusive future by connecting everything, innovating everywhere.",
    industry: "Networking & Security",
    description: "Cisco is a multinational technology conglomerate that develops, manufactures, and sells networking hardware, software, telecommunications equipment, and cybersecurity solutions. Its product portfolio includes Cisco Catalyst and Nexus switching, Cisco ISR/ASR routing, Cisco Secure Firewall and Duo Security, Cisco Meraki cloud-managed IT, Webex collaboration, AppDynamics observability, and ThousandEyes internet monitoring. Cisco is headquartered in San Jose, California.",
    products: ["Cisco Catalyst Switches", "Cisco Secure Firewall", "Cisco Meraki", "Webex", "Cisco AppDynamics", "Cisco ThousandEyes", "Cisco ISR Routers", "Cisco DNA Center", "Cisco Duo Security"],
    brochureUrl: "https://www.cisco.com",
    phone: "+1-800-553-6387",
    socialLinks: { linkedin: "https://linkedin.com/company/cisco", twitter: "https://twitter.com/Cisco", website: "https://www.cisco.com" },
  },
  {
    name: "IBM",
    booth: "B-102",
    tagline: "Be essential.",
    industry: "Technology & Consulting",
    description: "IBM is a multinational technology and consulting company providing hybrid cloud, AI, and consulting services. Its products include IBM watsonx AI platform, IBM Cloud, Red Hat OpenShift, IBM Qiskit for quantum computing, IBM SPSS for statistical analysis, and IBM Granite open-source AI models. IBM is headquartered in Armonk, New York and operates in over 175 countries.",
    products: ["IBM watsonx", "IBM Cloud", "Red Hat OpenShift", "IBM Qiskit", "IBM SPSS", "IBM Granite", "IBM Consulting", "IBM Security", "IBM Maximo"],
    brochureUrl: "https://www.ibm.com/watsonx",
    phone: "+1-800-426-4968",
    socialLinks: { linkedin: "https://linkedin.com/company/ibm", twitter: "https://twitter.com/IBM", website: "https://www.ibm.com" },
  },
  {
    name: "Intel",
    booth: "B-103",
    tagline: "Creating world-changing technology that enriches the lives of every person on earth.",
    industry: "Semiconductors",
    description: "Intel is a multinational technology company that designs and manufactures central processing units (CPUs), graphics processing units (GPUs), field-programmable gate arrays (FPGAs), and other semiconductor products. Its product lines include Intel Core processors for consumer devices, Intel Xeon for data centers, Intel Arc GPUs, Intel vPro for business, and Gaudi AI accelerators. Intel is headquartered in Santa Clara, California.",
    products: ["Intel Core Processors", "Intel Xeon Processors", "Intel Arc GPUs", "Intel Iris Xe Graphics", "Intel vPro", "Intel Gaudi AI Accelerators", "Intel FPGAs", "Intel Optane Memory", "Intel Ethernet Adapters"],
    brochureUrl: "https://www.intel.com",
    phone: "+1-408-765-8080",
    socialLinks: { linkedin: "https://linkedin.com/company/intel", twitter: "https://twitter.com/Intel", website: "https://www.intel.com" },
  },
  {
    name: "Salesforce",
    booth: "C-101",
    tagline: "The world's #1 AI CRM.",
    industry: "Enterprise Software",
    description: "Salesforce is a cloud-based software company that provides customer relationship management (CRM) solutions and enterprise applications. Its platform includes Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, Tableau for analytics, MuleSoft for integration, Slack for collaboration, and Einstein AI. Salesforce is headquartered in San Francisco, California.",
    products: ["Sales Cloud", "Service Cloud", "Marketing Cloud", "Einstein AI", "Tableau", "MuleSoft", "Slack", "Commerce Cloud", "Data Cloud"],
    brochureUrl: "https://www.salesforce.com/products/",
    phone: "+1-800-667-6389",
    socialLinks: { linkedin: "https://linkedin.com/company/salesforce", twitter: "https://twitter.com/salesforce", website: "https://www.salesforce.com" },
  },
  {
    name: "Adobe",
    booth: "C-102",
    tagline: "Creativity for all.",
    industry: "Software",
    description: "Adobe is a multinational software company known for its creative, marketing, and document management solutions. Products include Photoshop, Illustrator, Premiere Pro, After Effects, Acrobat, Adobe Express, Adobe Firefly generative AI, and the Adobe Experience Cloud for digital marketing. Adobe is headquartered in San Jose, California.",
    products: ["Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro", "Adobe Acrobat", "Adobe Firefly", "Adobe Express", "Adobe Experience Cloud", "Adobe Stock", "Adobe Fonts"],
    brochureUrl: "https://www.adobe.com/creativecloud.html",
    phone: "+1-800-833-6687",
    socialLinks: { linkedin: "https://linkedin.com/company/adobe", twitter: "https://twitter.com/Adobe", website: "https://www.adobe.com" },
  },
  {
    name: "Siemens",
    booth: "D-101",
    tagline: "Technology for life. Transforming the everyday through sustainable infrastructure and industry.",
    industry: "Industrial Technology",
    description: "Siemens is a multinational technology conglomerate focused on industry, infrastructure, transport, and healthcare. Its business areas include Digital Industries (industrial automation and software), Smart Infrastructure (building automation and energy management), and Siemens Mobility (rail and road transport). Key products include the Siemens Xcelerator digital platform, SIMATIC automation systems, NX software, and Teamcenter PLM. Siemens is headquartered in Munich, Germany.",
    products: ["Siemens Xcelerator", "SIMATIC Automation", "NX Software", "Teamcenter", "Siemens Industrial Edge", "SICAM", "Desigo CC", "Siemens Mobility", "Siemens Healthineers"],
    brochureUrl: "https://www.siemens.com",
    phone: "+49 69 797-0",
    socialLinks: { linkedin: "https://linkedin.com/company/siemens", twitter: "https://twitter.com/Siemens", website: "https://www.siemens.com" },
  },
];

const COMPANY_KNOWLEDGE: Record<string, {
  overview: string;
  products: string;
  support: string;
}> = {
  Microsoft: {
    overview: `Microsoft (NASDAQ: MSFT) empowers every person and organization on the planet to achieve more. The company develops, licenses, and supports software, services, devices, and solutions including Microsoft 365, Azure cloud platform, Dynamics 365, LinkedIn, GitHub, and the Microsoft Copilot AI assistant. Headquarters: Redmond, Washington.`,
    products: `Flagship products: Microsoft 365 (productivity cloud), Microsoft Azure (cloud computing platform), Microsoft Copilot (AI assistant across Microsoft 365, Windows, GitHub), Microsoft Teams (collaboration platform), GitHub Copilot (AI-powered developer tool), Dynamics 365 (business applications), LinkedIn (professional network), Windows 11 (operating system), Visual Studio (IDE).`,
    support: `Official website: https://www.microsoft.com\nSupport: https://support.microsoft.com\nDocumentation: https://learn.microsoft.com\nAzure status: https://status.azure.com\nMicrosoft 365 status: https://status.office365.com`
  },
  Apple: {
    overview: `Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. Product lineup includes iPhone, Mac, iPad, Apple Watch, Apple Vision Pro, AirPods, and services such as Apple Music, iCloud, the App Store, and Apple Pay. Headquarters: Cupertino, California.`,
    products: `Flagship products: iPhone (smartphone), Mac (personal computers with Apple Silicon), iPad (tablet), Apple Watch (wearable), Apple Vision Pro (spatial computer), AirPods (wireless audio), Apple Music (streaming), iCloud (cloud storage), App Store (app marketplace), Apple Pay (payments).`,
    support: `Official website: https://www.apple.com\nSupport: https://support.apple.com\nDeveloper documentation: https://developer.apple.com/documentation\nSystem status: https://www.apple.com/support/systemstatus/`
  },
  Google: {
    overview: `Google (Alphabet Inc., NASDAQ: GOOGL) specializes in internet-related services and products including Google Search, Google Cloud Platform, Android, YouTube, Google Workspace, Google Maps, Google Gemini AI, and Google Pixel hardware. Headquarters: Mountain View, California.`,
    products: `Flagship products: Google Cloud Platform (cloud infrastructure), Google Workspace (productivity suite), Android (mobile OS), YouTube (video platform), Google Search (search engine), Google Maps (mapping), Google Gemini (AI models), Google Pixel (smartphones), Chrome (browser), TensorFlow (ML framework).`,
    support: `Official website: https://www.google.com\nCloud documentation: https://cloud.google.com/docs\nWorkspace help: https://support.google.com/workspace\nAI documentation: https://ai.google.dev\nCloud status: https://status.cloud.google.com`
  },
  NVIDIA: {
    overview: `NVIDIA (NASDAQ: NVDA) designs GPUs for gaming, professional visualization, data centers, and automotive markets. The CUDA platform enables parallel computing. AI platforms include DGX systems, NVIDIA AI Enterprise, Omniverse, and DRIVE for autonomous vehicles. Headquarters: Santa Clara, California.`,
    products: `Flagship products: GeForce GPUs (gaming graphics), CUDA (parallel computing platform), NVIDIA AI Enterprise (AI software suite), DGX Systems (AI supercomputers), NVIDIA Omniverse (3D collaboration), NVIDIA DRIVE (autonomous vehicle platform), NVIDIA Clara (healthcare AI), NVIDIA Jetson (edge AI), NVIDIA Spectrum (networking).`,
    support: `Official website: https://www.nvidia.com\nDeveloper zone: https://developer.nvidia.com\nDocumentation: https://docs.nvidia.com\nSupport: https://www.nvidia.com/en-us/support/`
  },
  Cisco: {
    overview: `Cisco (NASDAQ: CSCO) develops, manufactures, and sells networking hardware, software, telecommunications equipment, and cybersecurity solutions. Portfolio includes Catalyst/Nexus switching, ISR/ASR routing, Secure Firewall, Duo Security, Meraki cloud-managed IT, Webex collaboration, AppDynamics observability, and ThousandEyes internet monitoring. Headquarters: San Jose, California.`,
    products: `Flagship products: Cisco Catalyst Switches (campus switching), Cisco Secure Firewall (network security), Cisco Meraki (cloud-managed IT), Webex (collaboration), Cisco AppDynamics (observability), Cisco ThousandEyes (internet monitoring), Cisco ISR Routers (routing), Cisco DNA Center (network management), Cisco Duo Security (zero trust).`,
    support: `Official website: https://www.cisco.com\nDocumentation: https://www.cisco.com/c/en/us/support/docs.html\nSupport: https://www.cisco.com/c/en/us/support/index.html\nSecurity advisories: https://sec.cloudapps.cisco.com/security/center/`
  },
  IBM: {
    overview: `IBM (NYSE: IBM) provides hybrid cloud, AI, and consulting services. Products include watsonx AI platform, IBM Cloud, Red Hat OpenShift, Qiskit for quantum computing, SPSS for statistical analysis, and Granite open-source AI models. Headquarters: Armonk, New York. Operations in 175+ countries.`,
    products: `Flagship products: IBM watsonx (AI and data platform), IBM Cloud (hybrid cloud), Red Hat OpenShift (Kubernetes platform), IBM Qiskit (quantum SDK), IBM SPSS (analytics), IBM Granite (open-source foundation models), IBM Consulting (professional services), IBM Security (cybersecurity), IBM Maximo (asset management).`,
    support: `Official website: https://www.ibm.com\nDocumentation: https://www.ibm.com/docs\nCloud status: https://cloud.ibm.com/status\nSupport: https://www.ibm.com/support`
  },
  Intel: {
    overview: `Intel (NASDAQ: INTC) designs and manufactures CPUs, GPUs, FPGAs, and other semiconductor products. Product lines include Core processors for consumer devices, Xeon for data centers, Arc GPUs, vPro for business, and Gaudi AI accelerators. Headquarters: Santa Clara, California.`,
    products: `Flagship products: Intel Core Processors (consumer CPUs), Intel Xeon Processors (data center CPUs), Intel Arc GPUs (discrete graphics), Intel Iris Xe Graphics (integrated graphics), Intel vPro (business platform), Intel Gaudi AI Accelerators (AI training/inference), Intel FPGAs (programmable logic), Intel Optane Memory (storage), Intel Ethernet Adapters (networking).`,
    support: `Official website: https://www.intel.com\nDocumentation: https://www.intel.com/content/www/us/en/developer/tools/documentation.html\nSupport: https://www.intel.com/content/www/us/en/support.html\nARK specs: https://ark.intel.com`
  },
  Salesforce: {
    overview: `Salesforce (NYSE: CRM) provides cloud-based CRM solutions and enterprise applications. Platform includes Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, Tableau analytics, MuleSoft integration, Slack collaboration, and Einstein AI. Headquarters: San Francisco, California.`,
    products: `Flagship products: Sales Cloud (sales automation), Service Cloud (customer service), Marketing Cloud (digital marketing), Einstein AI (AI for CRM), Tableau (analytics), MuleSoft (integration), Slack (collaboration), Commerce Cloud (e-commerce), Data Cloud (customer data platform).`,
    support: `Official website: https://www.salesforce.com\nHelp & training: https://help.salesforce.com\nDeveloper docs: https://developer.salesforce.com/docs\nTrust status: https://trust.salesforce.com`
  },
  Adobe: {
    overview: `Adobe (NASDAQ: ADBE) provides creative, marketing, and document management solutions. Products include Photoshop, Illustrator, Premiere Pro, After Effects, Acrobat, Adobe Express, Adobe Firefly generative AI, and Adobe Experience Cloud for digital marketing. Headquarters: San Jose, California.`,
    products: `Flagship products: Adobe Photoshop (image editing), Adobe Illustrator (vector graphics), Adobe Premiere Pro (video editing), Adobe Acrobat (PDF), Adobe Firefly (generative AI), Adobe Express (content creation), Adobe Experience Cloud (digital experience platform), Adobe Stock (creative assets), Adobe Fonts (typography).`,
    support: `Official website: https://www.adobe.com\nHelp center: https://helpx.adobe.com\nDeveloper docs: https://developer.adobe.com\nSystem status: https://status.adobe.com`
  },
  Siemens: {
    overview: `Siemens (ETR: SIE) focuses on industry, infrastructure, transport, and healthcare. Business areas: Digital Industries (automation/software), Smart Infrastructure (building automation/energy), Siemens Mobility (rail/road transport). Key platforms: Siemens Xcelerator digital platform, SIMATIC automation, NX software, Teamcenter PLM. Headquarters: Munich, Germany.`,
    products: `Flagship products: Siemens Xcelerator (digital business platform), SIMATIC Automation (industrial controllers), NX Software (CAD/CAM/CAE), Teamcenter (PLM), Siemens Industrial Edge (edge computing), SICAM (grid automation), Desigo CC (building management), Siemens Mobility (rail/road transport), Siemens Healthineers (medical technology).`,
    support: `Official website: https://www.siemens.com\nSupport: https://support.industry.siemens.com\nDocumentation: https://www.siemens.com/global/en/products/services/industry-support.html`
  },
};

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
      for (const exhibitor of exhibitors) {
        const { name, booth: number, tagline, industry, description, products, brochureUrl, phone, socialLinks } = exhibitor;
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-$/, "");
        const org = one(
          await tx`INSERT INTO organizations(kind,slug,name) VALUES ('exhibitor',${slug},${name}) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        );
        await tx`INSERT INTO organization_memberships(organization_id,user_id,role,status) VALUES (${org.id},${exhibitorUser.id},'owner','active') ON CONFLICT (organization_id,user_id) DO NOTHING`;
        const socialLinksJson = JSON.stringify(socialLinks);
        const booth = one(
          await tx`INSERT INTO event_exhibitors(organization_id,event_id,organizer_organization_id,booth_name,booth_number,description,website,contact_email,contact_phone,social_links,status,published_at) VALUES (${org.id},${event.id},${organizerOrg.id},${name},${number},${description},${`https://${slug}.example.com`},${`hello@${slug}.example.com`},${phone},${socialLinksJson}::jsonb,'ready',now()) ON CONFLICT (event_id,organization_id) DO UPDATE SET booth_name=EXCLUDED.booth_name,booth_number=EXCLUDED.booth_number,description=EXCLUDED.description,website=EXCLUDED.website,contact_email=EXCLUDED.contact_email,contact_phone=EXCLUDED.contact_phone,social_links=EXCLUDED.social_links,status='ready',published_at=now() RETURNING id,booth_name,booth_number`,
        );

        const overviewTitle = `${name} company overview`;
        const overview = one(await tx`
          SELECT source.id AS source_id, source.file_id, file.storage_key
          FROM kb_sources source JOIN files file ON file.id = source.file_id
          WHERE source.event_exhibitor_id = ${booth.id} AND source.title = ${overviewTitle}
          LIMIT 1
        `.then((rows) => rows.length ? rows : tx`
          WITH generated AS (SELECT concourse.uuid_generate_v7() AS id),
          inserted_file AS (
            INSERT INTO files(id, organization_id, uploaded_by_user_id, purpose, storage_key,
              content_type, byte_size, status)
            SELECT id, ${org.id}, ${exhibitorUser.id}, 'kb_document',
              ${`org/${org.id}/kb_document/`} || id || '/company-overview.txt',
              'text/plain', 1, 'pending' FROM generated RETURNING id, storage_key
          )
          INSERT INTO kb_sources(event_id, event_exhibitor_id, organizer_organization_id,
            owner_organization_id, kind, source_type, title, file_id, status)
          SELECT ${event.id}, ${booth.id}, ${organizerOrg.id}, ${org.id}, 'uploaded_document',
            'faq', ${overviewTitle}, id, 'processing' FROM inserted_file
          RETURNING id AS source_id, file_id,
            (SELECT storage_key FROM inserted_file) AS storage_key
        `));
const overviewContent = (() => {
          const k = COMPANY_KNOWLEDGE[name];
          if (!k) {
            return `Company: ${name}
Industry: ${industry}
Booth: ${number}
Tagline: ${tagline}

About: ${description}

Products:
${products.map((p) => `- ${p}`).join("\n")}

Official website: ${brochureUrl}

Contact: ${phone}`;
          }
          return `${name} Company Overview

Industry: ${industry}
Booth: ${number}

${k.overview}

Products:
${products.map((p) => `- ${p}`).join("\n")}

${k.products}

Official website: ${brochureUrl}
Contact: ${phone}

Source: ${brochureUrl}`;
        })();
        knowledgeUploads.push({
          fileId: overview.file_id,
          sourceId: overview.source_id,
          storageKey: overview.storage_key,
          content: overviewContent,
        });

        const faqTitle = `${name} FAQ & integrations`;
        const faq = one(await tx`
          SELECT source.id AS source_id, source.file_id, file.storage_key
          FROM kb_sources source JOIN files file ON file.id = source.file_id
          WHERE source.event_exhibitor_id = ${booth.id} AND source.title = ${faqTitle}
          LIMIT 1
        `.then((rows) => rows.length ? rows : tx`
          WITH generated AS (SELECT concourse.uuid_generate_v7() AS id),
          inserted_file AS (
            INSERT INTO files(id, organization_id, uploaded_by_user_id, purpose, storage_key,
              content_type, byte_size, status)
            SELECT id, ${org.id}, ${exhibitorUser.id}, 'kb_document',
              ${`org/${org.id}/kb_document/`} || id || '/faq-integrations.txt',
              'text/plain', 1, 'pending' FROM generated RETURNING id, storage_key
          )
          INSERT INTO kb_sources(event_id, event_exhibitor_id, organizer_organization_id,
            owner_organization_id, kind, source_type, title, file_id, status)
          SELECT ${event.id}, ${booth.id}, ${organizerOrg.id}, ${org.id}, 'uploaded_document',
            'faq', ${faqTitle}, id, 'processing' FROM inserted_file
          RETURNING id AS source_id, file_id,
            (SELECT storage_key FROM inserted_file) AS storage_key
        `));
        knowledgeUploads.push({
          fileId: faq.file_id,
          sourceId: faq.source_id,
          storageKey: faq.storage_key,
          content: (() => {
            const k = COMPANY_KNOWLEDGE[name];
            if (!k) {
              return `${name} — Product Information

${name} offers the following products and services:

${products.map((p) => `- ${p}`).join("\n")}

Industry: ${industry}

${description}

For detailed product specifications, pricing, and availability, visit the official website: ${brochureUrl}`;
            }
            return `${name} — FAQ & Product Information

Industry: ${industry}
Booth: ${number}

${k.overview}

Products:
${products.map((p) => `- ${p}`).join("\n")}

${k.products}

${k.support}`;
          })(),
        });

        const brochureTitle = `${name} product brochure`;
        const brochure = one(await tx`
          SELECT source.id AS source_id, source.file_id, file.storage_key
          FROM kb_sources source JOIN files file ON file.id = source.file_id
          WHERE source.event_exhibitor_id = ${booth.id} AND source.title = ${brochureTitle}
          LIMIT 1
        `.then((rows) => rows.length ? rows : tx`
          WITH generated AS (SELECT concourse.uuid_generate_v7() AS id),
          inserted_file AS (
            INSERT INTO files(id, organization_id, uploaded_by_user_id, purpose, storage_key,
              content_type, byte_size, status)
            SELECT id, ${org.id}, ${exhibitorUser.id}, 'kb_document',
              ${`org/${org.id}/kb_document/`} || id || '/brochure.txt',
              'text/plain', 1, 'pending' FROM generated RETURNING id, storage_key
          )
          INSERT INTO kb_sources(event_id, event_exhibitor_id, organizer_organization_id,
            owner_organization_id, kind, source_type, title, file_id, status)
          SELECT ${event.id}, ${booth.id}, ${organizerOrg.id}, ${org.id}, 'uploaded_document',
            'brochure', ${brochureTitle}, id, 'processing' FROM inserted_file
          RETURNING id AS source_id, file_id,
            (SELECT storage_key FROM inserted_file) AS storage_key
        `));
        knowledgeUploads.push({
          fileId: brochure.file_id,
          sourceId: brochure.source_id,
          storageKey: brochure.storage_key,
          content: (() => {
            const k = COMPANY_KNOWLEDGE[name];
            if (!k) {
              return `${name} — Product Brochure

Company: ${name}
Industry: ${industry}
Booth: ${number}

Products:
${products.map((p) => `  • ${p}`).join("\n")}

${description}

Official website: ${brochureUrl}

Contact: ${phone}`;
            }
            return `${name} — Product Brochure

Company: ${name}
Industry: ${industry}
Booth: ${number}

Products:
${products.map((p) => `  • ${p}`).join("\n")}

Company Overview:
${k.overview}

${k.products}

Official website: ${brochureUrl}

Contact: ${phone}

Social: ${Object.entries(socialLinks).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
          })(),
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
          await tx`INSERT INTO attendee_profiles(user_id,company,job_title,industry) VALUES (${attendee.id},${companies[attendeeIndex % companies.length]!},${titles[attendeeIndex % titles.length]!},${industries[attendeeIndex % industries.length]!}) ON CONFLICT (user_id) DO NOTHING`;
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
    `Demo seed complete: TechExpo 2027, ${exhibitors.length} booths, 200 attendees, and ${exhibitors.length * 100} relationships.\n`,
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
