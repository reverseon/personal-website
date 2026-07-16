import { Skeleton } from 'antd';

export const FullPageLoader = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Skeleton active style={{ width: '100%', maxWidth: '600px' }} />
    </div>
  );
};
