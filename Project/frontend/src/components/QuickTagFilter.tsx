import React, { useState, useEffect } from 'react';
import { Space, Tag, Typography, Spin, Empty } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

interface QuickTagFilterProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  maxCount?: number;
  style?: React.CSSProperties;
}

interface TagOption {
  id: number;
  name: string;
  color: string;
  document_count: number;
}

const QuickTagFilter: React.FC<QuickTagFilterProps> = ({
  value = [],
  onChange,
  maxCount = 10,
  style,
}) => {
  const [tags, setTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载热门标签
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/tags/popular', {
        params: { limit: maxCount },
      });

      if (response.data.code === 200) {
        setTags(response.data.data.tags);
      }
    } catch (error) {
      console.error('Load popular tags error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理标签点击
  const handleTagClick = (tagId: number) => {
    if (!onChange) return;

    const isSelected = value.includes(tagId);
    let newValue: number[];

    if (isSelected) {
      // 取消选择
      newValue = value.filter(id => id !== tagId);
    } else {
      // 选择标签
      newValue = [...value, tagId];
    }

    onChange(newValue);
  };

  useEffect(() => {
    loadTags();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '12px', ...style }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div style={style}>
      <div style={{ marginBottom: '8px' }}>
        <TagsOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
        <Text strong>热门标签</Text>
      </div>
      {tags.length > 0 ? (
        <Space wrap>
          {tags.map(tag => {
            const isSelected = value.includes(tag.id);
            return (
              <Tag
                key={tag.id}
                color={isSelected ? tag.color : undefined}
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  fontSize: '12px',
                  padding: '4px 8px',
                  border: isSelected ? undefined : `1px solid ${tag.color}`,
                  color: isSelected ? '#fff' : tag.color,
                  backgroundColor: isSelected ? tag.color : 'transparent',
                }}
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </Tag>
            );
          })}
        </Space>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无标签" />
      )}
    </div>
  );
};

export default QuickTagFilter;