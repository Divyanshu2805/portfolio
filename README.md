# Portfolio

Source for the personal site of Divyanshu Agrahari, a computer engineer who builds across hardware and software.

The site's idea is **"everything on the page is running."** Projects aren't screenshots. Each one appears as a small coded version of the real app that loops while it's on screen. The page itself is graphite and nearly colourless, and its accent colour changes to match the project you're looking at.

## Highlights

- **Live miniatures.** Every project has a coded, looping miniature of its real interface (`src/components/minis`). Miniatures only play while visible and the tab is active, and show a finished frame when reduced motion is on.
- **The accent follows the work.** Each project has its own brand colour. As a section crosses the middle of the viewport, the page accent eases to that colour.
- **Build logs.** Every project has a page at `/projects/[slug]`: an architecture diagram that draws itself, each hard problem written up as *the problem / what I built / what it cost*, real code excerpts highlighted at build time, and a small interactive demo.
- **Navigation.** A floating top bar with scroll-spy, a ⌘K / Ctrl K command palette, and a terminal in the contact section (`help`, `projects`, `log <project>`, `sudo hire-me`, …).
- **Backgrounds from the work itself.** A circuit board field behind the hero, drawing-sheet rulers down the page edges, and an oscilloscope trace that bends into short quotes. The footer has a race car that drives through and writes the name.
- **Blog.** Optional MDX posts at `/blog`, off by default.

## Tech stack

| Area | Choice | Why |
| --- | --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19 | Static generation for every page, route-level metadata and OG images, React view transitions between home and build logs |
| Language | TypeScript (strict) | |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) | Design tokens live as CSS variables in `src/app/globals.css`; light and dark themes follow the system |
| Animation | [Motion](https://motion.dev) | Scroll reveals, counters, miniatures. One easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` |
| Scrolling | [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling, turned off for reduced motion |
| Command palette | [cmdk](https://cmdk.paco.me) | ⌘K / Ctrl K search across sections, projects and links |
| Code highlighting | [Shiki](https://shiki.style) | Build-log excerpts are highlighted at build time in both themes |
| Blog | [Content Collections](https://www.content-collections.dev) + MDX | Type-checked frontmatter, compiled at build time |
| Themes | [next-themes](https://github.com/pacocoursey/next-themes) | System preference by default, with a manual toggle |
| Icons | [Lucide](https://lucide.dev) | |
| Type | Bricolage Grotesque, Geist, JetBrains Mono | Display, reading, and anything a machine would print |
| Hosting | [Vercel](https://vercel.com) | |

No WebGL or 3D libraries: everything is DOM, SVG or a plain 2D canvas, and animations stick to `transform`, `opacity` and colour.

## Getting started

Requires Node.js 20.9 or later.

```bash
git clone https://github.com/Divyanshu2805/portfolio.git
cd portfolio
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |

## Project structure

```
src/
  app/                  routes
    page.tsx            home
    projects/[slug]/    build-log pages
    blog/               blog index and posts
    opengraph-image.tsx social cards (also under blog/)
    sitemap.ts, robots.ts
  components/
    sections/           home sections: hero, work, journey, skills, contact, footer…
    minis/              live miniatures, one file per project
    build-log/          architecture diagram, code excerpt, demos, table of contents
    backgrounds/        circuit field, drawing-sheet rulers, oscilloscope trace
    site/               nav, command palette, buttons, text reveals, theme toggle
    blog/               MDX components and code blocks
  data/
    resume.tsx          profile, projects, journey, skills and section copy
    build-logs.ts       per-project problems, fixes, trade-offs and code excerpts
    quote-traces.ts     generated: quote outlines for the oscilloscope
  lib/                  helpers: scrolling, motion, OG images, posts
content/                blog posts (.mdx)
scripts/
  quote-traces.py       regenerates src/data/quote-traces.ts
```

## Editing content

All text on the site comes from `src/data/`. Components never hardcode content.

- **Profile, projects, journey, skills:** `src/data/resume.tsx`
- **Build logs:** `src/data/build-logs.ts`
- **Project colours:** the `--c-<key>` variables in `src/app/globals.css`

### Writing a post

1. Set `writing.enabled` to `true` in `src/data/resume.tsx`.
2. Add a file to `content/`. The file name becomes the URL (`content/my-post.mdx` → `/blog/my-post`).

```mdx
---
title: My post
date: "2026-07-03"
summary: One line shown in the list and on the social card.
---

Markdown, GitHub tables and fenced code blocks work.

<Figure src="/images/diagram.png" alt="What it shows" caption="Optional caption" />
```

### Oscilloscope quotes

The trace above the contact section draws `contact.quotes` in JetBrains Mono. After changing the quotes, run the dev server once (it caches the font), then:

```bash
pip install fonttools brotli
python scripts/quote-traces.py
```

## Accessibility and motion

- Every animation respects `prefers-reduced-motion`: it shows its final state, loops stop and smooth scrolling is off.
- Loops pause when off screen or when the tab is hidden.
- Semantic HTML, visible keyboard focus, a skip link and AA contrast in both themes.

## Deploying

The site deploys to Vercel as a standard Next.js project: import the repository and deploy, with no environment variables or extra settings. Set `url` in `src/data/resume.tsx` to the live address so the sitemap and social cards use it.
