// Runs after `vite build`. Writes a static HTML file per known route (home,
// posts list pages, individual posts) with real OG/Twitter meta tags baked
// into <head>, so social crawlers (which don't run JS) see correct previews
// instead of the empty shell / 404 redirect page.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://reon.my.id';
const SITE_NAME = 'ReverseON';
const FEED_URL = 'https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json&max-results=9999';
const MASTODON_FEED_URL = 'https://mastodon.social/@kuusourevie.rss';
const DEFAULT_IMAGE = `${SITE_URL}/og-img/default.jpg`;
const PAGE_SIZE = 5;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const slugFromLink = (link) => link.split('/').pop()?.replace('.html', '') || '';

const stripHtml = (html) =>
  html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function generatePostMetadata(title, content, slug) {
  let description;
  const blockquoteMatch = content.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (blockquoteMatch) {
    description = stripHtml(blockquoteMatch[1]);
  } else {
    const plainText = stripHtml(content);
    description = plainText.length > 160 ? plainText.substring(0, 160).trim() + '...' : plainText;
  }

  let image = DEFAULT_IMAGE;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    image = imgMatch[1];
  }

  return {
    title,
    description: description || 'Read this article on ReverseON',
    image,
    url: `${SITE_URL}/post/${slug}`,
    type: 'article',
  };
}

async function fetchFeedEntries() {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return data.feed?.entry || [];
  } catch (err) {
    console.warn('Could not fetch Blogger feed at build time, skipping post/list pages:', err.message);
    return [];
  }
}

async function fetchMastodonImage() {
  try {
    const res = await fetch(MASTODON_FEED_URL);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const xml = await res.text();
    const match = xml.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i);
    if (match?.[1]) return match[1].trim();
  } catch (err) {
    console.warn('Could not fetch Mastodon profile image at build time, using default:', err.message);
  }
  return DEFAULT_IMAGE;
}

function injectMeta(html, meta) {
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.url)}" />`,
  ].join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace('</head>', `    ${tags}\n  </head>`);
}

async function writePage(relDir, html) {
  const dir = path.join(DIST_DIR, relDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf-8');
}

async function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error('dist/index.html not found — run `vite build` first');
  }
  const template = await readFile(indexPath, 'utf-8');

  const [entries, homeImage] = await Promise.all([fetchFeedEntries(), fetchMastodonImage()]);

  const homeMeta = {
    title: 'ReverseON - Thirafi Najwan',
    description: 'where code meets chaos, thoughts become posts, and random experiments happen',
    image: homeImage,
    url: SITE_URL,
    type: 'website',
  };
  await writeFile(indexPath, injectMeta(template, homeMeta), 'utf-8');

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  for (let page = 1; page <= totalPages; page++) {
    const meta = {
      title: page === 1 ? 'Blog Posts - ReverseON' : `Blog Posts - Page ${page} - ReverseON`,
      description:
        'Explore a collection of technical articles and random notes on development, technology, and experiments.',
      image: DEFAULT_IMAGE,
      url: `${SITE_URL}/posts/${page}`,
      type: 'website',
    };
    await writePage(`posts/${page}`, injectMeta(template, meta));
  }

  let postCount = 0;
  for (const entry of entries) {
    const link = entry.link?.find((l) => l.rel === 'alternate')?.href || '';
    const slug = slugFromLink(link);
    if (!slug) continue;
    const title = entry.title?.$t || 'Untitled';
    const content = entry.content?.$t || '';
    const meta = generatePostMetadata(title, content, slug);
    await writePage(`post/${slug}`, injectMeta(template, meta));
    postCount += 1;
  }

  console.log(`Prerendered home, ${totalPages} posts-list page(s), and ${postCount} post page(s).`);
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
