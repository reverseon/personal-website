import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import jsonp from 'jsonp';
import { BlogFeed } from '../components/blog/Feed';
import { NotFound } from './NotFound';
import { FullPageLoader } from './FullPageLoader';
import { PostsSidebar } from './PostsSidebar';

export const PostsPage = () => {
  const { page } = useParams({ from: '/posts/$page' });
  const navigate = useNavigate();
  const currentPage = parseInt(page) || 1;
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch total results to validate page number
  const { data: totalResults, isLoading } = useQuery({
    queryKey: ['blogger-feed-total'],
    queryFn: () =>
      new Promise<number>((resolve, reject) => {
        jsonp(
          'https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=1',
          { param: 'callback' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            const total = parseInt(data.feed['openSearch$totalResults']?.$t || '0');
            resolve(total);
          }
        );
      }),
  });

  // Fetch all posts to extract categories and tags
  const { data: allPosts } = useQuery({
    queryKey: ['blogger-feed-all'],
    queryFn: () =>
      new Promise<any[]>((resolve, reject) => {
        jsonp(
          'https://revierandomnotes.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=9999',
          { param: 'callback' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data.feed.entry || []);
          }
        );
      }),
  });

  // Extract categories and tags from all posts
  const { categories, tags } = useMemo(() => {
    const cats = new Set<string>();
    const tgs = new Set<string>();

    allPosts?.forEach((entry: any) => {
      entry.category?.forEach((cat: any) => {
        if (cat.term && cat.term !== 'http://schemas.google.com/blogger/2008/kind#post') {
          cats.add(cat.term);
        }
      });
    });

    return {
      categories: Array.from(cats).sort(),
      tags: Array.from(tgs).sort(),
    };
  }, [allPosts]);

  const handlePageChange = (newPage: number) => {
    navigate({ to: '/posts/$page', params: { page: String(newPage) } });
  };

  // Show loading while validating page (without rendering BlogFeed yet)
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Show 404 if page is invalid (after validation is complete)
  if (totalResults !== undefined) {
    const maxPages = Math.ceil(totalResults / 5);
    if (currentPage < 1 || currentPage > maxPages) {
      return <NotFound />;
    }
  }

  // Only render BlogFeed after validation is complete
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
        <div style={{ flex: '0 0 250px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{ height: '40px', padding: 0, margin: 0, fontSize: '1rem' }}
          >
            Back
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: '0 0 250px' }}>
        <PostsSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          tags={tags}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <BlogFeed
          maxResults={5}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isStandalone
          searchQuery={searchQuery}
        />
      </div>
      </div>
    </div>
  );
};
