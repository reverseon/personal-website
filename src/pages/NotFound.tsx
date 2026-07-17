import { Empty, Button } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { Meta } from '../components/Meta';
import { usePageTitle } from '../hooks/usePageTitle';
import { metadata } from '../utils/seo';
import './NotFound.css';

export const NotFound = () => {
  usePageTitle('Not Found - ReverseON');
  const navigate = useNavigate();

  return (
    <>
      <Meta data={metadata.notFound} />
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-code">404</h1>
          <Empty description="Page not found" />
          <Button
            type="primary"
            onClick={() => navigate({ to: '/' })}
            className="not-found-button"
          >
            Go to homepage
          </Button>
        </div>
      </div>
    </>
  );
};
