/*
 * Single source of truth for every piece of personal content on the site.
 * Components read from DATA and never hardcode personal text.
 * Facts come from Divyanshu's résumé (Resume 1.pdf, September 2026).
 *
 * Conventions:
 * - `// SAMPLE:` marks placeholder copy (mostly "Learned" and Proveout) for Divyanshu to replace.
 * - Missing URLs are empty strings with a `// TODO:` comment; components hide empty links.
 */

/** Each accent is a real product colour; values live in globals.css as --c-<key>. */
export type Accent = "ion" | "bitbin" | "vibe" | "genie" | "payflo" | "fateh" | "mitacs";

/** Which animated miniature of the product to render (src/components/minis). */
export type MiniKey = "vibecraft" | "bitbin" | "thapargenie" | "payflo" | "telemetrix" | "daq" | "proveout" | "slam";

export type Link = { label: string; href: string };
export type Stat = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string };

export type Project = {
  slug: string;
  title: string;
  /** What it is, in a few words. */
  kind: string;
  /** Address bar text in the miniature's window chrome. */
  host: string;
  accent: Accent;
  mini: MiniKey;
  /** One line: what it achieved. */
  outcome: string;
  built: string[];
  impact: Stat[];
  learned: string[];
  stack: string[];
  links: Link[];
};

export type Role = { title: string; period: string; bullets: string[] };

export type JourneyEntry = {
  id: string;
  /** Short year label on the timeline rail. */
  when: string;
  org: string;
  unit: string;
  location: string;
  accent: Accent;
  mini?: MiniKey;
  /** Small illustration beside the results. */
  visual?: "skidpad";
  roles: Role[];
  results?: { event: string; place: number; note: string }[];
  awards?: { title: string; detail: string; period: string; href?: string }[];
  learned: string[];
  tags: string[];
  href: string;
  hrefLabel?: string;
};

export type Skill = {
  name: string;
  /** Project slugs or journey ids where this skill was used. */
  in: string[];
};

