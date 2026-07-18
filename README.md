# My Personal Website

This is my personal site and blog. Built it with React and Vite because I wanted something fast and type-safe.

## What it does

- Shows my profile on the sidebar
- Pulls in my Mastodon feed automatically (gotta display that profile image from there)
- Lists my blog posts with pagination
- Has SEO/meta stuff hooked up for sharing

## Tech I used

React 19, TypeScript, Vite, TanStack Router, React Query, and Ant Design for UI.

## Running it

Dev mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the built version:
```bash
npm run preview
```

## Useful commands

- `npm run lint` - Check for linting issues
- `npm run build` - Full build with TypeScript checking

## Notes to self

- The Mastodon feed integration fetches the profile image dynamically
- Blog pagination is handled through routing (`/posts/$page`)
- SEO metadata is centralized in the utils, makes it easy to update
