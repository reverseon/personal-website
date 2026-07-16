import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Empty, Space, Button, Row, Col, Tag } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import jsonp from 'jsonp';

interface BlogPost {
  id: string;
  title: string;
  thumbnail?: string;
  subheading?: string;
  link: string;
  published: string;
  commentCount?: number;
  categories?: string[];
}

interface FeedData {
  posts: BlogPost[];
  totalResults: number;
}

interface FeedProps {
  maxResults?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isStandalone?: boolean;
  searchQuery?: string;
}

const extractFirstImage = (html: string): string | undefined => {
  const match = html.match(/<img[^>]*src="([^"]*)"[^>]*>/);
  return match?.[1];
};

const extractFirstBlockquote = (html: string): string | undefined => {
  const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/);
  if (!match?.[1]) return undefined;

  // Strip HTML tags and decode entities
  return match[1]
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

const extractSlugFromLink = (link: string): string => {
  return link.split('/').pop()?.replace('.html', '') || '';
};

export const BlogFeed = ({ maxResults = 5, currentPage = 1, onPageChange, isStandalone = false, searchQuery = '' }: FeedProps) => {
  const navigate = useNavigate();
  const startIndex = (currentPage - 1) * maxResults + 1;

  const { data, isLoading, error } = useQuery<FeedData>({
    queryKey: ['blogger-feed', maxResults, currentPage],
    queryFn: () =>
      new Promise((resolve, reject) => {
        jsonp(
          `https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=${maxResults}&start-index=${startIndex}`,
          { param: 'callback' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            const posts = data.feed.entry?.map((entry: any) => ({
              id: entry.id.$t,
              title: entry.title.$t,
              thumbnail: extractFirstImage(entry.content.$t),
              subheading: extractFirstBlockquote(entry.content.$t),
              link: entry.link.find((l: any) => l.rel === 'alternate')?.href,
              published: entry.published.$t,
              commentCount: parseInt(entry['thr$total']?.$t || '0'),
              categories: entry.category
                ?.filter((c: any) => c.term && c.term !== 'http://schemas.google.com/blogger/2008/kind#post')
                .map((c: any) => c.term) || [],
            })) || [];

            const totalResults = parseInt(data.feed['openSearch$totalResults']?.$t || '0');

            resolve({ posts, totalResults });
          }
        );
      }),
  });

  const posts = data?.posts || [];
  const totalResults = data?.totalResults || 0;

  // For search mode, we need to fetch all posts
  const { data: allPostsData, isLoading: allPostsLoading } = useQuery({
    queryKey: ['blogger-feed-search-all'],
    queryFn: () =>
      new Promise<BlogPost[]>((resolve, reject) => {
        jsonp(
          `https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=9999`,
          { param: 'callback' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            const allPosts = data.feed.entry?.map((entry: any) => ({
              id: entry.id.$t,
              title: entry.title.$t,
              thumbnail: extractFirstImage(entry.content.$t),
              subheading: extractFirstBlockquote(entry.content.$t),
              link: entry.link.find((l: any) => l.rel === 'alternate')?.href,
              published: entry.published.$t,
              commentCount: parseInt(entry['thr$total']?.$t || '0'),
              categories: entry.category
                ?.filter((c: any) => c.term && c.term !== 'http://schemas.google.com/blogger/2008/kind#post')
                .map((c: any) => c.term) || [],
            })) || [];

            resolve(allPosts);
          }
        );
      }),
    enabled: searchQuery.trim().length > 0,
  });

  // Filter posts based on search
  let displayPosts = posts;
  const isSearchMode = searchQuery.trim().length > 0;

  if (isSearchMode && allPostsData) {
    const query = searchQuery.toLowerCase();
    displayPosts = allPostsData.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.subheading?.toLowerCase().includes(query) ||
      post.categories?.some(cat => cat.toLowerCase().includes(query))
    );
  }

  if (isLoading) {
    if (isStandalone) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <Skeleton active style={{ width: '100%', maxWidth: '600px' }} />
        </div>
      );
    }
    return <Skeleton active />;
  }

  if (error) return <Empty description="Failed to load blog posts" />;

  const hasNextPage = startIndex + maxResults - 1 < totalResults;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {!displayPosts?.length ? (
        <Empty description="No posts found" />
      ) : (
        displayPosts.map((post) => (
        <div
          key={post.id}
          onClick={() => {
            const slug = extractSlugFromLink(post.link);
            navigate({ to: '/post/$id', params: { id: slug } });
          }}
          style={{
            display: 'flex',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#d9d9d9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#f0f0f0';
          }}
        >
          <div style={{ flex: 1, minWidth: 0, padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              {post.title}
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
              {post.subheading}
            </p>
            <p style={{ margin: '0 0 0.75rem 0', color: '#999', fontSize: '0.75rem' }}>
              {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.categories?.map((category) => (
                <Tag key={category} style={{ cursor: 'pointer', marginBottom: '0.25rem' }}>
                  {category}
                </Tag>
              ))}
            </div>
          </div>
          {post.thumbnail && (
            <img
              alt={post.title}
              src={post.thumbnail}
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}
        </div>
      )))}
      {!isSearchMode && (
        <Row justify="space-between" align="middle" style={{ marginTop: '1rem' }}>
          {!isStandalone && <Col />}
          {isStandalone && (
            <>
              <Col>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </Col>
              <Col>
                <span style={{ color: '#666', fontSize: '0.875rem' }}>
                  Page {currentPage}
                </span>
              </Col>
            </>
          )}
          <Col>
            {isStandalone ? (
              <Button
                icon={<RightOutlined />}
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            ) : (
              hasNextPage && (
                <Button
                  icon={<RightOutlined />}
                  onClick={() => navigate({ to: '/posts/$page', params: { page: '2' } })}
                >
                  See more posts
                </Button>
              )
            )}
          </Col>
        </Row>
      )}
    </Space>
  );
};
