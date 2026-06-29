/*
 * Build logs: the problems I hit on each project, how I solved them, what it
 * cost, and what I took away. Rendered on /projects/[slug] and previewed in
 * each project chapter on the home page.
 *
 * Sources: each repo's architecture decision records and code (BitBin, VibeCraft,
 * ThaparGenie, PayFlo on the Desktop) and the résumé (TeleMetrix, DAQ).
 * - Problem, solution and trade-off lines restate the repos' own docs.
 * - `// SAMPLE:` marks wording Divyanshu should rewrite in his own voice (mostly takeaways).
 * - `// CHECK:` marks framing I inferred and he should confirm.
 * - Demo timings are illustrative and labelled that way on the page.
 */

export type LogLine = { text: string; tone?: "ok" | "bad" | "acc" | "dim" };

export type Demo =
  | {
      kind: "compare";
      caption: string;
      before: { label: string; lines: LogLine[] };
      after: { label: string; lines: LogLine[] };
    }
  | {
      kind: "race";
      caption: string;
      lanes: { label: string; segments: { label: string; weight: number; tone?: "bad" | "ok" | "acc" }[] }[];
    }
  | {
      kind: "rank";
      caption: string;
      lists: { label: string; items: string[] }[];
    }
  | { kind: "signal"; caption: string };

export type BuildStep = {
  id: string;
  title: string;
  problem: string;
  solution: string;
  tradeoff: string;
  takeaway: string;
  code?: { file: string; lang: "java" | "ts" | "python" | "cpp"; snippet: string };
  demo?: Demo;
};

export type Architecture = {
  nodes: { id: string; label: string; x: number; y: number; tone?: "acc" | "muted" }[];
  edges: { from: string; to: string; label?: string }[];
};

export type BuildLog = {
  slug: string;
  role: string;
  when: string;
  context: string;
  architecture: Architecture;
  steps: BuildStep[];
  takeaways: string[];
};

