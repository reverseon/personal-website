import { Input, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './PostsSidebar.css';

interface PostsSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  tags: string[];
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
}

export const PostsSidebar = ({
  searchQuery,
  onSearchChange,
  categories,
  tags,
  onCategoryClick,
  onTagClick,
}: PostsSidebarProps) => {
  return (
    <div className="sidebar-sticky">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Search</h3>
        <Input
          placeholder="Search posts..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {categories.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Categories</h3>
          <Space direction="vertical" className="sidebar-categories-list" size="small">
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => onSearchChange(category)}
                className="sidebar-category-item"
              >
                {category}
              </div>
            ))}
          </Space>
        </div>
      )}

      {tags.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Tags</h3>
          <Space wrap>
            {tags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="sidebar-tag"
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};
