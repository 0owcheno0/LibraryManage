import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  ColorPicker,
  Button,
  Spin,
  Typography,
  App,
} from 'antd';
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';
import { PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createAuthenticatedAxios } from '../services/api/config';

const { Text } = Typography;

export interface TagOption {
  id: number;
  name: string;
  color: string;
  description?: string;
  document_count: number;
}

interface TagSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  placeholder?: string;
  maxTagCount?: number;
  allowCreate?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  mode?: 'multiple' | 'tags';
}

interface CreateTagForm {
  name: string;
  color: string;
  description?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  value = [],
  onChange,
  placeholder = '请选择标签',
  maxTagCount,
  allowCreate = true,
  disabled = false,
  style,
  size = 'middle',
  mode = 'multiple'
}) => {
  const { message: messageApi } = App.useApp();
  const { state } = useAuth();
  const user = state.user;
  
  // 状态管理
  const [tags, setTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm<CreateTagForm>();

  // 加载标签列表
  const loadTags = async (keyword?: string) => {
    setLoading(true);
    try {
      // 使用统一配置的axios实例
      const api = createAuthenticatedAxios();
      
      let response;
      if (keyword && keyword.trim()) {
        // 使用搜索接口
        response = await api.get('/tags/search', {
          params: { keyword: keyword.trim(), limit: 50 }
        });
        if (response.data.code === 200) {
          setTags(response.data.data.tags.map((tag: any) => ({
            ...tag,
            document_count: tag.document_count || 0
          })));
        }
      } else {
        // 获取所有标签
        response = await api.get('/tags', {
          params: { pageSize: 100, sortBy: 'usage_count', sortOrder: 'DESC' }
        });
        if (response.data.code === 200) {
          setTags(response.data.data.tags.map((tag: any) => ({
            ...tag,
            document_count: tag.document_count || 0
          })));
        }
      }
    } catch (error) {
      console.error('Load tags error:', error);
      // 静默处理错误，不显示错误消息以避免影响用户体验
    } finally {
      setLoading(false);
    }
  };

  // 创建新标签
  const handleCreateTag = async (values: CreateTagForm) => {
    try {
      // 使用统一配置的axios实例
      const api = createAuthenticatedAxios();
      
      const response = await api.post('/tags', values);
      
      if (response.data.code === 201) {
        const newTag = response.data.data;
        messageApi.success('标签创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        
        // 更新标签列表
        setTags(prev => [{ 
          ...newTag, 
          document_count: 0 
        }, ...prev]);
        
        // 自动选中新创建的标签
        if (onChange) {
          const newValue = [...value, newTag.id];
          onChange(newValue);
        }
      } else {
        messageApi.error(response.data.message || '标签创建失败');
      }
    } catch (error: any) {
      console.error('Create tag error:', error);
      
      // 处理不同类型的错误，防止页面跳转
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      let errorMessage = '标签创建失败';
      
      if (status === 401) {
        errorMessage = '登录状态已过期，请重新登录后再试';
      } else if (status === 403) {
        errorMessage = '您没有权限创建标签，请联系管理员';
      } else if (status === 409) {
        errorMessage = '标签名称已存在，请使用其他名称';
      } else if (status === 400) {
        errorMessage = errorData?.message || '请求参数错误，请检查标签信息';
      } else if (status >= 500) {
        errorMessage = '服务器暂时不可用，请稍后再试';
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (!error.response) {
        errorMessage = '网络连接失败，请检查网络设置';
      }
      
      // 只显示错误信息，不触发页面跳转
      messageApi.error(errorMessage);
      
      // 记录错误用于调试，但不重新抛出
      console.error('Tag creation failed:', {
        status,
        message: errorMessage,
        originalError: error
      });
    }
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    loadTags(keyword);
  };

  // 处理选择变化
  const handleChange = (selectedValues: number[]) => {
    if (onChange) {
      onChange(selectedValues);
    }
  };

  // 检查是否可以创建标签
  const canCreateTag = useMemo(() => {
    return allowCreate && user && (user.role === 'admin' || user.role === 'editor');
  }, [allowCreate, user]);

  // 生成选项
  const options = useMemo(() => {
    return tags.map(tag => ({
      value: tag.id,
      label: tag.name,
      tag: tag
    }));
  }, [tags]);

  // 自定义标签渲染
  const tagRender = (props: CustomTagProps) => {
    const { label, closable, onClose, value: tagValue } = props;
    const tag = tags.find(t => t.id === tagValue);
    
    if (!tag) return <span>{label}</span>;

    return (
      <Tag
        color={tag.color}
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 3,
          borderRadius: '12px',
          fontSize: '12px',
          padding: '2px 8px'
        }}
      >
        {label}
      </Tag>
    );
  };

  // 自定义选项渲染
  const optionRender = (option: any) => {
    const tag = option.tag;
    
    // 添加检查确保tag存在
    if (!tag) {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span>{option.label}</span>
          </Space>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Tag 
            color={tag.color}
            style={{
              borderRadius: '8px',
              fontSize: '12px',
              padding: '1px 6px',
              margin: 0
            }}
          >
            {tag.name}
          </Tag>
          {tag.description && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {tag.description}
            </Text>
          )}
        </Space>
        {tag.document_count > 0 && (
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {tag.document_count} 文档
          </Text>
        )}
      </div>
    );
  };

  // 下拉菜单底部的创建按钮
  const dropdownRender = (menu: React.ReactNode) => (
    <>
      {menu}
      {canCreateTag && (
        <>
          <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                createForm.setFieldsValue({
                  name: searchKeyword,
                  color: '#1890ff'
                });
                setCreateModalVisible(true);
              }}
            >
              创建新标签
              {searchKeyword && `: "${searchKeyword}"`}
            </Button>
          </div>
        </>
      )}
    </>
  );

  // 初始化数据
  useEffect(() => {
    loadTags();
  }, []);

  return (
    <>
      <Select
        mode={mode}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={style}
        size={size}
        disabled={disabled}
        loading={loading}
        showSearch
        searchValue={searchKeyword}
        onSearch={handleSearch}
        filterOption={false}
        options={options}
        tagRender={mode === 'multiple' ? tagRender : undefined}
        optionRender={optionRender}
        popupRender={dropdownRender}
        maxTagCount={maxTagCount}
        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}...`}
        suffixIcon={<TagsOutlined />}
        notFoundContent={
          loading ? (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Spin size="small" />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                加载标签中...
              </div>
            </div>
          ) : searchKeyword ? (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>
                未找到匹配的标签
              </div>
              {canCreateTag && (
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ fontSize: '11px', color: '#666' }}>
                    点击下方按钮创建新标签
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>
                暂无可用标签
              </div>
            </div>
          )
        }
        getPopupContainer={(trigger) => trigger.parentElement || document.body}
      />

      {/* 创建标签模态框 */}
      <Modal
        title="创建新标签"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="创建"
        cancelText="取消"
        width={450}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTag}
          initialValues={{
            color: '#1890ff'
          }}
        >
          <Form.Item
            label="标签名称"
            name="name"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 50, message: '标签名称不能超过50个字符' },
              { 
                validator: async (_, value) => {
                  if (value && tags.some(tag => tag.name.toLowerCase() === value.toLowerCase())) {
                    throw new Error('标签名称已存在');
                  }
                }
              }
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          
          <Form.Item
            label="标签颜色"
            name="color"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker 
              showText 
              format="hex"
              size="large"
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#1890ff', '#52c41a', '#722ed1', '#fa8c16',
                    '#eb2f96', '#13c2c2', '#f5222d', '#fa541c',
                    '#2f54eb', '#389e0d', '#531dab', '#d48806'
                  ]
                }
              ]}
            />
          </Form.Item>
          
          <Form.Item
            label="标签描述"
            name="description"
            rules={[{ max: 500, message: '描述不能超过500个字符' }]}
          >
            <Input.TextArea 
              placeholder="请输入标签描述（可选）"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TagSelector;

// 简化版标签选择器（用于快速选择场景）
export const SimpleTagSelector: React.FC<{
  value?: number[];
  onChange?: (value: number[]) => void;
  placeholder?: string;
  maxCount?: number;
  style?: React.CSSProperties;
}> = ({
  value = [],
  onChange,
  placeholder = '选择标签',
  maxCount = 5,
  style
}) => {
  const { message: messageApi } = App.useApp();
  const [popularTags, setPopularTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载热门标签
  const loadPopularTags = async () => {
    setLoading(true);
    try {
      const api = createAuthenticatedAxios();
      const response = await api.get('/tags/popular', { 
        params: { limit: 20 } 
      });
      
      if (response.data.code === 200) {
        setPopularTags(response.data.data.tags);
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
      // 选择标签，检查是否超出限制
      if (maxCount && value.length >= maxCount) {
        messageApi.warning(`最多只能选择 ${maxCount} 个标签`);
        return;
      }
      newValue = [...value, tagId];
    }

    onChange(newValue);
  };

  useEffect(() => {
    loadPopularTags();
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
      <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666' }}>
        {placeholder}
        {maxCount && ` (最多${maxCount}个)`}
      </div>
      <Space wrap>
        {popularTags.map(tag => {
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
                backgroundColor: isSelected ? tag.color : 'transparent'
              }}
              onClick={() => handleTagClick(tag.id)}
            >
              {tag.name}
            </Tag>
          );
        })}
      </Space>
    </div>
  );
};