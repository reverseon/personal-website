import { Empty, Button } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import './NotFound.css';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
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
  );
};