export const DATA = {
  name: "Divyanshu Agrahari",
  firstName: "Divyanshu",
  initials: "DA",
  url: "", // TODO: production URL for the portfolio itself
  description:
    "Computer engineer who builds products end to end: AI tools, distributed backends, Formula Student telemetry and robot autonomy. Now building Proveout.",

  hero: {
    status: "Building Proveout",
    lead: "I build",
    /** Cycles in the hero line; each word takes on its project's colour. */
    words: [
      { text: "AI products", accent: "vibe" },
      { text: "developer tools", accent: "bitbin" },
      { text: "RAG systems", accent: "genie" },
      { text: "payment backends", accent: "payflo" },
      { text: "race-car telemetry", accent: "fateh" },
      { text: "robot autonomy", accent: "mitacs" },
    ] as { text: string; accent: Accent }[],
    tail: "end to end, from firmware to Kubernetes.",
    proof: [
      { value: 5, suffix: "th", label: "Formula Student Italy 2024, global" },
      { value: 12600, suffix: "+", label: "passages ThaparGenie answers from" },
      { value: 1, prefix: "#", label: "in the ECE department, 2021–22" },
      { value: 9.18, decimals: 2, label: "CGPA at Thapar Institute" },
    ] as Stat[],
  },

  /** Section headings and one-line intros. */
  sections: {
    work: {
      title: "Selected work",
      intro: "Three products I designed, built and shipped on my own. Each one below is a working miniature of the real app, not a screenshot.",
    },
    more: {
      title: "More builds",
      intro: "A payments backend, and the electronics I built for our Formula Student car.",
    },
    journey: {
      title: "Journey",
      intro: "From ranking first in electronics to leading a race car's electrical team, research in Canada, and now a company of my own.",
    },
    skills: {
      title: "Skills, with proof",
      intro: "Pick a skill to see where I used it.",
    },
  },

  /** Featured chapters under Selected work, in order. */
  projects: [
    {
      slug: "vibecraft",
      title: "VibeCraft",
      kind: "AI project builder with live previews",
      host: "vibecraft.divyanshuagrahari.dev",
      accent: "vibe",
      mini: "vibecraft",
      outcome: "Describe an idea in one line and watch a real project get written, file by file, into a live preview running in its own Kubernetes pod.",
      built: [
        "Spring Boot microservices behind Spring Cloud Gateway with Eureka, database-per-service PostgreSQL and an authenticated OpenFeign internal API",
        "Streaming code generation with Spring AI in a tag-based protocol, a live build checklist and auto-recovery when a turn stops short",
        "Preview pods claimed from a warm pool and reclaimed when idle, served through signed, expiring links routed by Redis",
        "CI/CD on GitHub Actions: arm64 images to k3s on Oracle Cloud, smoke-tested with automatic rollback",
      ],
      impact: [
        { value: 1, label: "isolated pod per live preview" },
        { value: 1, label: "atomic, restorable revision per AI turn" },
        { value: 4, prefix: "2–", label: "clarifying questions turn an idea into a spec" },
      ],
      // SAMPLE: replace with your own lessons
      learned: [
        "A warm pool of pods did more for first-preview time than any code optimisation",
        "Publishing each AI turn as one all-or-nothing revision made undo and collaboration simple",
      ],
      stack: ["Java 25", "Spring Boot 4.1", "Spring AI", "PostgreSQL", "Redis", "MinIO", "React", "Kubernetes"],
      links: [
        { label: "Live demo", href: "https://vibecraft.divyanshuagrahari.dev" },
        { label: "Source", href: "https://github.com/Divyanshu2805/vibecraft" },
      ],
    },
    {
      slug: "bitbin",
      title: "BitBin",
      kind: "Searchable home for developer knowledge",
      host: "bitbin.divyanshuagrahari.dev",
      accent: "bitbin",
      mini: "bitbin",
      outcome: "Every snippet, prompt and command in one bin, a keystroke away, with an extension that saves from any page.",
      built: [
        "Next.js App Router with no separate API server: Server Components read through Prisma, every write is a server action with Zod, plan and rate-limit checks",
        "NextAuth (credentials and GitHub), Stripe Free/Pro plans, Cloudflare R2 uploads and Upstash rate limiting",
        "AI auto-tagging, descriptions, code explanation and prompt optimisation",
        "A Chrome / Edge extension over a REST API with hashed, revocable personal access tokens",
      ],
      impact: [
        { value: 5, label: "item types behind one ⌘K search" },
        { value: 4, label: "AI features for Pro users" },
        { value: 1, label: "shortcut to save from any page" },
      ],
      // SAMPLE: replace with your own lessons
      learned: [
        "Letting the extension reuse the app's validation and queries removed a whole class of bugs",
        "Designing keyboard-first decided most of the layout before any styling",
      ],
      stack: ["Next.js 16", "React 19", "TypeScript", "Prisma 7", "PostgreSQL", "NextAuth", "Stripe", "Vercel"],
      links: [
        { label: "Live demo", href: "https://bitbin.divyanshuagrahari.dev" },
        { label: "Source", href: "https://github.com/Divyanshu2805/bitbin" },
      ],
    },
    {
      slug: "thapargenie",
      title: "ThaparGenie",
      kind: "RAG assistant for Thapar Institute students",
      host: "thapargenie",
      accent: "genie",
      mini: "thapargenie",
      outcome: "Answers students' questions from official college documents, with a numbered source for every claim.",
      built: [
        "Hybrid search: pgvector HNSW and Postgres full-text, fused with RRF, over rewritten standalone queries",
        "A grounding check that flags claims the cited sources don't back",
        "Conversations as a message tree, so edits and regenerations branch instead of overwriting, streamed over SSE",
        "A crash-recoverable ingestion pipeline for PDFs, Word, Excel, web pages and FAQs, with a nightly recall@5 check",
      ],
      impact: [
        { value: 12600, suffix: "+", label: "passages indexed" },
        { value: 1300, suffix: "+", label: "official TIET documents" },
        { value: 5, prefix: "recall@", label: "checked every night" },
      ],
      // SAMPLE: replace with your own lessons
      learned: [
        "Retrieval quality mattered more than which model wrote the answer",
        "Showing admins the questions nobody could answer improved the knowledge base fastest",
      ],
      stack: ["Python", "Django 5.2", "PostgreSQL", "pgvector", "Gemini API", "React 19", "Playwright"],
      links: [], // TODO: GitHub and live demo URLs (on the résumé but not linked in the PDF)
    },
  ] as Project[],

  /** Smaller cards under More builds. */
  moreBuilds: [
    {
      slug: "payflo",
      title: "PayFlo",
      kind: "Payment gateway backend",
      host: "payflo",
      accent: "payflo",
      mini: "payflo",
      outcome: "A payment gateway where a retried or failed call never double-charges a customer.",
      built: [
        "Saga-driven payment state machine that never holds a DB transaction across a network call",
        "Transactional outbox to Kafka and HMAC-signed webhooks, retried then dead-lettered",
        "Card data isolated in a vault with per-card AES-256-GCM envelope encryption",
      ],
      impact: [],
      learned: [],
      stack: ["Java 25", "Spring Cloud", "Kafka", "Redis", "PostgreSQL", "Resilience4j"],
      links: [{ label: "Source", href: "https://github.com/Divyanshu2805/payflo" }],
    },
    {
      slug: "telemetrix",
      title: "TeleMetrix",
      kind: "Formula Student telemetry dashboard",
      host: "telemetrix",
      accent: "fateh",
      mini: "telemetrix",
      outcome: "A full-HD track-side dashboard fed by a live 230,400-baud stream from the car.",
      built: [
        "Frame validation so malformed packets never reach the display",
        "Rolling traces on sliding-window buffers and a G-G friction circle",
        "An Arduino signal simulator for bench testing without the car",
      ],
      impact: [],
      learned: [],
      stack: ["Processing (Java)", "Arduino", "ESP32", "XBee", "UART"],
      links: [{ label: "Source", href: "https://github.com/Divyanshu2805/telemetrix" }],
    },
    {
      slug: "daq",
      title: "DAQ and dashboard",
      kind: "Data acquisition for Team Fateh",
      host: "daq · esp32",
      accent: "fateh",
      mini: "daq",
      outcome: "Decodes ECU CAN frames at 1 Mbps and streams the car's powertrain state over XBee at about 3 km.",
      built: [
        "FreeRTOS scheduling on the dual-core ESP32 for a 4× boost at 30 Hz",
        "Nextion driver dashboard with a FastLED shift light and CAN watchdog",
        "microSD logging over SPI alongside the live stream",
      ],
      impact: [],
      learned: [],
      stack: ["ESP32", "FreeRTOS", "C++", "CAN", "SPI", "I2C", "KiCad"],
      links: [{ label: "Source", href: "https://github.com/Divyanshu2805/Dashboard_2023" }],
    },
  ] as Project[],

  proveout: {
    name: "Proveout",
    role: "Founder, solo",
    oneLine: "An independent verification and merge gate for AI-written pull requests.",
    // SAMPLE: replace with the real problem statement
    problem:
      "Agents now open pull requests faster than people can review them. Proveout checks each one independently, so the only code that merges is code that has proved it works.",
    // SAMPLE: replace with the real status
    status: ["building the verification pipeline", "running it on my own repositories", "looking for design partners"],
    href: "", // TODO: Proveout URL
  },

  journey: [
    {
      id: "proveout",
      when: "Now",
      org: "Proveout",
      unit: "Verification and merge gate for AI-written code",
      location: "India",
      accent: "ion",
      roles: [
        {
          title: "Founder (solo)",
          period: "Now", // TODO: start month
          // SAMPLE: replace with what you've built so far
          bullets: ["Designing and building the product end to end, from the checks pipeline to the GitHub integration."],
        },
      ],
      // SAMPLE
      learned: ["Talking to the people who review AI pull requests every day shapes the product more than any feature list"],
      tags: [],
      href: "",
    },
    {
      id: "mitacs",
      when: "2024",
      org: "University of Calgary",
      unit: "MITACS Globalink · Intelligent Dynamics & Control Lab, with Dr. Mahdis Bisheban",
      location: "Calgary, Canada",
      accent: "mitacs",
      mini: "slam",
      roles: [
        {
          title: "MITACS Globalink Research Intern",
          period: "Summer 2024",
          bullets: [
            "Extended a ROS 2 / Gazebo aerial manipulator (a quadcopter with a 7-DoF Kinova Gen3 arm and an SE(3) geometric controller) with autonomous navigation and SLAM.",
            "Connected Nav2 to the flight controller through a Python trajectory layer that turns velocity commands into smooth trajectories, for fully autonomous goal-to-goal flight.",
            "Deployed 3D LiDAR-inertial SLAM (LIO-SAM with IMU fusion) and 2D SLAM (slam_toolbox), tuned for GPS-denied mapping and localisation.",
            "Built a reusable simulation testbed with a single-config launch system, validated across custom GPS-denied mazes.",
          ],
        },
      ],
      // SAMPLE
      learned: [
        "Most autonomy bugs were timing and frame bugs, and good logging found them faster than theory",
        "A one-config launch system saved more hours than any single algorithm change",
      ],
      tags: ["Python", "ROS 2", "Nav2", "MoveIt 2", "LIO-SAM", "slam_toolbox", "Gazebo"],
      href: "https://github.com/IDCL-UCalgary",
      hrefLabel: "IDCL on GitHub",
    },
    {
      id: "fateh",
      when: "2022",
      org: "Team Fateh",
      unit: "Formula Student team, Thapar Institute",
      location: "Patiala, India",
      accent: "fateh",
      visual: "skidpad",
      roles: [
        {
          title: "Electrical & Electronics Head",
          period: "Apr 2024 – Apr 2025",
          bullets: [
            "Led the electrical and electronics subsystem through the team's move from a combustion to an electric powertrain.",
            "Co-designed the low-voltage architecture with pre-charge, discharge and safety circuits to meet Formula Student EV rules.",
          ],
        },
        {
          title: "Electronics & Data Acquisition Engineer",
          period: "Oct 2022 – Mar 2024",
          bullets: [
            "Owned the car's data acquisition, driver dashboard and real-time telemetry.",
            "Built an ESP32 + FreeRTOS DAQ over CAN, SPI, I2C and UART that streamed live sensor data to track-side engineers.",
          ],
        },
      ],
      results: [
        { event: "FS Italy 2024", place: 5, note: "Global. 4th in Skidpad, Acceleration and Autocross" },
        { event: "FS Bharat 2024", place: 3, note: "1st in Static Events, Engineering Design, Cost & Manufacturing" },
        { event: "SUPRA 2023", place: 2, note: "1st in Static & Dynamic Events, Engineering Design, Autocross" },
      ],
      // SAMPLE
      learned: [
        "Leading a subsystem is mostly interfaces: agreeing on connectors, messages and deadlines with other teams",
        "Hardware that fails on track teaches you to validate every frame",
      ],
      tags: ["ESP32", "FreeRTOS", "CAN", "SPI", "I2C", "UART", "XBee", "KiCad"],
      href: "", // TODO: team URL
    },
    {
      id: "thapar",
      when: "2021",
      org: "Thapar Institute of Engineering and Technology",
      unit: "B.E. Computer Engineering · CGPA 9.18/10",
      location: "Patiala, India",
      accent: "ion",
      roles: [
        {
          title: "B.E. Computer Engineering",
          period: "Sep 2021 – Jun 2025",
          bullets: ["Upgraded from Electronics & Communication Engineering after ranking 1st in the department in 2021–22."],
        },
      ],
      awards: [
        {
          title: "Gold Medal and Dean's List",
          detail: "1st rank in the ECE department",
          period: "2021–22",
          href: "https://www.thapar.edu/upload/files/Final%20List%20of%20annual%20Prizes%20&%20Medals%20for%202021-22.pdf",
        },
        { title: "MITACS Globalink", detail: "Fully funded research internship in Canada", period: "2024" },
        {
          title: "Merit Scholarship I",
          detail: "Top 35 in college",
          period: "2022–23",
          href: "https://www.thapar.edu/upload/files/FINAL%20LIST%20OF%20MERIT%20SCHOLARSHIP%20AWARDEEFOR2022-23.pdf",
        },
        {
          title: "Merit Scholarship III",
          detail: "Top 10% of batch",
          period: "2023–25",
          href: "https://www.thapar.edu/upload/files/FINAL%20LIST%20OF%20TIET%20MERIT%20SCHOLARSHIP%20(PG&UG)%20FOR%202023-24%20.pdf",
        },
        {
          title: "Entry Merit Scholarship",
          detail: "All India Rank, JEE Main 2021",
          period: "2021–22",
          href: "https://www.thapar.edu/upload/files/FINAL%20LIST%20TIET%20MERIT%20(R)%20SCHOLARSHIP%202021-22%20(PG%20&%20UG).pdf",
        },
      ],
      // SAMPLE
      learned: ["Switching branches mid-degree taught me to learn fast from first principles"],
      tags: [],
      href: "",
    },
  ] as JourneyEntry[],

  /** Every skill lists where it was used; ids match project slugs and journey ids. */
  skills: [
    {
      area: "Languages",
      items: [
        { name: "Java", in: ["vibecraft", "payflo", "telemetrix"] },
        { name: "Python", in: ["thapargenie", "mitacs"] },
        { name: "TypeScript", in: ["bitbin", "vibecraft", "thapargenie"] },
        { name: "C/C++", in: ["daq", "fateh"] },
        { name: "SQL", in: ["payflo", "thapargenie", "bitbin"] },
      ],
    },
    {
      area: "Backend",
      items: [
        { name: "Spring Boot", in: ["vibecraft", "payflo"] },
        { name: "Spring Cloud", in: ["vibecraft", "payflo"] },
        { name: "Spring AI", in: ["vibecraft"] },
        { name: "Django / DRF", in: ["thapargenie"] },
        { name: "Node.js", in: ["vibecraft"] },
        { name: "REST APIs", in: ["bitbin", "payflo", "thapargenie"] },
      ],
    },
    {
      area: "Frontend",
      items: [
        { name: "React", in: ["vibecraft", "thapargenie", "bitbin"] },
        { name: "Next.js", in: ["bitbin"] },
        { name: "Tailwind CSS", in: ["bitbin", "thapargenie"] },
      ],
    },
    {
      area: "Data and messaging",
      items: [
        { name: "PostgreSQL", in: ["vibecraft", "payflo", "thapargenie", "bitbin"] },
        { name: "pgvector", in: ["thapargenie"] },
        { name: "Redis", in: ["vibecraft", "payflo", "bitbin"] },
        { name: "Apache Kafka", in: ["payflo"] },
        { name: "S3 object storage", in: ["vibecraft", "bitbin"] },
      ],
    },
    {
      area: "AI / LLM",
      items: [
        { name: "RAG", in: ["thapargenie"] },
        { name: "Hybrid search", in: ["thapargenie"] },
        { name: "Streaming generation", in: ["vibecraft", "thapargenie"] },
        { name: "Gemini / OpenAI APIs", in: ["thapargenie", "bitbin"] },
      ],
    },
    {
      area: "Cloud and DevOps",
      items: [
        { name: "Kubernetes", in: ["vibecraft", "payflo"] },
        { name: "Docker", in: ["vibecraft", "payflo", "thapargenie"] },
        { name: "GitHub Actions", in: ["vibecraft", "thapargenie"] },
        { name: "Linux", in: ["vibecraft", "mitacs"] },
      ],
    },
    {
      area: "Testing",
      items: [
        { name: "JUnit + Testcontainers", in: ["vibecraft"] },
        { name: "Vitest", in: ["bitbin"] },
        { name: "Playwright", in: ["thapargenie"] },
      ],
    },
    {
      area: "Embedded and robotics",
      items: [
        { name: "ESP32 + FreeRTOS", in: ["daq", "fateh"] },
        { name: "CAN / SPI / I2C / UART", in: ["daq", "telemetrix", "fateh"] },
        { name: "ROS 2 + Nav2", in: ["mitacs"] },
        { name: "SLAM", in: ["mitacs"] },
        { name: "KiCad", in: ["daq", "fateh"] },
      ],
    },
  ] as { area: string; items: Skill[] }[],

  contact: {
    line: "Have something hard to build?",
    sentence: "I'm open to engineering roles, collaborations, and early Proveout users. Email is the fastest way to reach me.",
    email: "divyanshu11235@gmail.com",
    resume: "/resume.pdf",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "India (IST)",
    /** Quotes the Contact signal writes out, one every 5 seconds; facts from the résumé. */
    quotes: [
      { text: "Founder of Proveout, building it solo.", accent: "ion" },
      { text: "I build from firmware to Kubernetes.", accent: "vibe" },
      { text: "5th at Formula Student Italy 2024.", accent: "fateh" },
      { text: "12,600+ passages behind ThaparGenie.", accent: "genie" },
      { text: "Robot autonomy research in Calgary.", accent: "mitacs" },
      { text: "Ranked #1 in ECE, 2021–22.", accent: "bitbin" },
    ] as { text: string; accent: Accent }[],
    social: [
      { label: "GitHub", href: "https://github.com/Divyanshu2805" },
      { label: "LinkedIn", href: "https://linkedin.com/in/divyanshu-agrahari" },
      { label: "LeetCode", href: "https://leetcode.com/u/imstoopid/" },
    ] as Link[],
  },

  writing: {
    enabled: false,
    title: "Writing",
    description: "TODO: one line about what you write about",
  },

  footer: {
    sourceUrl: "", // TODO: public repo URL for this site
  },
};

/** Looks up a project or journey entry by id, for skill evidence and palette links. */
export function findWork(id: string) {
  const project = [...DATA.projects, ...DATA.moreBuilds].find((p) => p.slug === id);
  if (project) return { id, title: project.title, detail: project.kind, accent: project.accent, href: `#work-${id}` };
  const entry = DATA.journey.find((j) => j.id === id);
  if (entry) return { id, title: entry.org, detail: entry.roles[0].title, accent: entry.accent, href: `#journey-${id}` };
  return null;
}
