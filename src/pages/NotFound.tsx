import { Empty, Button } from 'antd';
import { useNavigate } from '@tanstack/react-router';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>404</h1>
        <Empty description="Page not found" />
        <Button
          type="primary"
          onClick={() => navigate({ to: '/' })}
          style={{ marginTop: '2rem' }}
        >
          Go to homepage
        </Button>
      </div>
    </div>
  );
};
