# Portfolio

Personal site of Divyanshu Agrahari. Every project on the page is a small, running version of the real app rather than a screenshot, and the page's accent colour follows whichever project is on screen.

## Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4
- Motion, Lenis, cmdk
- Content Collections + MDX for the blog
- Shiki for code excerpts

## Getting started

Requires Node.js 20 or later.

```bash
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

## Structure

```
src/
  app/            routes: home, /projects/[slug], /blog, OG images, sitemap
  components/
    sections/     home page sections
    minis/        live miniatures of each project
    build-log/    project page parts: diagram, code excerpt, demo
    backgrounds/  circuit field, rulers, oscilloscope trace
    site/         nav, command palette, buttons, theme toggle
  data/           all site content
content/          MDX blog posts
scripts/          quote-traces.py
```

All text shown on the site lives in `src/data/`. Components don't hardcode content.

After editing `contact.quotes` in `src/data/resume.tsx`, regenerate the oscilloscope quote outlines:

```bash
python scripts/quote-traces.py
```

## Deploy

Deploys to Vercel as a standard Next.js project with no extra settings.

## Credits

Started from [magicuidesign/portfolio](https://github.com/magicuidesign/portfolio) (MIT). See [LICENSE](./LICENSE).
