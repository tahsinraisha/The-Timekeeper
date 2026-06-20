# The Timekeeper

A scroll-driven cinematic 3D storytelling experience built with Next.js 14, React Three Fiber, and Drei.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: The Timekeeper experience"
gh repo create the-timekeeper --public --push
# or push to an existing repo:
# git remote add origin https://github.com/YOUR_USERNAME/the-timekeeper.git
# git push -u origin main
```

### 2. Import on Vercel
- Go to https://vercel.com/new
- Click **"Import Git Repository"**
- Select your `the-timekeeper` repo
- Framework preset: **Next.js** (auto-detected)
- Click **Deploy** — no env variables needed

### 3. Done
Vercel will build and deploy. You'll get a live URL immediately.

---

## Project Structure

```
timekeeper/
├── app/
│   ├── layout.jsx        # Root layout + metadata
│   ├── page.jsx          # Entry point (SSR-safe dynamic import)
│   └── globals.css       # Tailwind + global animations
├── components/
│   └── TimekeeperExperience.jsx  # Full 3D experience (client-only)
├── public/               # Static assets (empty — no external assets needed)
├── next.config.js        # Three.js transpilation config
├── tailwind.config.js
├── postcss.config.js
└── package.json          # Pinned dependency versions
```

## Tech Stack

| Library | Version | Role |
|---|---|---|
| Next.js | 14.2.5 | Framework + SSR/routing |
| React | 18.3.1 | UI |
| Three.js | 0.166.1 | 3D engine |
| @react-three/fiber | 8.17.6 | React renderer for Three.js |
| @react-three/drei | 9.109.2 | Three.js helpers (Stars, Float, Sparkles) |
| Tailwind CSS | 3.4.6 | Utility CSS |

## Why These Versions?

- `three@0.166` + `@react-three/fiber@8.17` + `@react-three/drei@9.109` are verified compatible
- Next.js 14 (not 15) is used because R3F's SSR handling is more stable on 14's Pages/App router
- If you upgrade any Three.js package, upgrade all three together

## Key Architecture Decisions

- **`ssr: false`** on the dynamic import in `page.jsx` — Three.js/WebGL cannot run server-side
- **`"use client"`** at top of `TimekeeperExperience.jsx` — required for hooks + Canvas
- **`transpilePackages`** in `next.config.js` — Next.js needs to transpile Three.js ESM internals
- All scroll state lives in a single `useRef`/`useCallback` — avoids re-render churn during scroll

## Customisation

- **Story text**: edit the `CHAPTERS` array in `TimekeeperExperience.jsx`
- **Colors**: edit the `T` design token object at the top of the file
- **Scroll speed**: change `SCROLL_PER_CHAPTER` (default: 800px per chapter)
- **New scenes**: add a new entry to `CHAPTERS` and a matching `<YourScene />` component
