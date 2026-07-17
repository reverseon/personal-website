# Ban inline `style=` in `src/` and migrate existing usages to CSS

## Context

The repo currently has 75 inline `style={{...}}` usages spread across 9 files in `src/`, plus several components that inject raw CSS via a runtime `<style>{...}</style>` tag for responsive media queries, and a few places that mutate `el.style.x = ...` imperatively from `onMouseEnter`/`onMouseLeave` handlers to fake `:hover` effects. The user wants inline styles **strictly prohibited** going forward, enforced automatically, and — per their answers — wants all 75 existing violations fixed now (not grandfathered), with enforcement limited to an ESLint rule (no CI workflow, no pre-commit hook requested).

The repo has no `eslint-plugin-react` installed (only `eslint-plugin-react-hooks` / `eslint-plugin-react-refresh`), so the ban will be implemented as a plain `no-restricted-syntax` rule in the existing flat `eslint.config.js` — no new dependency needed. The existing convention already used in `PostPage.tsx`/`PostPage.css` (colocated `Component.css` imported directly into the component) is the pattern to extend everywhere, rather than introducing CSS Modules or styled-components.

## Approach

### 1. ESLint enforcement (`eslint.config.js`)

Add a new flat-config block scoped to `files: ['src/**/*.{ts,tsx}']` (so it doesn't affect `vite.config.ts` etc.) with a `no-restricted-syntax` rule with two selectors:

- `JSXAttribute[name.name="style"]` — bans the `style={{...}}` / `style="..."` JSX prop directly (this is the literal ask).
- `AssignmentExpression[left.object.property.name="style"]` — bans imperative `el.style.foo = ...` mutation (the pattern currently used for fake hover effects in `Profile.tsx`, `PostsSidebar.tsx`, `components/blog/Feed.tsx`). Closing this loophole is necessary because otherwise "strictly prohibited" is trivially bypassed by moving the same inline style into a mouse handler instead of a JSX prop.

Each selector gets a clear custom message telling the author to add a class to a co-located CSS file instead.

### 2. Fix all 75 existing usages by migrating to colocated CSS

For each file below, create (or extend) a `Component.css` next to the component, import it at the top, replace every `style={{...}}` with a `className`, and fold any existing `<style>{...}</style>` runtime media-query block into that same CSS file as a real `@media` rule (then delete the JSX `<style>` tag). Where an element already has a `className`, its inline declarations are folded into that class's rule rather than adding a second class.

| File | New/extended CSS file | Notes |
|---|---|---|
| `src/App.tsx` | new `src/App.css` | Fold `.app-container`/`.app-sidebar`/`.app-main`/`.blog-heading` base rules + existing media block in; add `.blog-section`/`.blog-feed-list` for the two bare wrapper divs. |
| `src/components/Profile.tsx` | new `src/components/Profile.css` | Introduce `.profile-card`, `.profile-header`, `.profile-avatar`, `.profile-name`, `.profile-handle`, `.profile-tagline`, `.profile-info`, `.profile-info-row`, `.profile-links`, `.profile-link` (+ `--github`/`--linkedin`/`--instagram` modifiers). Replace the 3 `onMouseEnter`/`onMouseLeave` handlers that mutate `background`/`transform` with `.profile-link:hover` CSS rules; delete the handlers. |
| `src/components/MastodonFeed.tsx` | new `src/components/MastodonFeed.css` | Introduce `.mastodon-loading`, `.mastodon-error`, `.mastodon-feed`, `.mastodon-timeline-line`, `.mastodon-item`, `.mastodon-item-dot`, `.mastodon-item-title`, `.mastodon-item-date`, `.mastodon-footer`, `.mastodon-footer-link`, `.mastodon-modal`, `.mastodon-modal-image`. The image grid's `gridTemplateColumns` currently depends on `item.images.length` (1–5+) — replace with a small `getImageGridClass(count)` helper returning one of a few predefined modifier classes (`.mastodon-item-images--1` … `--5plus`) instead of computing inline style. Replace the `linkHover` state + its two handlers with a `.mastodon-footer-link:hover { text-decoration: underline }` rule; delete the state and handlers. |
| `src/pages/PostsSidebar.tsx` | new `src/pages/PostsSidebar.css` | Fold the existing `<style>` media block in; extend the already-present `.sidebar-sticky`/`.sidebar-section`/`.sidebar-title` classes with their base declarations. Add `.sidebar-search-input`, `.sidebar-categories-list`, `.sidebar-category-item` (with `:hover { background: #f0f0f0 }` replacing the current `onMouseEnter`/`onMouseLeave` mutation — delete those handlers), `.sidebar-tag`. |
| `src/pages/PostsPage.tsx` | new `src/pages/PostsPage.css` | Fold existing `<style>` media block in; extend `.posts-page-container`/`.posts-page-header`/`.posts-page-layout`/`.posts-page-sidebar`. Add `.posts-page-back-wrapper`, `.posts-page-back-button`, `.posts-page-content`. |
| `src/pages/PostPage.tsx` | extend existing `src/pages/PostPage.css` | Fold existing `<style>` media block in as real rules for `.post-page-container`/`.post-page-title`/`.post-page-meta` (currently only their mobile overrides live in the CSS file). Add `.post-page-back-button`, `.post-page-categories`, `.post-page-category-tag`. Merge the content wrapper's `lineHeight`/`fontSize`/`color` into the existing `.blog-content` rule instead of a new class, since `className="blog-content"` is already present. |
| `src/pages/NotFound.tsx` | new `src/pages/NotFound.css` | Add `.not-found-container`, `.not-found-content`, `.not-found-code`, `.not-found-button`. |
| `src/pages/FullPageLoader.tsx` | new `src/pages/FullPageLoader.css` | Add `.full-page-loader`, `.full-page-loader-skeleton`. |
| `src/components/blog/Feed.tsx` | new `src/components/blog/Feed.css` | Fold the `responsiveStyles` template string into real `@media` rules targeting the already-present `.blog-post-card`/`.blog-post-title`/`.blog-post-subheading`/`.blog-post-content` classes; delete the `<style>{responsiveStyles}</style>` tag and the `responsiveStyles` variable. Merge remaining inline declarations into those existing classes. Replace the card's `onMouseEnter`/`onMouseLeave` `boxShadow`/`borderColor` mutation with `.blog-post-card:hover` CSS — delete the handlers. Add `.blog-feed-loading`, `.blog-feed-loading-skeleton`, `.blog-feed-list`, `.blog-post-tags`, `.blog-post-tag`, `.blog-post-thumbnail`, `.blog-feed-pagination`, `.blog-feed-page-label`. |

Ant Design components (`Input`, `Space`, `Tag`, `Button`, `Alert`, `Modal`, `Skeleton`) all forward a plain `className` prop onto their root DOM node, so every antd `style={{...}}` usage above converts the same way as native elements — no antd-specific workaround needed.

Global CSS class names must stay unique across files since there's no CSS Modules scoping — each file's classes are prefixed by component identity (`profile-*`, `mastodon-*`, `sidebar-*`, `posts-page-*`, `post-page-*`, `not-found-*`, `blog-post-*`, etc.) to avoid collisions, consistent with the naming already used for the pre-existing classes.

## Verification

1. `grep -rn 'style={' src/` returns no results.
2. `npm run lint` passes with zero errors/warnings (confirms the new rule is active and nothing violates it).
3. `npm run build` (`tsc -b && vite build`) succeeds — catches any TS fallout from removing the hover handlers/state.
4. `npm run dev` and manually click through in the browser: home page (Profile card layout/spacing, social link hover effects, Mastodon feed timeline + image grid + modal image viewer), posts listing page (sidebar search/category hover/tags, pagination, responsive layout at narrow width), an individual post page, and the 404 page — confirm visuals and hover states match current behavior with no regressions.