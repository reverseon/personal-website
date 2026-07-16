import { Input, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
    <div style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Search</h3>
        <Input
          placeholder="Search posts..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
      </div>

      {categories.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Categories</h3>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => onSearchChange(category)}
                style={{
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {category}
              </div>
            ))}
          </Space>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tags</h3>
          <Space wrap>
            {tags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => onTagClick?.(tag)}
                style={{ cursor: 'pointer' }}
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
