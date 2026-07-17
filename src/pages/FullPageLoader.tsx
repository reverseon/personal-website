import { Skeleton } from 'antd';
import './FullPageLoader.css';

export const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <Skeleton active className="full-page-loader-skeleton" />
    </div>
  );
};
