export const SITE_URL = 'https://reon.my.id';
export const SITE_NAME = 'ReverseON';
const MASTODON_FEED_URL = 'https://mastodon.social/@kuusourevie.rss';

let cachedMastodonImage: string | null = null;

export const getMastodonProfileImage = async (): Promise<string> => {
  if (cachedMastodonImage) {
    return cachedMastodonImage;
  }

  try {
    const response = await fetch(MASTODON_FEED_URL);
    if (!response.ok) throw new Error('Failed to fetch Mastodon RSS');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Failed to parse Mastodon RSS');
    }

    const channel = xmlDoc.querySelector('channel');
    const feedImage = channel?.querySelector('image > url')?.textContent || '';

    if (feedImage) {
      cachedMastodonImage = feedImage;
      return feedImage;
    }
  } catch (error) {
    console.error('Error fetching Mastodon profile image:', error);
  }

  // Fallback to default
  return `${SITE_URL}/src/assets/og-img/default.jpg`;
};

export interface MetaData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
}

export const getOgImagePath = (slug?: string): string => {
  if (!slug) return `${SITE_URL}/src/assets/og-img/default.jpg`;

  // Try to match slug to image file
  const imageFile = slug.toLowerCase().replace(/[\s_]+/g, '-');
  return `${SITE_URL}/src/assets/og-img/${imageFile}.jpg`;
};

export const metadata = {
  home: {
    title: 'ReverseON - Thirafi Najwan',
    description: 'where code meets chaos, thoughts become posts, and random experiments happen',
    image: `${SITE_URL}/src/assets/og-img/home.jpg`,
    url: SITE_URL,
    type: 'website' as const,
  },
  posts: {
    title: 'Blog Posts',
    description: 'Explore a collection of technical articles and random notes on development, technology, and experiments.',
    image: `${SITE_URL}/src/assets/og-img/default.jpg`,
    url: `${SITE_URL}/posts/1`,
    type: 'website' as const,
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    image: `${SITE_URL}/src/assets/og-img/default.jpg`,
    url: SITE_URL,
    type: 'website' as const,
  },
};

export const generatePostMetadata = (
  title: string,
  content: string,
  slug: string
): MetaData => {
  let description: string;

  // Try to extract first blockquote as subheading
  const blockquoteMatch = content.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (blockquoteMatch) {
    description = blockquoteMatch[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, '')
      .trim();
  } else {
    // Fallback: extract first ~160 characters of plain text
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, '')
      .trim();
    description = plainText.length > 160
      ? plainText.substring(0, 160).trim() + '...'
      : plainText;
  }

  // Extract first image from content, fallback to default
  let image = `${SITE_URL}/src/assets/og-img/default.jpg`;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    image = imgMatch[1];
  }

  return {
    title: title,
    description: description || 'Read this article on ReverseON',
    image: image,
    url: `${SITE_URL}/post/${slug}`,
    type: 'article',
  };
};