export const BUILD_LOGS: BuildLog[] = [
  {
    slug: "vibecraft",
    role: "Solo: architecture, backend, frontend, infrastructure",
    when: "2025–26", // CHECK: dates
    context:
      "VibeCraft turns a one-line idea into a running project. The hard part is not calling a model: it is running code nobody has reviewed, keeping a project consistent when a turn fails halfway, and doing it on a single free-tier machine.",
    architecture: {
      nodes: [
        { id: "web", label: "React SPA", x: 8, y: 30 },
        { id: "gw", label: "API gateway", x: 30, y: 30, tone: "acc" },
        { id: "acc", label: "account-service", x: 54, y: 8 },
        { id: "ai", label: "intelligence-service", x: 54, y: 30 },
        { id: "ws", label: "workspace-service", x: 54, y: 52 },
        { id: "llm", label: "LLM (OpenRouter)", x: 82, y: 30, tone: "muted" },
        { id: "minio", label: "MinIO revisions", x: 82, y: 52, tone: "muted" },
        { id: "pods", label: "Runner pods (k3s)", x: 82, y: 74, tone: "acc" },
        { id: "proxy", label: "Preview proxy", x: 30, y: 74 },
      ],
      edges: [
        { from: "web", to: "gw" },
        { from: "gw", to: "acc" },
        { from: "gw", to: "ai" },
        { from: "gw", to: "ws" },
        { from: "ai", to: "llm", label: "stream" },
        { from: "ai", to: "ws", label: "publish" },
        { from: "ws", to: "minio" },
        { from: "ws", to: "pods", label: "exec" },
        { from: "web", to: "proxy", label: "iframe" },
        { from: "proxy", to: "pods" },
      ],
    },
    steps: [
      {
        id: "sandbox",
        title: "Running code nobody has reviewed",
        problem:
          "A live preview means running npm install and arbitrary AI-written code. Anywhere near the backend, that code could reach secrets, databases and the services' network.",
        solution:
          "Generated code runs only in disposable runner pods in their own namespace, reached through the Kubernetes exec API. Pods run as non-root with every capability dropped, no service-account token, a PID limit, and a NetworkPolicy that only admits the preview proxy. A preview hostname is not a credential: the proxy checks an HMAC-signed, expiring token.",
        tradeoff: "Live previews need a real Kubernetes cluster, even locally, and capacity is bounded by the cluster.",
        // SAMPLE:
        takeaway: "Decide where untrusted code is allowed to run before building the feature. The rest of the design followed from that boundary.",
        demo: {
          kind: "compare",
          caption: "What generated code can reach",
          before: {
            label: "In a backend process",
            lines: [
              { text: "$ npm install left-pad-ish" },
              { text: "postinstall: read process.env.DB_PASSWORD", tone: "bad" },
              { text: "postinstall: GET http://169.254.169.254/ (cloud metadata)", tone: "bad" },
              { text: "postinstall: connect postgres:5432", tone: "bad" },
            ],
          },
          after: {
            label: "In a runner pod",
            lines: [
              { text: "$ npm install left-pad-ish" },
              { text: "env: no secrets mounted, no service-account token", tone: "ok" },
              { text: "GET 169.254.169.254 → blocked by NetworkPolicy", tone: "ok" },
              { text: "connect postgres:5432 → blocked by NetworkPolicy", tone: "ok" },
              { text: "vite dev → reachable only through the preview proxy", tone: "acc" },
            ],
          },
        },
      },
      {
        id: "claim-race",
        title: "Two users, one idle pod",
        problem:
          "Previews claim a warm pod from a pool. When two previews start at the same moment, both can list the same idle pod and both believe they own it.",
        solution:
          "The claim is a JSON merge patch that carries the resourceVersion the pod was listed with. The Kubernetes API server enforces it, so exactly one claim wins; the loser gets a 409 and moves on to the next idle pod. Relabelling the pod to busy also detaches it from the pool, which starts warming a replacement.",
        tradeoff: "Claims depend on the cluster answering; an unreachable API server surfaces as its own error instead of a silent retry loop.",
        // SAMPLE:
        takeaway: "Before writing a lock, check whether the platform already gives you optimistic concurrency. Kubernetes did.",
        code: {
          file: "workspace-service/…/PreviewRunnerPool.java",
          lang: "java",
          snippet: `for (Pod pod : idle) {
    String patch = json(claimPatch(pod, projectId, Instant.now()));
    try {
        Pod claimed = pods().withName(pod.getMetadata().getName())
                .patch(PatchContext.of(PatchType.JSON_MERGE), patch);
        return Optional.of(claimed);
    } catch (KubernetesClientException e) {
        if (e.getCode() != 409) throw e;
        // claimed by someone else first, try the next one
    }
}

static Pod claimPatch(Pod idle, Long projectId, Instant claimedAt) {
    return new PodBuilder().withNewMetadata()
            .withResourceVersion(idle.getMetadata().getResourceVersion())
            .addToLabels(POOL_LABEL, BUSY)
            .addToLabels(PROJECT_LABEL, projectId.toString())
            .endMetadata().build();
}`,
        },
        demo: {
          kind: "compare",
          caption: "Two previews claim at the same moment",
          before: {
            label: "Plain update",
            lines: [
              { text: "A: list idle → runner-7f2" },
              { text: "B: list idle → runner-7f2" },
              { text: "A: label runner-7f2 busy · project 12" },
              { text: "B: label runner-7f2 busy · project 31", tone: "bad" },
              { text: "two projects syncing into one pod", tone: "bad" },
            ],
          },
          after: {
            label: "Patch with resourceVersion",
            lines: [
              { text: "A: list idle → runner-7f2 @ rv 4412" },
              { text: "B: list idle → runner-7f2 @ rv 4412" },
              { text: "A: patch rv 4412 → 200, claimed", tone: "ok" },
              { text: "B: patch rv 4412 → 409 Conflict", tone: "acc" },
              { text: "B: try runner-9c1 → 200, claimed", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "revisions",
        title: "Half-written projects after a failed turn",
        problem:
          "AI turns first wrote each file straight over the old one, one call per file. A failure partway left the project half updated, there was no history to go back to, and two writers could interleave.",
        solution:
          "Every change set is published as one immutable revision: stage content by SHA-256, record a manifest, apply entries with rollback if any fails, then publish with a compare-and-swap on the project's current revision so concurrent publishers serialize to one winner. Restoring an old revision publishes the diff back as a new one.",
        tradeoff: "Blobs are never deleted yet, so storage grows until garbage collection exists; a crash between apply steps can leave a revision in STAGING.",
        // SAMPLE:
        takeaway: "All-or-nothing writes made undo, restore and collaboration fall out almost for free. I test this path against real Postgres and MinIO with Testcontainers.",
        code: {
          file: "workspace-service/…/RevisionPublisherImpl.java",
          lang: "java",
          snippet: `for (StagedEntry entry : staged) {
    try {
        applyEntry(projectId, entry);
        applied.add(entry);
    } catch (Exception e) {
        rollback(projectId, applied);          // undo this turn's writes
        manifestStore.markFailed(revisionId, "Failed to apply " + entry.path());
        return failed(revisionId);
    }
}

boolean won = manifestStore.applyAndAdvance(project, actualParentId, revisionId, staged);
if (!won) {                                    // lost the compare-and-swap
    rollback(projectId, applied);
    manifestStore.markConflict(revisionId);
    return conflict(revisionId);
}`,
        },
        demo: {
          kind: "compare",
          caption: "A turn fails on its third file",
          before: {
            label: "Write files in place",
            lines: [
              { text: "write src/App.tsx ✓" },
              { text: "write src/Habit.tsx ✓" },
              { text: "write src/streak.ts ✕ storage timeout", tone: "bad" },
              { text: "project: 2 of 3 files new, app no longer builds", tone: "bad" },
              { text: "history: none", tone: "bad" },
            ],
          },
          after: {
            label: "Staged revision",
            lines: [
              { text: "stage 3 blobs by sha256 · manifest rev 14" },
              { text: "apply src/App.tsx ✓ · src/Habit.tsx ✓" },
              { text: "apply src/streak.ts ✕ storage timeout", tone: "bad" },
              { text: "rollback 2 applied paths · rev 14 FAILED", tone: "acc" },
              { text: "project still at rev 13, preview unchanged", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "warm-pool",
        title: "Previews waiting on npm install",
        problem: "The first start of a preview is dominated by npm install inside the pod, which made the \"watch it build\" moment feel slow.",
        solution:
          "A warm pool of runner pods whose init container seeds node_modules from a pre-built runner image, so a claimed pod usually only has to sync files and start Vite. Start is serialized per project, so collaborators opening the preview together share one runner.",
        tradeoff: "Idle pods cost memory on a single node; CPU, not memory, limits how many previews can start at once.",
        // SAMPLE:
        takeaway: "The biggest latency win was moving work to before the user asked, not making the work faster.",
        demo: {
          kind: "race",
          caption: "Time to first preview (illustrative, not measured)",
          lanes: [
            {
              label: "Cold pod",
              segments: [
                { label: "schedule pod", weight: 2 },
                { label: "npm install", weight: 10, tone: "bad" },
                { label: "sync files", weight: 1 },
                { label: "vite dev", weight: 1.5 },
              ],
            },
            {
              label: "Warm pool",
              segments: [
                { label: "claim", weight: 0.5, tone: "ok" },
                { label: "sync files", weight: 1 },
                { label: "vite dev", weight: 1.5, tone: "ok" },
              ],
            },
          ],
        },
      },
    ],
    // SAMPLE:
    takeaways: [
      "Isolation, consistency and cost shaped the architecture more than the AI did.",
      "Writing an ADR for each hard decision kept a solo project honest about its trade-offs.",
      "Portable Kustomize overlays let me rehearse on kind and ship to a $0 k3s node with the same manifests.",
    ],
  },

  {
    slug: "bitbin",
    role: "Solo: product, design, full stack, extension",
    when: "2025", // CHECK: dates
    context:
      "BitBin is one Next.js app with no separate API server. Most of the interesting work was at the edges: plans that change from outside the request, a browser extension that can't use the app's own entry points, and third-party services that can fail.",
    architecture: {
      nodes: [
        { id: "web", label: "Browser", x: 8, y: 22 },
        { id: "ext", label: "Chrome extension", x: 8, y: 58 },
        { id: "app", label: "Next.js app", x: 38, y: 22, tone: "acc" },
        { id: "api", label: "/api/v1 token API", x: 38, y: 58, tone: "acc" },
        { id: "core", label: "createItemForUser", x: 62, y: 40 },
        { id: "db", label: "Postgres (Prisma)", x: 88, y: 18, tone: "muted" },
        { id: "r2", label: "Cloudflare R2", x: 88, y: 40, tone: "muted" },
        { id: "redis", label: "Upstash Redis", x: 88, y: 62, tone: "muted" },
        { id: "stripe", label: "Stripe webhooks", x: 62, y: 80, tone: "muted" },
      ],
      edges: [
        { from: "web", to: "app", label: "server actions" },
        { from: "ext", to: "api", label: "Bearer bb_…" },
        { from: "app", to: "core" },
        { from: "api", to: "core" },
        { from: "core", to: "db" },
        { from: "app", to: "r2" },
        { from: "api", to: "redis", label: "rate limit" },
        { from: "stripe", to: "db", label: "isPro" },
      ],
    },
    steps: [
      {
        id: "live-plan",
        title: "Upgrades that didn't show up until sign-out",
        problem:
          "The proxy can't reach the database, so sessions are JWTs. But a user's plan changes from outside the request: a Stripe webhook can upgrade or downgrade someone who is signed in, and a plan copied into the token at sign-in would stay wrong.",
        solution:
          "The jwt callback puts the user id on the token at sign-in and re-reads isPro from the database every time it runs. The rest of the app trusts session.user.isPro; the upload route checks again as a second guard.",
        tradeoff: "Every session evaluation costs one small primary-key query, and JWTs still can't be revoked server-side.",
        // SAMPLE:
        takeaway: "Any value that can change outside the request cycle doesn't belong frozen in a token.",
        code: {
          file: "src/auth.ts",
          lang: "ts",
          snippet: `async jwt({ token, user }) {
  if (user?.id) token.id = user.id

  // Sync isPro from the database on every evaluation, so a
  // Stripe webhook's change shows up on the next request
  if (token.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { isPro: true },
    })
    token.isPro = dbUser?.isPro ?? false
  }
  return token
}`,
        },
        demo: {
          kind: "compare",
          caption: "A signed-in user upgrades to Pro",
          before: {
            label: "Plan copied at sign-in",
            lines: [
              { text: "sign in → token { isPro: false }" },
              { text: "stripe: checkout.session.completed → users.isPro = true" },
              { text: "upload image → 403 Pro only", tone: "bad" },
              { text: "…still free until the user signs out", tone: "bad" },
            ],
          },
          after: {
            label: "Plan re-read each evaluation",
            lines: [
              { text: "sign in → token { id }" },
              { text: "stripe: checkout.session.completed → users.isPro = true" },
              { text: "next request: jwt() reads isPro = true", tone: "acc" },
              { text: "upload image → 200", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "token-api",
        title: "Giving the extension its own door",
        problem:
          "Server actions are an internal Next.js protocol tied to the app's build, and the session cookie belongs to the site. An extension (and later a desktop app) needed a credential that doesn't depend on a browser session.",
        solution:
          "A small versioned /api/v1 authenticated only by personal access tokens: bb_ plus 32 random bytes, shown once, stored as a SHA-256 hash. Every request re-reads the plan and is rate limited per user. The endpoints reuse the same functions as the app (createItemForUser, suggestTagsForUser), so validation lives in one place.",
        tradeoff: "BitBin now has an external contract: /api/v1 responses must stay backward compatible, and long-lived tokens have no expiry yet.",
        // SAMPLE:
        takeaway: "One validation path shared by two clients removed a whole class of drift bugs.",
        code: {
          file: "src/lib/api-auth.ts",
          lang: "ts",
          snippet: `export async function authenticateApiRequest(request: Request) {
  const token = readBearerToken(request.headers.get('authorization'))
  if (!token) return { response: apiError('Missing or malformed API token', 401) }

  // Only the SHA-256 hash is stored; the token itself is shown once
  const found = await findApiTokenByHash(hashApiToken(token))
  if (!found) return { response: apiError('Invalid or revoked API token', 401) }

  // Re-read the plan on every call: a cancelled subscription loses access next request
  if (!found.user.isPro) {
    return { response: apiError('The BitBin extension requires a Pro subscription', 403) }
  }
  // …per-user rate limit, then hand back the owner's id
}`,
        },
      },
      {
        id: "fail-open",
        title: "When the rate limiter itself goes down",
        problem:
          "Sign-in, uploads and AI helpers need rate limits, and serverless functions share no memory, so the counters live in Upstash Redis. That makes Redis part of the sign-in path.",
        solution:
          "One sliding-window limiter per action, keyed by IP plus an identifier, that fails open: missing config or a Redis error logs loudly and lets the request through. Local development works with no Redis at all.",
        tradeoff: "An outage silently removes every limit, including brute-force protection on sign-in, so production should alert on the failure log line.",
        // SAMPLE:
        takeaway: "Choosing fail-open versus fail-closed is a product decision. Writing the trade-off down made it a deliberate one.",
        code: {
          file: "src/lib/rate-limit.ts",
          lang: "ts",
          snippet: `  } catch (error) {
    // Fail open on errors: an Upstash outage must never lock users out
    console.error('Rate limit check failed:', error)
    return { success: true, remaining: -1, reset: 0, retryAfter: 0 }
  }`,
        },
        demo: {
          kind: "compare",
          caption: "Upstash stops answering during sign-in",
          before: {
            label: "Fail closed",
            lines: [
              { text: "POST /login · rate check → ECONNRESET" },
              { text: "503 Service unavailable", tone: "bad" },
              { text: "every user locked out until Redis recovers", tone: "bad" },
            ],
          },
          after: {
            label: "Fail open (chosen)",
            lines: [
              { text: "POST /login · rate check → ECONNRESET" },
              { text: "error: Rate limit check failed (alert)", tone: "acc" },
              { text: "200 signed in", tone: "ok" },
            ],
          },
        },
      },
    ],
    // SAMPLE:
    takeaways: [
      "Server actions for every write kept auth, validation and plan checks in one predictable place.",
      "Documenting known gaps next to decisions made the codebase easier to hand over.",
    ],
  },

  {
    slug: "thapargenie",
    role: "Solo: retrieval pipeline, backend, admin dashboard, frontend",
    when: "2025", // CHECK: dates
    context:
      "Students ask about fees, hostels, exams and rules in their own words, with Thapar abbreviations and course codes. The assistant has to find the right page among 1,300+ documents and must never invent a number.",
    architecture: {
      nodes: [
        { id: "spa", label: "React app", x: 8, y: 30 },
        { id: "api", label: "Django API (SSE)", x: 32, y: 30, tone: "acc" },
        { id: "analysis", label: "Question analysis", x: 56, y: 10 },
        { id: "search", label: "Hybrid search + RRF", x: 56, y: 32, tone: "acc" },
        { id: "ground", label: "Grounding check", x: 56, y: 54 },
        { id: "pg", label: "Postgres + pgvector", x: 84, y: 32, tone: "muted" },
        { id: "llm", label: "Gemini", x: 84, y: 10, tone: "muted" },
        { id: "ingest", label: "Ingestion pipeline", x: 84, y: 60 },
        { id: "admin", label: "Admin dashboard", x: 32, y: 66 },
      ],
      edges: [
        { from: "spa", to: "api" },
        { from: "api", to: "analysis" },
        { from: "analysis", to: "llm" },
        { from: "api", to: "search" },
        { from: "search", to: "pg" },
        { from: "api", to: "ground" },
        { from: "ingest", to: "pg", label: "passages" },
        { from: "admin", to: "ingest" },
      ],
    },
    steps: [
      {
        id: "hybrid",
        title: "One kind of search wasn't enough",
        // CHECK: framing inferred from docs/answer-pipeline.md
        problem:
          "Questions mix fuzzy phrasing with exact tokens like course codes and Thapar abbreviations. Vector similarity handles the phrasing, keyword search handles the exact terms; neither alone reliably put the right passage first.",
        solution:
          "Each phrasing from the analysis step is searched with pgvector while the keywords, with Thapar abbreviations expanded, go through Postgres full-text search in parallel. Reciprocal rank fusion merges the lists, small boosts favour current documents, and near-duplicate passages are dropped.",
        tradeoff: "Two searches per question and a fusion step to tune; the reranker is available but off by default to keep latency down.",
        // SAMPLE:
        takeaway: "Retrieval quality mattered more than which model wrote the answer.",
        code: {
          file: "backend/rag/retrieve.py",
          lang: "python",
          snippet: `RRF_K = 60

def fuse(lists, k=RRF_K):
    """Reciprocal rank fusion: sum of 1 / (k + rank) over every list a chunk appears in."""
    scores, ranks = {}, {}
    for name, ids in lists.items():
        for rank, chunk_id in enumerate(ids, start=1):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (k + rank)
            ranks.setdefault(chunk_id, {})[name] = rank
    return scores, ranks`,
        },
        demo: {
          kind: "rank",
          caption: "Fusing two ranked lists (illustrative passages)",
          lists: [
            { label: "Vector", items: ["Hostel rules §4", "Fee structure p.2", "Mess charges", "Exam notice"] },
            { label: "Full text", items: ["Fee structure p.2", "Refund policy", "Hostel rules §4", "Exam notice"] },
          ],
        },
      },
      {
        id: "grounding",
        title: "Answers must not invent numbers",
        problem: "Fees, dates and years are exactly what students ask about, and exactly what a language model is most likely to get subtly wrong.",
        solution:
          "After streaming, every figure in the answer (amounts, years, dates in any format) must appear in a source it cites, including that source's title, section and year. If one doesn't, the answer is flagged for the student. Only grounded, cited answers are ever cached.",
        tradeoff: "A flagged answer still shows; the check warns instead of blocking, and it only understands figures, not every kind of claim.",
        // SAMPLE:
        takeaway: "A cheap, deterministic check after the model beat trying to prompt the problem away.",
        code: {
          file: "backend/rag/grounding.py",
          lang: "python",
          snippet: `def check(answer, sources, question=''):
    cited = cited_numbers(answer, len(sources))
    # If the model cited nothing, check against everything it was given.
    pool = [s for s in sources if s.number in cited] or list(sources)
    available = set()
    for source in pool:
        header = ' '.join((source.title, source.heading_path, source.academic_year))
        available |= figures(f'{header}\\n{source.content}')
    available |= figures(question)
    unsupported = sorted(
        f for f in figures(answer) if f not in available and len(f) > 1
    )
    return Grounding(cited=cited, unsupported=unsupported)`,
        },
        demo: {
          kind: "compare",
          caption: "Checking the figures in one answer (illustrative)",
          before: {
            label: "Without the check",
            lines: [
              { text: "answer: \"The hostel fee is ₹1,20,000 [1], due by 15 July [2].\"" },
              { text: "student sees a confident answer", tone: "dim" },
              { text: "source [2] actually says 31 July", tone: "bad" },
            ],
          },
          after: {
            label: "With the grounding check",
            lines: [
              { text: "figures in answer: 1,20,000 · 15 July" },
              { text: "1,20,000 found in [1] ✓", tone: "ok" },
              { text: "15 July not found in [2] ✕", tone: "bad" },
              { text: "answer flagged: check the cited source", tone: "acc" },
            ],
          },
        },
      },
      {
        id: "recall",
        title: "Knowing when search got worse",
        problem: "Every new document, chunking change or prompt tweak could quietly make retrieval worse, and nobody would notice until students got bad answers.",
        solution:
          "A golden set of questions with the pages that should be found. eval_rag reports recall@5, recall@10 and MRR, a nightly check warns when recall@5 drops, and ask --trace shows every step of the pipeline for one question.",
        tradeoff: "The golden set has to be maintained as the documents change.",
        // SAMPLE:
        takeaway: "Treat retrieval like code: it needs tests that fail when it regresses.",
        demo: {
          kind: "compare",
          caption: "A chunking change ships (illustrative)",
          before: {
            label: "No evaluation",
            lines: [
              { text: "deploy: new table chunking" },
              { text: "fee questions start citing the wrong page", tone: "bad" },
              { text: "found weeks later from thumbs-down feedback", tone: "bad" },
            ],
          },
          after: {
            label: "Nightly recall@5",
            lines: [
              { text: "deploy: new table chunking" },
              { text: "02:00 eval_rag · recall@5 below threshold", tone: "bad" },
              { text: "warning raised, trace shows split fee table", tone: "acc" },
              { text: "fix: keep tables whole, split by rows", tone: "ok" },
            ],
          },
        },
      },
    ],
    // SAMPLE:
    takeaways: [
      "Most of the product is the admin side: ingestion, knowledge gaps and feedback decide answer quality.",
      "Security for a public college tool meant approval-based access, per-user AI limits and row-level security from day one.",
    ],
  },

  {
    slug: "payflo",
    role: "Solo: design and implementation",
    when: "2025–26", // CHECK: dates
    context:
      "PayFlo started as a monolith with domain packages and no cross-domain foreign keys, then split into services. Splitting turned in-process calls into network calls, and every classic distributed-systems problem showed up on the payment path.",
    architecture: {
      nodes: [
        { id: "merchant", label: "Merchant backend", x: 8, y: 30 },
        { id: "gw", label: "API gateway", x: 30, y: 30, tone: "acc" },
        { id: "pay", label: "payment-service", x: 54, y: 16, tone: "acc" },
        { id: "vault", label: "vault-service", x: 82, y: 16 },
        { id: "mer", label: "merchant-service", x: 54, y: 46 },
        { id: "kafka", label: "Kafka", x: 82, y: 46, tone: "muted" },
        { id: "ops", label: "operations-service", x: 82, y: 74 },
        { id: "hooks", label: "Webhooks", x: 54, y: 74 },
      ],
      edges: [
        { from: "merchant", to: "gw", label: "API key" },
        { from: "gw", to: "pay" },
        { from: "gw", to: "mer" },
        { from: "pay", to: "vault", label: "card" },
        { from: "pay", to: "kafka", label: "outbox" },
        { from: "kafka", to: "ops" },
        { from: "ops", to: "hooks", label: "HMAC" },
      ],
    },
    steps: [
      {
        id: "idempotency",
        title: "A retried request must not charge twice",
        problem: "Merchants retry when a call times out. Without protection, a retry after a slow-but-successful attempt creates a second payment.",
        solution: "A repeated request with the same X-Idempotency-Key returns the payment already created under that key for this merchant instead of starting a new attempt.",
        tradeoff: "Merchants have to send a stable key per logical payment; requests without one get a generated key and no replay protection.",
        // SAMPLE:
        takeaway: "Idempotency is a contract with the client, not just a database constraint.",
        code: {
          file: "payment-service/…/PaymentAuthorizationRecorder.java",
          lang: "java",
          snippet: `@Transactional(readOnly = true)
public Optional<PaymentResponse> findExistingAttempt(UUID merchantId, String idempotencyKey) {
    return paymentRepository.findByMerchantIdAndIdempotencyKey(merchantId, idempotencyKey)
            .map(paymentMapper::toResponse);
}`,
        },
        demo: {
          kind: "compare",
          caption: "The first call times out on the client, then it retries",
          before: {
            label: "No idempotency key",
            lines: [
              { text: "POST /payments ₹2,499 → (client timeout)" },
              { text: "server: payment p_81 AUTHORIZED" },
              { text: "retry POST /payments ₹2,499" },
              { text: "server: payment p_82 AUTHORIZED", tone: "bad" },
              { text: "customer charged 2×", tone: "bad" },
            ],
          },
          after: {
            label: "X-Idempotency-Key: 7f3a…",
            lines: [
              { text: "POST /payments ₹2,499 key 7f3a → (client timeout)" },
              { text: "server: payment p_81 AUTHORIZED" },
              { text: "retry POST /payments key 7f3a" },
              { text: "replay: returns p_81", tone: "acc" },
              { text: "customer charged 1×", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "outbox",
        title: "Events lost between the database and Kafka",
        problem:
          "When a payment changes state, operations-service has to hear about it. Sending to Kafka inside the request is a dual write: a crash between the commit and the send loses the event or announces a change that rolled back.",
        solution:
          "Services never call Kafka from a request. They write an outbox row in the same transaction as the domain change; a ShedLock-guarded poller publishes pending rows oldest first in batches of 500 and marks them PUBLISHED only once Kafka acknowledges.",
        tradeoff: "Delivery is at-least-once and a few seconds late, so consumers must tolerate duplicates; rows that fail three times wait for a person.",
        // SAMPLE:
        takeaway: "If two systems can't commit together, make one of them the source of truth and let the other catch up.",
        code: {
          file: "operations-service/…/OutboxPoller.java",
          lang: "java",
          snippet: `@Scheduled(fixedDelay = 5000)
@SchedulerLock(name = "operations-service-outbox-poller", lockAtMostFor = "1m")
public void poll() {
    long deadline = System.currentTimeMillis() + MAX_RUN_MILLIS;
    List<OutboxEvent> batch;
    do {
        batch = outboxEventRepository.findTop500ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        publishBatch(batch);   // marked PUBLISHED only once Kafka acks
    } while (batch.size() == BATCH_SIZE && System.currentTimeMillis() < deadline);
}`,
        },
        demo: {
          kind: "compare",
          caption: "The service crashes right after committing",
          before: {
            label: "Dual write",
            lines: [
              { text: "tx: payment p_81 → CAPTURED · commit ✓" },
              { text: "kafka.send(payment.captured)…" },
              { text: "process killed", tone: "bad" },
              { text: "merchant never gets the webhook", tone: "bad" },
            ],
          },
          after: {
            label: "Transactional outbox",
            lines: [
              { text: "tx: p_81 → CAPTURED + outbox row PENDING · commit ✓" },
              { text: "process killed", tone: "bad" },
              { text: "restart · poller finds 1 PENDING row", tone: "acc" },
              { text: "kafka ack → PUBLISHED · webhook 200", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "saga",
        title: "A slow bank could exhaust the connection pool",
        problem:
          "Initiating a payment locks the order, creates the payment, calls the acquirer over the network and records the result. In one transaction, a slow acquirer holds a connection and row locks for the whole call.",
        solution:
          "A saga: record the payment in one short transaction, call the payment adapter with no transaction open, apply the result in a second transaction with its outbox event, and compensate to FAILED if the call throws.",
        tradeoff: "Between the steps a payment is visibly AUTHORIZING, and a crash there needs the callback simulator to resolve it.",
        // SAMPLE:
        takeaway: "Never hold a database connection across a network call you don't control.",
        demo: {
          kind: "race",
          caption: "Connection held per payment (illustrative)",
          lanes: [
            {
              label: "One transaction",
              segments: [
                { label: "lock + insert", weight: 1 },
                { label: "call acquirer (connection held)", weight: 8, tone: "bad" },
                { label: "record", weight: 1 },
              ],
            },
            {
              label: "Saga",
              segments: [
                { label: "tx 1", weight: 1, tone: "ok" },
                { label: "call acquirer (no connection)", weight: 8, tone: "acc" },
                { label: "tx 2", weight: 1, tone: "ok" },
              ],
            },
          ],
        },
      },
    ],
    // SAMPLE:
    takeaways: [
      "Building the monolith first with clean domain boundaries made the split mostly mechanical.",
      "Isolating PCI-scoped card data in its own vault kept the rest of the system out of scope.",
    ],
  },

  {
    slug: "telemetrix",
    role: "Electronics & DAQ engineer, Team Fateh",
    when: "2022–24",
    context: "Track-side engineers needed to see the car's data live while it ran, over a radio link that drops and corrupts bytes.",
    architecture: {
      nodes: [
        { id: "sensors", label: "Car sensors", x: 8, y: 30 },
        { id: "esp", label: "ESP32 DAQ", x: 30, y: 30, tone: "acc" },
        { id: "xbee", label: "XBee link", x: 52, y: 30 },
        { id: "serial", label: "Serial 230,400 baud", x: 74, y: 30 },
        { id: "dash", label: "Processing dashboard", x: 74, y: 62, tone: "acc" },
        { id: "sim", label: "Arduino simulator", x: 40, y: 62, tone: "muted" },
      ],
      edges: [
        { from: "sensors", to: "esp" },
        { from: "esp", to: "xbee" },
        { from: "xbee", to: "serial" },
        { from: "serial", to: "dash", label: "frames" },
        { from: "sim", to: "serial", label: "bench" },
      ],
    },
    steps: [
      {
        id: "frames",
        title: "Corrupted frames reaching the gauges",
        // CHECK: symptom described from the résumé bullet
        problem: "Over radio, bytes get dropped and frames arrive short or merged. Parsing them blindly would push garbage values onto the live gauges.",
        solution: "Every frame's field count is validated before parsing; malformed frames are dropped so they never reach the display.",
        tradeoff: "A dropped frame is a small gap in the traces instead of a wrong value.",
        // SAMPLE:
        takeaway: "On a lossy link, a missing sample is better than a wrong one.",
        demo: {
          kind: "compare",
          caption: "One corrupted frame arrives (illustrative)",
          before: {
            label: "Parse everything",
            lines: [
              { text: "$,62,7400,3,0.41,…  ok" },
              { text: "$,63,74$,3,0.4  (merged, short)", tone: "bad" },
              { text: "gauge: speed 74, rpm 3 → spike", tone: "bad" },
            ],
          },
          after: {
            label: "Validate field count",
            lines: [
              { text: "$,62,7400,3,0.41,…  12 fields ✓", tone: "ok" },
              { text: "$,63,74$,3,0.4  5 fields ✕ dropped", tone: "acc" },
              { text: "gauges hold last good value", tone: "ok" },
            ],
          },
        },
      },
      {
        id: "simulator",
        title: "Testing without the car",
        problem: "The car isn't always available, and a dashboard can't be developed only at the track.",
        solution: "An Arduino signal simulator that streams realistic frames over serial, so the whole dashboard can be bench-tested.",
        tradeoff: "Simulated signals only cover the cases I thought to simulate.",
        // SAMPLE:
        takeaway: "Build the test rig early; it paid for itself on the first bench session.",
      },
    ],
    // SAMPLE:
    takeaways: ["Designing for the failure mode of the link shaped the protocol more than the happy path did."],
  },

  {
    slug: "daq",
    role: "Electronics & DAQ engineer, Team Fateh",
    when: "2022–24",
    context: "The DAQ reads the ECU over CAN, brake pressure, gear and an IMU, drives the driver's dashboard, logs to microSD and streams over XBee at about 3 km, all on one ESP32.",
    architecture: {
      nodes: [
        { id: "ecu", label: "PE3 ECU (CAN 1 Mbps)", x: 8, y: 16 },
        { id: "imu", label: "MPU6050 (I2C)", x: 8, y: 44 },
        { id: "brake", label: "Brake / gear", x: 8, y: 72 },
        { id: "core0", label: "ESP32 core 0", x: 40, y: 30, tone: "acc" },
        { id: "core1", label: "ESP32 core 1", x: 40, y: 62, tone: "acc" },
        { id: "hmi", label: "Nextion dash + shift light", x: 76, y: 16 },
        { id: "sd", label: "microSD (SPI)", x: 76, y: 44, tone: "muted" },
        { id: "xbee", label: "XBee (~3 km)", x: 76, y: 72 },
      ],
      edges: [
        { from: "ecu", to: "core0" },
        { from: "imu", to: "core0" },
        { from: "brake", to: "core1" },
        { from: "core0", to: "hmi" },
        { from: "core1", to: "sd" },
        { from: "core1", to: "xbee" },
      ],
    },
    steps: [
      {
        id: "rtos",
        title: "One loop couldn't keep up",
        // CHECK: framing from the résumé's "4× performance boost at 30 Hz"
        problem: "Reading CAN, SPI, I2C and UART, updating the dashboard, logging and transmitting in one loop meant slow devices held up everything else.",
        solution: "FreeRTOS tasks split across the ESP32's two cores, so acquisition, display, logging and radio run on their own schedules. That gave a 4× performance boost at a steady 30 Hz data rate.",
        tradeoff: "Shared data between tasks needs queues and care about priorities.",
        // SAMPLE:
        takeaway: "Profile what blocks before optimising what computes.",
        demo: {
          kind: "race",
          caption: "One 30 Hz cycle (illustrative)",
          lanes: [
            {
              label: "Single loop",
              segments: [
                { label: "CAN", weight: 1 },
                { label: "IMU", weight: 1 },
                { label: "SD write", weight: 3, tone: "bad" },
                { label: "XBee", weight: 2 },
                { label: "dash", weight: 1 },
              ],
            },
            {
              label: "FreeRTOS, 2 cores",
              segments: [
                { label: "CAN + IMU", weight: 1, tone: "ok" },
                { label: "dash", weight: 1, tone: "ok" },
              ],
            },
          ],
        },
      },
      {
        id: "filter",
        title: "G-force readings the driver couldn't read",
        problem: "Raw IMU values jitter with engine vibration, so the G readout on the dashboard flickered.",
        solution: "A moving-average filter on the IMU readings for a stable display, alongside RPM-based speed estimation and a CAN watchdog.",
        tradeoff: "Smoothing adds a little lag to what the driver sees.",
        // SAMPLE:
        takeaway: "A display for a driver at speed has different requirements from a log for an engineer.",
        demo: { kind: "signal", caption: "Raw IMU vs moving average (synthetic)" },
      },
    ],
    // SAMPLE:
    takeaways: ["Hardware work taught me to design around timing and failure first, which I now do in software too."],
  },
];

export function getBuildLog(slug: string) {
  return BUILD_LOGS.find((log) => log.slug === slug);
}
