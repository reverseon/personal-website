import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import jsonp from 'jsonp';
import { FullPageLoader } from './FullPageLoader';
import { NotFound } from './NotFound';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Meta } from '../components/Meta';
import { usePageTitle } from '../hooks/usePageTitle';
import { generatePostMetadata } from '../utils/seo';
import './PostPage.css';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  link: string;
  published: string;
  author: string;
  categories: string[];
  rawEntry: any;
}

export const PostPage = () => {
  const { id } = useParams({ from: '/post/$id' });

  const { data, isLoading, error } = useQuery<BlogPostData | null>({
    queryKey: ['blogger-post', id],
    queryFn: () =>
      new Promise((resolve, reject) => {
        // Fetch all posts to find the one matching our slug
        jsonp(
          'https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=9999',
          { param: 'callback' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            const entries = data.feed.entry || [];

            // Find the post that matches our slug in its alternate link
            const matchingEntry = entries.find((entry: any) => {
              const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '';
              // Extract slug from link (remove domain and .html)
              const slug = link
                .split('/').pop()?.replace('.html', '') || '';
              return slug === id;
            });

            if (!matchingEntry) {
              resolve(null);
              return;
            }

            const post: BlogPostData = {
              id: matchingEntry.id.$t,
              title: matchingEntry.title.$t,
              content: matchingEntry.content.$t,
              link: matchingEntry.link.find((l: any) => l.rel === 'alternate')?.href || '',
              published: matchingEntry.published.$t,
              author: matchingEntry.author?.[0]?.name?.$t || 'Unknown',
              categories: matchingEntry.category
                ?.filter((c: any) => c.term && c.term !== 'http://schemas.google.com/blogger/2008/kind#post')
                .map((c: any) => c.term) || [],
              rawEntry: matchingEntry, // Include raw entry for inspection
            };

            resolve(post);
          }
        );
      }),
  });

  usePageTitle(data?.title ? `${data.title} - ReverseON` : 'Post - ReverseON');

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!data) {
    return <NotFound />;
  }

  const seoMetadata = generatePostMetadata(data.title, data.content, id);

  return (
    <>
      <Meta data={seoMetadata} />
      <div className="post-page-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => window.history.back()}
        className="post-page-back-button"
      >
        Back
      </Button>

      <article>
        <h1 className="post-page-title">{data.title}</h1>
        <p className="post-page-meta">
          Published: {new Date(data.published).toLocaleDateString()}
          {data.author && ` by ${data.author}`}
        </p>

        <div className="post-page-categories">
          {data.categories.map((cat) => (
            <span
              key={cat}
              className="post-page-category-tag"
            >
              {cat}
            </span>
          ))}
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: data.content }}
          className="blog-content"
        />
      </article>
      </div>
    </>
  );
};
