import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED = 2027;
const OUTPUT = resolve(
  __dirname,
  "..",
  "packages",
  "database",
  "seed",
  "demo_seed.json",
);

function mulberry32(state: number) {
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function splitmix32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x9e3779b9) | 0;
    let t = s ^ (s >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return t >>> 0;
  };
}

function seededRandom(seed: number) {
  const rng = splitmix32(seed);
  const floats = mulberry32(rng());
  return () => (floats() + rng() / 0x100000000) % 1;
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function pickN<T>(
  rand: () => number,
  arr: readonly T[],
  min: number,
  max: number,
): T[] {
  const count = min + Math.floor(rand() * (max - min + 1));
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

function weightedPick<T>(
  rand: () => number,
  items: Array<{ item: T; weight: number }>,
): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rand() * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1]!.item;
}

function generateId(rand: () => number): string {
  const hex = "0123456789abcdef";
  const timestamp = BigInt(Date.now()) << 16n;
  const random = BigInt(Math.floor(rand() * 0xffff));
  const id = timestamp | random;
  return id.toString(16).padStart(32, "0");
}

function deterministicUuid(
  seed: number,
  namespace: string,
  index: number,
): string {
  const hash = createHash("sha256")
    .update(`${namespace}:${index}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hash.slice(18, 20)}-${hash.slice(20, 32)}`;
}

type DemoSeed = {
  meta: { seed: number; generatedAt: string; version: string };
  event: DemoEvent;
  organizers: DemoOrganizer[];
  exhibitors: DemoExhibitor[];
  attendees: DemoAttendee[];
  visits: DemoVisit[];
  conversations: DemoConversation[];
  leads: DemoLead[];
  brochures: DemoBrochure[];
  meetings: DemoMeeting[];
  activities: DemoActivity[];
};

type DemoEvent = {
  name: string;
  slug: string;
  venue: string;
  timezone: string;
  startAt: string;
  endAt: string;
  status: string;
};

type DemoOrganizer = {
  id: string;
  email: string;
  fullName: string;
  title: string;
};

type DemoExhibitor = {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  booth: string;
  tagline: string;
  industry: string;
  description: string;
  website: string;
  phone: string;
  logo: string;
  brandColor: string;
  socialLinks: Record<string, string>;
  contacts: Array<{ name: string; title: string; email: string }>;
  products: Array<{ name: string; description: string; category: string }>;
  knowledgeDocuments: Array<{ title: string; content: string }>;
  brochures: Array<{ title: string; contentType: string }>;
};

type DemoAttendee = {
  id: string;
  email: string;
  fullName: string;
  title: string;
  company: string;
  country: string;
  companyWebsite: string;
  companyDescription: string;
  industry: string;
  department: string;
  buyingIntent: number;
  interests: string[];
  ticketType: string;
  profileType: string;
};

type DemoVisit = {
  id: string;
  attendeeId: string;
  exhibitorId: string;
  arrival: string;
  departure: string;
  dwellSeconds: number;
  productsViewed: string[];
  documentsOpened: string[];
};

type DemoConversation = {
  id: string;
  attendeeId: string;
  exhibitorId: string;
  questions: Array<{ question: string; answer: string }>;
  startedAt: string;
  messageCount: number;
};

type DemoLead = {
  id: string;
  attendeeId: string;
  exhibitorId: string;
  score: number;
  buyingIntent: string;
  buyingStage: string;
  estimatedDealValue: number;
  owner: string;
  followUpDate: string;
  notes: string;
};

type DemoBrochure = {
  id: string;
  attendeeId: string;
  exhibitorId: string;
  title: string;
  downloadedAt: string;
};

type DemoMeeting = {
  id: string;
  attendeeId: string;
  exhibitorId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
};

type DemoActivity = {
  id: string;
  type: string;
  attendeeId: string;
  exhibitorId: string;
  detail: string;
  timestamp: string;
};

function generateSeed(): DemoSeed {
  const rand = seededRandom(SEED);
  const now = new Date("2027-05-13T14:00:00Z");

  const profileTypes = [
    "Technical Buyer",
    "Executive",
    "Innovation Lead",
    "Developer",
    "Procurement",
    "Researcher",
    "Partner",
    "Student",
    "Press",
    "Investor",
  ];

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Operations",
    "IT",
    "R&D",
    "Finance",
    "HR",
    "Legal",
    "Product",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Retail",
    "Telecommunications",
    "Energy",
    "Education",
    "Government",
    "Transportation",
  ];

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
    "India",
    "Brazil",
    "Singapore",
    "South Korea",
    "Netherlands",
    "Sweden",
    "Switzerland",
    "UAE",
  ];

  const ticketTypes = [
    "VIP",
    "General",
    "Press",
    "Speaker",
    "Exhibitor",
    "Student",
  ];

  const attendeeFirstNames = [
    "Avery",
    "Jordan",
    "Morgan",
    "Taylor",
    "Casey",
    "Riley",
    "Cameron",
    "Skyler",
    "Quinn",
    "Dakota",
    "Parker",
    "Reese",
    "Hayden",
    "Finley",
    "Rowan",
    "Sage",
    "Eden",
    "Emery",
    "Harper",
    "Drew",
    "Blake",
    "Ainsley",
    "Sydney",
    "Charlie",
    "Alexis",
    "Jules",
    "Kerry",
    "Lane",
    "Marley",
    "Shiloh",
    "Arrow",
    "Briar",
    "Cadence",
    "Delta",
    "Ellery",
    "Grey",
    "Haven",
    "Indigo",
    "Jazz",
    "Kai",
    "Lake",
    "Navy",
    "Ocean",
    "Piper",
    "Rain",
    "Sky",
    "Tristan",
    "Wren",
  ];

  const attendeeLastNames = [
    "Chen",
    "Patel",
    "Reyes",
    "Okafor",
    "Nguyen",
    "Thompson",
    "Brooks",
    "Ahmed",
    "Kimura",
    "Johansson",
    "Dubois",
    "Santos",
    "Ivanova",
    "Müller",
    "Nakamura",
    "Kowalski",
    "O'Brien",
    "Vargas",
    "Petrov",
    "Costa",
    "Ali",
    "Fischer",
    "Sato",
    "García",
    "Lee",
    "Wong",
    "Silva",
    "Berg",
    "Hart",
    "Fox",
    "Cole",
    "Hayes",
    "West",
    "Frost",
    "Knight",
    "Bishop",
    "Grant",
    "Cross",
    "Wolf",
    "Stone",
  ];

  const companies = [
    [
      "Adobe",
      "https://www.adobe.com",
      "Software",
      "Digital experience and creative software.",
    ],
    [
      "Airbnb",
      "https://www.airbnb.com",
      "Travel",
      "Global marketplace for stays and experiences.",
    ],
    [
      "ASML",
      "https://www.asml.com",
      "Semiconductors",
      "Lithography systems for chip manufacturing.",
    ],
    [
      "Atlassian",
      "https://www.atlassian.com",
      "Software",
      "Collaboration software for technical teams.",
    ],
    [
      "Block",
      "https://block.xyz",
      "Fintech",
      "Financial technology and commerce tools.",
    ],
    [
      "Booking Holdings",
      "https://www.bookingholdings.com",
      "Travel",
      "Online travel and reservation platforms.",
    ],
    [
      "Cisco",
      "https://www.cisco.com",
      "Networking",
      "Networking, security, and collaboration technology.",
    ],
    [
      "Cognizant",
      "https://www.cognizant.com",
      "IT Services",
      "Digital engineering and technology services.",
    ],
    [
      "Coupang",
      "https://www.aboutcoupang.com",
      "Retail",
      "E-commerce and logistics platform.",
    ],
    [
      "CrowdStrike",
      "https://www.crowdstrike.com",
      "Cybersecurity",
      "Cloud-delivered endpoint protection.",
    ],
    [
      "Datadog",
      "https://www.datadoghq.com",
      "Software",
      "Cloud monitoring and security platform.",
    ],
    [
      "Dell Technologies",
      "https://www.dell.com",
      "Technology",
      "Infrastructure, devices, and IT services.",
    ],
    [
      "Deutsche Telekom",
      "https://www.telekom.com",
      "Telecommunications",
      "Integrated telecommunications services.",
    ],
    [
      "Eaton",
      "https://www.eaton.com",
      "Energy",
      "Intelligent power management technologies.",
    ],
    [
      "Equinix",
      "https://www.equinix.com",
      "Data Centers",
      "Digital infrastructure and colocation services.",
    ],
    [
      "Etsy",
      "https://www.etsy.com",
      "Retail",
      "Marketplace for unique and creative goods.",
    ],
    [
      "Fidelity National Information Services",
      "https://www.fisglobal.com",
      "Fintech",
      "Financial-services technology solutions.",
    ],
    [
      "Fortinet",
      "https://www.fortinet.com",
      "Cybersecurity",
      "Broad integrated cybersecurity platform.",
    ],
    [
      "General Motors",
      "https://www.gm.com",
      "Automotive",
      "Vehicle manufacturer advancing electric mobility.",
    ],
    [
      "Hewlett Packard Enterprise",
      "https://www.hpe.com",
      "Technology",
      "Edge-to-cloud enterprise technology.",
    ],
    [
      "Honeywell",
      "https://www.honeywell.com",
      "Industrial",
      "Automation, aerospace, and energy technologies.",
    ],
    [
      "HubSpot",
      "https://www.hubspot.com",
      "Software",
      "Customer platform for marketing, sales, and service.",
    ],
    [
      "Infosys",
      "https://www.infosys.com",
      "IT Services",
      "Digital transformation and consulting services.",
    ],
    [
      "Intuit",
      "https://www.intuit.com",
      "Fintech",
      "Financial software for consumers and businesses.",
    ],
    [
      "KLA Corporation",
      "https://www.kla.com",
      "Semiconductors",
      "Process control systems for semiconductor manufacturing.",
    ],
    [
      "Linde",
      "https://www.linde.com",
      "Industrial",
      "Industrial gases and engineering solutions.",
    ],
    [
      "Marriott International",
      "https://www.marriott.com",
      "Hospitality",
      "Global lodging and hospitality company.",
    ],
    [
      "Mastercard",
      "https://www.mastercard.com",
      "Fintech",
      "Global payments technology company.",
    ],
    [
      "MercadoLibre",
      "https://www.mercadolibre.com",
      "E-commerce",
      "Commerce and payments ecosystem in Latin America.",
    ],
    [
      "MongoDB",
      "https://www.mongodb.com",
      "Software",
      "Developer data platform and database products.",
    ],
    [
      "Nokia",
      "https://www.nokia.com",
      "Telecommunications",
      "Network infrastructure and connectivity technology.",
    ],
    [
      "NXP Semiconductors",
      "https://www.nxp.com",
      "Semiconductors",
      "Secure connectivity solutions for embedded applications.",
    ],
    [
      "Okta",
      "https://www.okta.com",
      "Cybersecurity",
      "Identity management and access platform.",
    ],
    [
      "PayPal",
      "https://www.paypal.com",
      "Fintech",
      "Digital payments and commerce platform.",
    ],
    [
      "Qualcomm",
      "https://www.qualcomm.com",
      "Semiconductors",
      "Wireless technology and semiconductor products.",
    ],
    [
      "Rakuten",
      "https://global.rakuten.com",
      "E-commerce",
      "Internet services, fintech, and e-commerce group.",
    ],
    [
      "Salesforce",
      "https://www.salesforce.com",
      "Software",
      "Customer relationship management platform.",
    ],
    [
      "SAP",
      "https://www.sap.com",
      "Software",
      "Enterprise applications and business technology.",
    ],
    [
      "Schneider Electric",
      "https://www.se.com",
      "Energy",
      "Energy management and industrial automation.",
    ],
    [
      "ServiceNow",
      "https://www.servicenow.com",
      "Software",
      "Cloud workflow and digital operations platform.",
    ],
    [
      "Shopify",
      "https://www.shopify.com",
      "E-commerce",
      "Commerce platform for merchants.",
    ],
    [
      "Siemens",
      "https://www.siemens.com",
      "Industrial",
      "Technology for industry, infrastructure, and mobility.",
    ],
    [
      "Snowflake",
      "https://www.snowflake.com",
      "Software",
      "Cloud data platform.",
    ],
    [
      "Sony Group Corporation",
      "https://www.sony.com",
      "Consumer Electronics",
      "Entertainment, electronics, and technology company.",
    ],
    [
      "Spotify",
      "https://www.spotify.com",
      "Media",
      "Audio streaming platform.",
    ],
    [
      "Stanley Black & Decker",
      "https://www.stanleyblackanddecker.com",
      "Industrial",
      "Tools and industrial solutions company.",
    ],
    [
      "Stryker",
      "https://www.stryker.com",
      "Healthcare",
      "Medical technologies and devices.",
    ],
    [
      "Tata Consultancy Services",
      "https://www.tcs.com",
      "IT Services",
      "IT services, consulting, and business solutions.",
    ],
    [
      "The Trade Desk",
      "https://www.thetradedesk.com",
      "Advertising",
      "Digital advertising technology platform.",
    ],
    [
      "Uber",
      "https://www.uber.com",
      "Transportation",
      "Mobility and delivery platform.",
    ],
    [
      "Verizon",
      "https://www.verizon.com",
      "Telecommunications",
      "Wireless, broadband, and network services.",
    ],
    ["Visa", "https://www.visa.com", "Fintech", "Digital payments network."],
    [
      "Workday",
      "https://www.workday.com",
      "Software",
      "Enterprise finance and HR software.",
    ],
    [
      "Zoom Communications",
      "https://www.zoom.com",
      "Software",
      "Communications and collaboration platform.",
    ],
  ] as const;

  const jobTitles = [
    "VP of Engineering",
    "CTO",
    "Director of Product",
    "Head of Innovation",
    "Senior Architect",
    "Principal Engineer",
    "Product Manager",
    "Engineering Manager",
    "Data Scientist",
    "AI Researcher",
    "Cloud Solutions Architect",
    "DevOps Lead",
    "Security Engineer",
    "Technical Program Manager",
    "SRE Lead",
    "Chief Digital Officer",
    "Head of AI",
    "Director of Technology",
    "Innovation Lead",
    "Technical Director",
    "Head of Platform",
    "Lead Developer",
    "Staff Engineer",
    "Research Scientist",
    "ML Engineering Lead",
    "VP of Cloud",
    "Director of Data",
    "Head of Infrastructure",
    "IT Director",
    "Chief Innovation Officer",
  ];

  // ─── EVENT ───────────────────────────────────────────────────
  const event: DemoEvent = {
    name: "TechExpo 2027",
    slug: "techexpo-2027",
    venue: "Moscone Center",
    timezone: "America/Los_Angeles",
    startAt: "2027-05-12T16:00:00Z",
    endAt: "2027-05-15T01:00:00Z",
    status: "live",
  };

  // ─── ORGANIZERS ──────────────────────────────────────────────
  const organizerTitles = [
    "Event Director",
    "Operations Manager",
    "Registration Lead",
    "Analytics Manager",
    "Exhibitor Success",
  ];
  const organizers: DemoOrganizer[] = organizerTitles.map((title, i) => {
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    return {
      id: deterministicUuid(SEED, "organizer", i),
      email: `${slug}@techexpo.local`,
      fullName: [
        "Olivia Grant",
        "Marcus Chen",
        "Sophia Patel",
        "Ethan Reyes",
        "Isabella Nguyen",
      ][i]!,
      title,
    };
  });

  // ─── EXHIBITORS ──────────────────────────────────────────────
  const exhibitorData: Array<{
    name: string;
    booth: string;
    industry: string;
    tagline: string;
    description: string;
    website: string;
    phone: string;
    logo: string;
    brandColor: string;
    products: Array<{ name: string; description: string; category: string }>;
    contacts: Array<{ name: string; title: string; email: string }>;
    knowledgeTopics: string[];
    brochureTitle: string;
  }> = [
    {
      name: "Microsoft",
      booth: "A-101",
      industry: "Technology",
      tagline:
        "Empower every person and organization on the planet to achieve more.",
      description:
        "Microsoft develops, licenses, and supports software, services, devices, and solutions. Products include Microsoft 365, Azure cloud services, Dynamics 365, LinkedIn, GitHub, and Microsoft Copilot AI assistant. Headquarters: Redmond, Washington.",
      website: "https://www.microsoft.com",
      phone: "+1-800-642-7676",
      logo: "/demo/logos/microsoft.svg",
      brandColor: "#00A4EF",
      products: [
        {
          name: "Microsoft Azure",
          description:
            "Cloud computing platform for building, deploying, and managing applications through Microsoft-managed data centers.",
          category: "Cloud",
        },
        {
          name: "Microsoft 365",
          description:
            "Productivity cloud with Word, Excel, PowerPoint, Outlook, Teams, and AI-powered Copilot.",
          category: "Productivity",
        },
        {
          name: "Microsoft Copilot",
          description:
            "AI assistant integrated across Microsoft 365, Windows, GitHub, and Edge.",
          category: "AI",
        },
        {
          name: "Microsoft Teams",
          description:
            "Collaboration platform with chat, video, meetings, and file sharing.",
          category: "Collaboration",
        },
        {
          name: "GitHub Copilot",
          description:
            "AI pair programmer that provides code suggestions in real-time.",
          category: "Developer Tools",
        },
        {
          name: "Dynamics 365",
          description:
            "Business applications for CRM and ERP with AI-driven insights.",
          category: "Enterprise",
        },
      ],
      contacts: [
        {
          name: "Sarah Johnson",
          title: "Event Lead",
          email: "sarah.johnson@microsoft.com",
        },
        {
          name: "David Kim",
          title: "Technical Specialist",
          email: "david.kim@microsoft.com",
        },
      ],
      knowledgeTopics: [
        "Copilot",
        "Azure AI",
        "Microsoft Fabric",
        "Power Platform",
        "Security",
      ],
      brochureTitle: "Microsoft TechExpo 2027 Brochure",
    },
    {
      name: "Google",
      booth: "A-102",
      industry: "Technology",
      tagline:
        "Organize the world's information and make it universally accessible and useful.",
      description:
        "Google specializes in internet-related services and products. Offerings include Google Cloud Platform, Android, YouTube, Google Workspace, Gemini AI, and Google Pixel. Headquarters: Mountain View, California.",
      website: "https://www.google.com",
      phone: "+1-650-253-0000",
      logo: "/demo/logos/google.svg",
      brandColor: "#4285F4",
      products: [
        {
          name: "Google Cloud Platform",
          description:
            "Suite of cloud computing services with AI/ML, data analytics, and infrastructure.",
          category: "Cloud",
        },
        {
          name: "Google Workspace",
          description:
            "Collaboration and productivity tools powered by Gemini AI.",
          category: "Productivity",
        },
        {
          name: "Google Gemini",
          description:
            "Next-generation AI model family for multimodal reasoning and creation.",
          category: "AI",
        },
        {
          name: "Vertex AI",
          description:
            "Machine learning platform for training, deploying, and managing AI models.",
          category: "AI",
        },
        {
          name: "Android",
          description:
            "Mobile operating system powering billions of devices worldwide.",
          category: "Mobile",
        },
        {
          name: "TensorFlow",
          description:
            "Open-source machine learning framework for building and deploying ML models.",
          category: "Developer Tools",
        },
      ],
      contacts: [
        {
          name: "Michael Torres",
          title: "Cloud Lead",
          email: "mtorres@google.com",
        },
        {
          name: "Emily Chang",
          title: "AI Specialist",
          email: "emilychang@google.com",
        },
      ],
      knowledgeTopics: [
        "Gemini",
        "Vertex AI",
        "Cloud",
        "Workspace",
        "TensorFlow",
      ],
      brochureTitle: "Google TechExpo 2027 Brochure",
    },
    {
      name: "Apple",
      booth: "A-103",
      industry: "Technology",
      tagline: "Think different.",
      description:
        "Apple designs, manufactures, and markets smartphones, computers, tablets, wearables, and accessories. Products include iPhone, Mac, iPad, Apple Watch, Vision Pro, and services. Headquarters: Cupertino, California.",
      website: "https://www.apple.com",
      phone: "+1-800-275-2273",
      logo: "/demo/logos/apple.svg",
      brandColor: "#A2AAAD",
      products: [
        {
          name: "iPhone",
          description:
            "Smartphone with A-series chips, advanced cameras, and iOS ecosystem.",
          category: "Hardware",
        },
        {
          name: "Mac",
          description:
            "Personal computers powered by Apple Silicon (M-series chips).",
          category: "Hardware",
        },
        {
          name: "Apple Vision Pro",
          description:
            "Spatial computer blending digital content with the physical world.",
          category: "Hardware",
        },
        {
          name: "Apple Intelligence",
          description:
            "Personal intelligence system integrated into iPhone, iPad, and Mac.",
          category: "AI",
        },
        {
          name: "iCloud",
          description:
            "Cloud storage and computing service integrated across Apple devices.",
          category: "Services",
        },
      ],
      contacts: [
        {
          name: "Jennifer Park",
          title: "Product Lead",
          email: "jennifer.park@apple.com",
        },
        {
          name: "Ryan O'Brien",
          title: "Solutions Engineer",
          email: "ryan.obrien@apple.com",
        },
      ],
      knowledgeTopics: [
        "Apple Intelligence",
        "Vision Pro",
        "Swift",
        "M-series",
        "Privacy",
      ],
      brochureTitle: "Apple TechExpo 2027 Brochure",
    },
    {
      name: "NVIDIA",
      booth: "A-104",
      industry: "Semiconductors & AI",
      tagline: "The world leader in accelerated computing.",
      description:
        "NVIDIA designs GPUs for gaming, professional visualization, data centers, and automotive. Platforms include CUDA, NVIDIA AI Enterprise, DGX systems, Omniverse, and DRIVE. Headquarters: Santa Clara, California.",
      website: "https://www.nvidia.com",
      phone: "+1-408-486-2000",
      logo: "/demo/logos/nvidia.svg",
      brandColor: "#76B900",
      products: [
        {
          name: "CUDA",
          description:
            "Parallel computing platform and programming model for GPU acceleration.",
          category: "Developer Tools",
        },
        {
          name: "NVIDIA AI Enterprise",
          description:
            "End-to-end AI software platform for production deployment.",
          category: "AI",
        },
        {
          name: "DGX Systems",
          description:
            "AI supercomputers for enterprise AI training and inference.",
          category: "Hardware",
        },
        {
          name: "NVIDIA Omniverse",
          description:
            "Platform for 3D design collaboration and digital twin simulation.",
          category: "Software",
        },
        {
          name: "GeForce GPUs",
          description:
            "Graphics processing units for gaming and creative workloads.",
          category: "Hardware",
        },
        {
          name: "NVIDIA DRIVE",
          description:
            "End-to-end platform for autonomous vehicle development.",
          category: "Automotive",
        },
      ],
      contacts: [
        {
          name: "Alex Wong",
          title: "AI Solutions Lead",
          email: "awong@nvidia.com",
        },
        {
          name: "Priya Sharma",
          title: "Technical Marketing",
          email: "psharma@nvidia.com",
        },
      ],
      knowledgeTopics: [
        "CUDA",
        "DGX",
        "Omniverse",
        "AI Enterprise",
        "Deep Learning",
      ],
      brochureTitle: "NVIDIA TechExpo 2027 Brochure",
    },
    {
      name: "Adobe",
      booth: "B-101",
      industry: "Software",
      tagline: "Creativity for all.",
      description:
        "Adobe provides creative, marketing, and document management solutions. Products include Photoshop, Illustrator, Premiere Pro, Acrobat, Firefly generative AI, and Experience Cloud. Headquarters: San Jose, California.",
      website: "https://www.adobe.com",
      phone: "+1-800-833-6687",
      logo: "/demo/logos/adobe.svg",
      brandColor: "#FF0000",
      products: [
        {
          name: "Adobe Photoshop",
          description:
            "Industry-standard image editing and compositing software.",
          category: "Creative",
        },
        {
          name: "Adobe Firefly",
          description:
            "Generative AI model family for safe commercial content creation.",
          category: "AI",
        },
        {
          name: "Adobe Experience Cloud",
          description:
            "Digital marketing, analytics, and customer experience platform.",
          category: "Enterprise",
        },
        {
          name: "Adobe Premiere Pro",
          description:
            "Professional video editing software for film, TV, and web.",
          category: "Creative",
        },
        {
          name: "Adobe Acrobat",
          description: "PDF document management with AI-powered Assist.",
          category: "Productivity",
        },
      ],
      contacts: [
        {
          name: "Lisa Chen",
          title: "Creative Cloud Lead",
          email: "lchen@adobe.com",
        },
        {
          name: "Tom Harrison",
          title: "Enterprise Sales",
          email: "tharrison@adobe.com",
        },
      ],
      knowledgeTopics: [
        "Firefly",
        "Creative Cloud",
        "Experience Cloud",
        "Acrobat AI",
        "Express",
      ],
      brochureTitle: "Adobe TechExpo 2027 Brochure",
    },
    {
      name: "Cisco",
      booth: "B-102",
      industry: "Networking & Security",
      tagline: "Powering an inclusive future by connecting everything.",
      description:
        "Cisco develops, manufactures, and sells networking hardware, software, telecommunications equipment, and cybersecurity solutions. Products include Catalyst switching, Secure Firewall, Meraki, Webex, AppDynamics. Headquarters: San Jose, California.",
      website: "https://www.cisco.com",
      phone: "+1-800-553-6387",
      logo: "/demo/logos/cisco.svg",
      brandColor: "#1BA0D7",
      products: [
        {
          name: "Cisco Meraki",
          description:
            "Cloud-managed IT solutions for networks, security, and devices.",
          category: "Networking",
        },
        {
          name: "Cisco Secure Firewall",
          description:
            "Next-generation firewall with threat intelligence and zero trust.",
          category: "Security",
        },
        {
          name: "Webex",
          description:
            "Collaboration platform with calling, meetings, and AI-powered features.",
          category: "Collaboration",
        },
        {
          name: "Cisco AppDynamics",
          description:
            "Application performance monitoring and observability platform.",
          category: "Observability",
        },
        {
          name: "Cisco Catalyst Switches",
          description:
            "Enterprise switching portfolio for campus and branch networks.",
          category: "Networking",
        },
      ],
      contacts: [
        {
          name: "Kevin Lee",
          title: "Networking Lead",
          email: "kevlee@cisco.com",
        },
        {
          name: "Rachel Adams",
          title: "Security Specialist",
          email: "radams@cisco.com",
        },
      ],
      knowledgeTopics: [
        "Meraki",
        "Security",
        "Webex",
        "Networking",
        "Observability",
      ],
      brochureTitle: "Cisco TechExpo 2027 Brochure",
    },
    {
      name: "Salesforce",
      booth: "C-101",
      industry: "Enterprise Software",
      tagline: "The world's #1 AI CRM.",
      description:
        "Salesforce provides cloud-based CRM solutions and enterprise applications. Platform includes Sales Cloud, Service Cloud, Marketing Cloud, Tableau, MuleSoft, Slack, and Einstein AI. Headquarters: San Francisco, California.",
      website: "https://www.salesforce.com",
      phone: "+1-800-667-6389",
      logo: "/demo/logos/salesforce.svg",
      brandColor: "#00A1E0",
      products: [
        {
          name: "Sales Cloud",
          description:
            "Sales automation platform with AI-powered lead and opportunity management.",
          category: "CRM",
        },
        {
          name: "Einstein AI",
          description:
            "AI platform embedded across Salesforce for predictions, recommendations, and automation.",
          category: "AI",
        },
        {
          name: "Tableau",
          description:
            "Analytics and business intelligence platform for visual data exploration.",
          category: "Analytics",
        },
        {
          name: "MuleSoft",
          description:
            "Integration platform for connecting applications, data, and devices.",
          category: "Integration",
        },
        {
          name: "Slack",
          description:
            "Business messaging and collaboration platform with AI-powered features.",
          category: "Collaboration",
        },
        {
          name: "Data Cloud",
          description:
            "Customer data platform for unifying and activating data across systems.",
          category: "Data",
        },
      ],
      contacts: [
        {
          name: "Danielle Martinez",
          title: "CRM Lead",
          email: "dmartinez@salesforce.com",
        },
        {
          name: "Chris Wilson",
          title: "AI Solutions",
          email: "cwilson@salesforce.com",
        },
      ],
      knowledgeTopics: [
        "Einstein AI",
        "Data Cloud",
        "Sales Cloud",
        "Tableau",
        "MuleSoft",
      ],
      brochureTitle: "Salesforce TechExpo 2027 Brochure",
    },
    {
      name: "IBM",
      booth: "C-102",
      industry: "Technology & Consulting",
      tagline: "Be essential.",
      description:
        "IBM provides hybrid cloud, AI, and consulting services. Products include watsonx AI platform, IBM Cloud, Red Hat OpenShift, Qiskit quantum computing, SPSS, and Granite AI models. Headquarters: Armonk, New York.",
      website: "https://www.ibm.com",
      phone: "+1-800-426-4968",
      logo: "/demo/logos/ibm.svg",
      brandColor: "#0033A0",
      products: [
        {
          name: "IBM watsonx",
          description:
            "AI and data platform for building, tuning, and deploying foundation models.",
          category: "AI",
        },
        {
          name: "IBM Cloud",
          description:
            "Hybrid cloud platform with AI, security, and industry-specific solutions.",
          category: "Cloud",
        },
        {
          name: "Red Hat OpenShift",
          description:
            "Kubernetes container platform for hybrid cloud deployments.",
          category: "Cloud",
        },
        {
          name: "IBM Qiskit",
          description:
            "Open-source SDK for quantum computing development and simulation.",
          category: "Developer Tools",
        },
        {
          name: "IBM Granite",
          description:
            "Open-source foundation models for enterprise AI workloads.",
          category: "AI",
        },
        {
          name: "IBM Consulting",
          description:
            "Professional services for digital transformation and AI adoption.",
          category: "Services",
        },
      ],
      contacts: [
        {
          name: "James Taylor",
          title: "Consulting Lead",
          email: "jtaylor@ibm.com",
        },
        {
          name: "Maria Garcia",
          title: "AI Specialist",
          email: "mgarcia@ibm.com",
        },
      ],
      knowledgeTopics: [
        "watsonx",
        "Quantum",
        "OpenShift",
        "Granite",
        "Hybrid Cloud",
      ],
      brochureTitle: "IBM TechExpo 2027 Brochure",
    },
    {
      name: "Intel",
      booth: "D-101",
      industry: "Semiconductors",
      tagline:
        "Creating world-changing technology that enriches the lives of every person on earth.",
      description:
        "Intel designs and manufactures CPUs, GPUs, FPGAs, and other semiconductor products. Lines include Core and Xeon processors, Arc GPUs, vPro, and Gaudi AI accelerators. Headquarters: Santa Clara, California.",
      website: "https://www.intel.com",
      phone: "+1-408-765-8080",
      logo: "/demo/logos/intel.svg",
      brandColor: "#0071C5",
      products: [
        {
          name: "Intel Core Processors",
          description:
            "Consumer and business CPUs with built-in AI acceleration (NPU).",
          category: "Hardware",
        },
        {
          name: "Intel Xeon Processors",
          description:
            "Data center CPUs optimized for AI, cloud, and enterprise workloads.",
          category: "Hardware",
        },
        {
          name: "Intel Arc GPUs",
          description:
            "Discrete graphics cards for gaming, content creation, and AI inference.",
          category: "Hardware",
        },
        {
          name: "Intel Gaudi AI Accelerators",
          description:
            "AI training and inference accelerators for data center deployments.",
          category: "Hardware",
        },
        {
          name: "Intel vPro",
          description:
            "Business computing platform with hardware-level security and manageability.",
          category: "Platform",
        },
      ],
      contacts: [
        {
          name: "Nathan Brooks",
          title: "Hardware Lead",
          email: "nbrooks@intel.com",
        },
        {
          name: "Sophie Martin",
          title: "AI Solutions",
          email: "smartin@intel.com",
        },
      ],
      knowledgeTopics: ["Core Ultra", "Xeon", "Gaudi", "Arc", "AI PC"],
      brochureTitle: "Intel TechExpo 2027 Brochure",
    },
    {
      name: "Siemens",
      booth: "D-102",
      industry: "Industrial Technology",
      tagline: "Technology for life.",
      description:
        "Siemens focuses on industry, infrastructure, transport, and healthcare. Key platforms include Xcelerator digital platform, SIMATIC automation, NX software, Teamcenter PLM. Headquarters: Munich, Germany.",
      website: "https://www.siemens.com",
      phone: "+49 69 797-0",
      logo: "/demo/logos/siemens.svg",
      brandColor: "#009999",
      products: [
        {
          name: "Siemens Xcelerator",
          description:
            "Open digital business platform connecting OT and IT for industry.",
          category: "Platform",
        },
        {
          name: "SIMATIC Automation",
          description:
            "Industrial automation systems for manufacturing process control.",
          category: "Industrial",
        },
        {
          name: "NX Software",
          description:
            "Integrated CAD/CAM/CAE solution for product design and engineering.",
          category: "Software",
        },
        {
          name: "Teamcenter",
          description:
            "Product lifecycle management (PLM) platform for digital thread.",
          category: "Software",
        },
        {
          name: "Siemens Industrial Edge",
          description:
            "Edge computing platform for real-time industrial data processing.",
          category: "Industrial",
        },
      ],
      contacts: [
        {
          name: "Klaus Weber",
          title: "Industrial Lead",
          email: "kweber@siemens.com",
        },
        {
          name: "Anna Schmidt",
          title: "Digital Solutions",
          email: "aschmidt@siemens.com",
        },
      ],
      knowledgeTopics: [
        "Xcelerator",
        "SIMATIC",
        "Digital Twin",
        "Industrial Edge",
        "PLM",
      ],
      brochureTitle: "Siemens TechExpo 2027 Brochure",
    },
  ];

  const exhibitors: DemoExhibitor[] = exhibitorData.map((e, i) => {
    const slug = e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const documents = e.knowledgeTopics.map((topic, ti) => ({
      title: `${e.name} ${topic} Overview`,
      content: `${e.name} ${topic}: ${e.description}\n\nKey capabilities and use cases for ${topic} in enterprise environments. Learn how ${e.name} is advancing this technology.`,
    }));
    documents.unshift({
      title: `${e.name} Company Overview`,
      content: `Company: ${e.name}\nIndustry: ${e.industry}\nBooth: ${e.booth}\n\n${e.description}\n\nProducts:\n${e.products.map((p) => `- ${p.name}: ${p.description}`).join("\n")}\n\nWebsite: ${e.website}\nContact: ${e.phone}`,
    });
    documents.push({
      title: `${e.name} FAQ`,
      content: `Frequently Asked Questions about ${e.name}\n\nQ: What industries does ${e.name} serve?\nA: ${e.name} serves customers across ${e.industry}, enterprise, and public sectors.\n\nQ: What is your flagship product?\nA: ${e.products[0]?.name} - ${e.products[0]?.description}\n\nQ: How can I get started?\nA: Visit our booth ${e.booth} for a personalized demo.`,
    });
    return {
      id: deterministicUuid(SEED, "exhibitor", i),
      organizationId: deterministicUuid(SEED, "organization", i),
      slug,
      name: e.name,
      booth: e.booth,
      tagline: e.tagline,
      industry: e.industry,
      description: e.description,
      website: e.website,
      phone: e.phone,
      logo: e.logo,
      brandColor: e.brandColor,
      socialLinks: {
        linkedin: `https://linkedin.com/company/${slug}`,
        twitter: `https://twitter.com/${slug}`,
        website: e.website,
      },
      contacts: e.contacts,
      products: e.products,
      knowledgeDocuments: documents,
      brochures: [
        { title: e.brochureTitle, contentType: "brochure" },
        { title: `${e.name} Product Overview`, contentType: "brochure" },
        { title: `${e.name} Case Studies`, contentType: "brochure" },
        { title: `${e.name} Whitepaper`, contentType: "document" },
      ],
    };
  });

  // ─── ATTENDEES ──────────────────────────────────────────────
  const attendees: DemoAttendee[] = [];
  const shuffledCompanies = [...companies].sort(() => rand() - 0.5);
  for (let i = 0; i < shuffledCompanies.length; i++) {
    const profileType = pick(rand, profileTypes);
    const firstName = pick(rand, attendeeFirstNames);
    const lastName = pick(rand, attendeeLastNames);
    const fullName = `${firstName} ${lastName}`;
    const [company, companyWebsite, industry, companyDescription] =
      shuffledCompanies[i]!;
    const department = pick(rand, departments);

    // Buying intent based on profile
    const intentMap: Record<string, number> = {
      "Technical Buyer": 85 + Math.floor(rand() * 15),
      Executive: 70 + Math.floor(rand() * 25),
      "Innovation Lead": 60 + Math.floor(rand() * 30),
      Developer: 40 + Math.floor(rand() * 30),
      Procurement: 75 + Math.floor(rand() * 20),
      Researcher: 30 + Math.floor(rand() * 30),
      Partner: 50 + Math.floor(rand() * 30),
      Student: 10 + Math.floor(rand() * 20),
      Press: 5 + Math.floor(rand() * 15),
      Investor: 40 + Math.floor(rand() * 40),
    };

    // Interests based on profile
    const interestPool: Record<string, string[]> = {
      "Technical Buyer": [
        "Cloud",
        "AI/ML",
        "Security",
        "Infrastructure",
        "Data Analytics",
      ],
      Executive: [
        "Digital Transformation",
        "AI Strategy",
        "ROI",
        "Innovation",
        "Partnerships",
      ],
      "Innovation Lead": [
        "Emerging Tech",
        "AI/ML",
        "IoT",
        "Quantum",
        "Edge Computing",
      ],
      Developer: ["DevTools", "APIs", "Open Source", "Cloud Native", "AI/ML"],
      Procurement: [
        "Vendor Management",
        "Cloud Migration",
        "Security Compliance",
        "Cost Optimization",
      ],
      Researcher: [
        "AI Research",
        "Quantum Computing",
        "Computer Vision",
        "NLP",
        "Robotics",
      ],
      Partner: [
        "Channel Programs",
        "Co-Innovation",
        "Market Development",
        "Integration",
      ],
      Student: [
        "Career Development",
        "Certifications",
        "Open Source",
        "Cloud Skills",
      ],
      Press: [
        "Industry Trends",
        "Product Launches",
        "Executive Interviews",
        "Innovation",
      ],
      Investor: [
        "Market Growth",
        "M&A",
        "Revenue Models",
        "Competitive Landscape",
      ],
    };

    const allInterests = interestPool[profileType] ?? [
      "Technology",
      "Innovation",
    ];
    const interestCount =
      profileType === "Press" || profileType === "Student"
        ? 2 + Math.floor(rand() * 2)
        : 3 + Math.floor(rand() * 3);
    const interests = [...allInterests]
      .sort(() => rand() - 0.5)
      .slice(0, Math.min(interestCount, allInterests.length));

    const ticketType =
      profileType === "VIP" || profileType === "Investor"
        ? "VIP"
        : profileType === "Press"
          ? "Press"
          : profileType === "Student"
            ? "Student"
            : "General";

    attendees.push({
      id: deterministicUuid(SEED, "attendee", i),
      email: `attendee-${i + 1}@techexpo.local`,
      fullName,
      title: pick(rand, jobTitles),
      company,
      companyWebsite,
      companyDescription,
      country: pick(rand, countries),
      industry,
      department,
      buyingIntent: intentMap[profileType] ?? 50,
      interests,
      ticketType,
      profileType,
    });
  }

  // ─── VISITS ────────────────────────────────────────────────
  const visits: DemoVisit[] = [];
  const visitCount = 800;
  const eventStart = new Date("2027-05-12T08:00:00-07:00").getTime();
  const eventEnd = new Date("2027-05-14T18:00:00-07:00").getTime();
  const eventDuration = eventEnd - eventStart;

  for (let i = 0; i < visitCount; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const arrivalOffset = Math.floor(rand() * eventDuration);
    const arrival = new Date(eventStart + arrivalOffset);
    const dwellSeconds = 120 + Math.floor(rand() * 1500);
    const departure = new Date(arrival.getTime() + dwellSeconds * 1000);
    const productCount = Math.floor(rand() * 3);
    const productsViewed = pickN(rand, exhibitor.products, 0, 3).map(
      (p) => p.name,
    );
    const docCount = Math.floor(rand() * 2);
    const docsOpened = pickN(rand, exhibitor.knowledgeDocuments, 0, 2).map(
      (d) => d.title,
    );

    visits.push({
      id: deterministicUuid(SEED, "visit", i),
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      arrival: arrival.toISOString(),
      departure: departure.toISOString(),
      dwellSeconds,
      productsViewed,
      documentsOpened: docsOpened,
    });
  }

  // ─── CONVERSATIONS ─────────────────────────────────────────
  const conversations: DemoConversation[] = [];
  const conversationCount = 500;
  const companyQuestions: Record<string, string[]> = {
    Microsoft: [
      "How does Copilot integrate with Microsoft 365?",
      "What is Azure AI's RAG architecture?",
      "Can you show me Microsoft Fabric in action?",
      "How does Power Platform integrate with Teams?",
    ],
    Google: [
      "How does Gemini compare to GPT-4?",
      "What's new in Vertex AI?",
      "How does Google Cloud handle multi-cloud deployments?",
      "What's the roadmap for Workspace AI features?",
    ],
    Apple: [
      "How does Apple Intelligence protect privacy?",
      "What's the developer story for Vision Pro?",
      "How are M-series chips optimized for ML workloads?",
      "What's the enterprise adoption path for Apple devices?",
    ],
    NVIDIA: [
      "How does CUDA accelerate AI training?",
      "What's new in the DGX product line?",
      "Can you demo Omniverse digital twin capabilities?",
      "How is NVIDIA approaching edge AI with Jetson?",
    ],
    Adobe: [
      "How does Firefly handle commercial licensing?",
      "What's the roadmap for AI in Creative Cloud?",
      "How does Experience Cloud unify customer data?",
      "Can you show me Acrobat AI Assistant?",
    ],
    Cisco: [
      "How does Meraki simplify network management?",
      "What's the zero trust architecture at Cisco?",
      "How does AppDynamics integrate with cloud-native apps?",
      "What AI features does Webex have?",
    ],
    Salesforce: [
      "How is Einstein AI embedded in Sales Cloud?",
      "How does Data Cloud unify customer profiles?",
      "What's the Tableau AI roadmap?",
      "How does MuleSoft handle API-led connectivity?",
    ],
    IBM: [
      "How does watsonx compare to other AI platforms?",
      "What's the roadmap for IBM Quantum?",
      "How does OpenShift simplify hybrid cloud?",
      "What are Granite models optimized for?",
    ],
    Intel: [
      "How does the NPU in Core Ultra enable AI PCs?",
      "What's the performance story for Gaudi accelerators?",
      "How does vPro improve enterprise security?",
      "What's the roadmap for Intel Arc GPUs?",
    ],
    Siemens: [
      "How does Xcelerator connect OT and IT?",
      "What's new in SIMATIC automation?",
      "How does digital twin technology work in practice?",
      "How does Industrial Edge handle real-time processing?",
    ],
  };

  for (let i = 0; i < conversationCount; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const questions = companyQuestions[exhibitor.name] ?? [
      "What's new?",
      "How can I get started?",
    ];
    const selectedQuestions = pickN(rand, questions, 1, 3);
    const qas = selectedQuestions.map((q) => ({
      question: q,
      answer: `Thank you for asking about ${q.split(" ").slice(0, 3).join(" ")}... ${exhibitor.name} offers comprehensive solutions in this area. I'd recommend visiting our booth ${exhibitor.booth} for a personalized demo with our technical team.`,
    }));
    const startedAt = new Date(eventStart + Math.floor(rand() * eventDuration));

    conversations.push({
      id: deterministicUuid(SEED, "conversation", i),
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      questions: qas,
      startedAt: startedAt.toISOString(),
      messageCount: qas.length * 2,
    });
  }

  // ─── LEADS ─────────────────────────────────────────────────
  const leads: DemoLead[] = [];
  const leadCount = 250;
  const leadStages = [
    "Awareness",
    "Interest",
    "Consideration",
    "Intent",
    "Evaluation",
    "Purchase",
  ];
  const usedPairs = new Set<string>();

  for (let i = 0; i < leadCount; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const key = `${attendee.id}:${exhibitor.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);

    const stage = pick(rand, leadStages);
    const stageValue: Record<string, number> = {
      Awareness: 10,
      Interest: 25,
      Consideration: 50,
      Intent: 100,
      Evaluation: 150,
      Purchase: 300,
    };
    const baseValue = stageValue[stage] ?? 50;
    const variation = Math.floor(rand() * baseValue);
    const score = Math.min(
      100,
      Math.floor(attendee.buyingIntent * (rand() * 0.4 + 0.6)),
    );

    const intentLabels = [
      "Discovering",
      "Evaluating",
      "Researching",
      "Planning",
      "Budgeting",
      "Approved",
    ];

    leads.push({
      id: deterministicUuid(SEED, "lead", i),
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      score,
      buyingIntent: pick(rand, intentLabels),
      buyingStage: stage,
      estimatedDealValue: baseValue + variation,
      owner: exhibitor.contacts[0]?.name ?? "",
      followUpDate: new Date(
        eventEnd + Math.floor(rand() * 30) * 86400000,
      ).toISOString(),
      notes: `Lead captured at ${exhibitor.name} booth. ${attendee.fullName} showed interest in ${pick(rand, attendee.interests)}.`,
    });
  }

  // ─── BROCHURES ─────────────────────────────────────────────
  const brochures: DemoBrochure[] = [];
  for (let i = 0; i < 400; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const title = pick(rand, exhibitor.brochures).title;

    brochures.push({
      id: deterministicUuid(SEED, "brochure", i),
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      title,
      downloadedAt: new Date(
        eventStart + Math.floor(rand() * eventDuration),
      ).toISOString(),
    });
  }

  // ─── MEETINGS ──────────────────────────────────────────────
  const meetings: DemoMeeting[] = [];
  const meetingStatuses = ["scheduled", "confirmed", "completed", "cancelled"];
  const usedMeetingPairs = new Set<string>();

  for (let i = 0; i < 70; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const key = `meet-${attendee.id}:${exhibitor.id}`;
    if (usedMeetingPairs.has(key)) continue;
    usedMeetingPairs.add(key);

    const meetingHour = 9 + Math.floor(rand() * 8);
    const meetingDay = 0 + Math.floor(rand() * 3);
    const scheduledAt = new Date(
      eventStart + meetingDay * 86400000 + meetingHour * 3600000,
    );

    meetings.push({
      id: deterministicUuid(SEED, "meeting", i),
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      title: `Meeting: ${attendee.fullName} × ${exhibitor.name}`,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: 15 + Math.floor(rand() * 4) * 15,
      status: pick(rand, meetingStatuses),
    });
  }

  // ─── ACTIVITIES ────────────────────────────────────────────
  const activities: DemoActivity[] = [];
  const activityTypes = [
    "qr_scan",
    "ai_chat",
    "lead_submission",
    "meeting",
    "brochure_download",
    "product_view",
    "returning_visitor",
  ];

  const activityDetailMap: Record<string, string> = {
    qr_scan: "scanned booth QR code",
    ai_chat: "engaged in AI conversation",
    lead_submission: "submitted lead form",
    meeting: "booked a meeting",
    brochure_download: "downloaded brochure",
    product_view: "viewed product details",
    returning_visitor: "returned to booth",
  };

  for (let i = 0; i < 300; i++) {
    const attendee = pick(rand, attendees);
    const exhibitor = pick(rand, exhibitors);
    const type = pick(rand, activityTypes);
    const hoursAgo = rand() * 48;
    const timestamp = new Date(now.getTime() - hoursAgo * 3600000);

    activities.push({
      id: deterministicUuid(SEED, "activity", i),
      type,
      attendeeId: attendee.id,
      exhibitorId: exhibitor.id,
      detail: `${attendee.fullName} ${activityDetailMap[type]} at ${exhibitor.name}`,
      timestamp: timestamp.toISOString(),
    });
  }

  return {
    meta: { seed: SEED, generatedAt: now.toISOString(), version: "1.0.0" },
    event,
    organizers,
    exhibitors,
    attendees,
    visits,
    conversations,
    leads,
    brochures,
    meetings,
    activities,
  };
}

async function main() {
  const seed = generateSeed();
  await writeFile(OUTPUT, JSON.stringify(seed, null, 2));
  console.log("Demo seed generated:", OUTPUT);
  console.log("  Event:", seed.event.name);
  console.log("  Organizers:", seed.organizers.length);
  console.log("  Exhibitors:", seed.exhibitors.length);
  console.log("  Attendees:", seed.attendees.length);
  console.log("  Visits:", seed.visits.length);
  console.log("  Conversations:", seed.conversations.length);
  console.log("  Leads:", seed.leads.length);
  console.log("  Brochures:", seed.brochures.length);
  console.log("  Meetings:", seed.meetings.length);
  console.log("  Activities:", seed.activities.length);

  // Verify determinism by running twice
  const second = generateSeed();
  const firstJson = JSON.stringify(seed);
  const secondJson = JSON.stringify(second);
  if (firstJson !== secondJson) {
    console.error("ERROR: Seed generation is not deterministic!");
    process.exit(1);
  }
  console.log(
    "\n✓ Determinism verified (seed 2027 produces identical output on second run)",
  );
}

main().catch(console.error);
