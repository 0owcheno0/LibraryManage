import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AutoComplete,
  Input,
  Button,
  Tag,
  Divider,
  Typography,
  Empty,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  TagOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { searchService, searchHistoryManager } from '../services/search';
import type { SearchSuggestion } from '../services/search';
import { useDebounce } from '../hooks/useDebounce';

const { Search } = Input;
const { Text } = Typography;

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  onSuggestionSelect?: (value: string, type: 'suggestion' | 'history' | 'tag' | 'popular') => void;
  style?: React.CSSProperties;
  className?: string;
}

interface AutoCompleteOption {
  value: string;
  label: React.ReactNode;
  type: 'suggestion' | 'history' | 'tag' | 'popular';
  data?: any;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder = '输入关键词搜索文档...',
  size = 'large',
  loading = false,
  disabled = false,
  allowClear = true,
  onSearch,
  onChange,
  onSuggestionSelect,
  style,
  className,
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  
  // 防抖搜索建议
  const debouncedInputValue = useDebounce(inputValue, 500);  // 从300ms调整到500ms以提供更好的用户体验
  
  // 组件引用
  const searchInputRef = useRef<any>(null);

  // 初始化搜索历史
  useEffect(() => {
    setSearchHistory(searchHistoryManager.getHistory());
    
    // 加载热门标签
    loadPopularTags();
  }, []);

  // 加载热门标签
  const loadPopularTags = async () => {
    try {
      const suggestions = await searchService.getSearchSuggestions('', 10);
      setPopularTags(suggestions.popularTags || []);
    } catch (error) {
      console.error('加载热门标签失败:', error);
    }
  };

  // 同步外部值变化
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // 防抖获取搜索建议
  useEffect(() => {
    if (debouncedInputValue && debouncedInputValue.length > 1) {
      fetchSuggestions(debouncedInputValue);
    } else {
      // 显示默认选项（历史搜索和热门标签）
      showDefaultOptions();
    }
  }, [debouncedInputValue]);

  // 获取搜索建议
  const fetchSuggestions = useCallback(async (keyword: string) => {
    setSuggestionLoading(true);
    try {
      const suggestion = await searchService.getSearchSuggestions(keyword, 8);
      buildOptions(keyword, suggestion);
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      buildOptions(keyword, { suggestions: [], popularTags: [] });
    } finally {
      setSuggestionLoading(false);
    }
  }, [searchHistory]);

  // 显示默认选项
  const showDefaultOptions = useCallback(() => {
    const defaultOptions: AutoCompleteOption[] = [];

    // 添加搜索历史
    if (searchHistory.length > 0) {
      defaultOptions.push({
        value: 'history-divider',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <ClockCircleOutlined /> 搜索历史
            </Text>
          </div>
        ),
        type: 'history',
        disabled: true,
      } as any);

      searchHistory.slice(0, 5).forEach(keyword => {
        defaultOptions.push({
          value: keyword,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#999' }} />
                {keyword}
              </span>
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveHistory(keyword);
                }}
                style={{ fontSize: '12px' }}
              />
            </div>
          ),
          type: 'history',
        });
      });
    }

    // 添加热门标签
    if (popularTags.length > 0) {
      if (defaultOptions.length > 0) {
        defaultOptions.push({
          value: 'tag-divider',
          label: <Divider style={{ margin: '4px 0' }} />,
          type: 'tag',
          disabled: true,
        } as any);
      }

      defaultOptions.push({
        value: 'tag-header',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <TagOutlined /> 热门标签
            </Text>
          </div>
        ),
        type: 'tag',
        disabled: true,
      } as any);

      popularTags.slice(0, 6).forEach(tag => {
        defaultOptions.push({
          value: `tag:${tag.id}`,
          label: (
            <div>
              <Tag color={tag.color} style={{ margin: 0 }}>
                {tag.name}
              </Tag>
            </div>
          ),
          type: 'tag',
          data: tag,
        });
      });
    }

    setOptions(defaultOptions);
  }, [searchHistory, popularTags]);

  // 构建选项列表
  const buildOptions = (keyword: string, suggestion: SearchSuggestion) => {
    const newOptions: AutoCompleteOption[] = [];

    // 添加搜索建议
    if (suggestion.suggestions.length > 0) {
      newOptions.push({
        value: 'suggestion-header',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <SearchOutlined /> 搜索建议
            </Text>
          </div>
        ),
        type: 'suggestion',
        disabled: true,
      } as any);

      suggestion.suggestions.forEach(text => {
        newOptions.push({
          value: text,
          label: (
            <div style={{ padding: '2px 0' }}>
              <SearchOutlined style={{ marginRight: '8px', color: '#999' }} />
              <span dangerouslySetInnerHTML={{ 
                __html: highlightMatch(text, keyword) 
              }} />
            </div>
          ),
          type: 'suggestion',
        });
      });
    }

    // 添加相关历史搜索
    const relatedHistory = searchHistory.filter(h => 
      h.toLowerCase().includes(keyword.toLowerCase()) && h !== keyword
    ).slice(0, 3);

    if (relatedHistory.length > 0) {
      if (newOptions.length > 0) {
        newOptions.push({
          value: 'history-divider',
          label: <Divider style={{ margin: '4px 0' }} />,
          type: 'history',
          disabled: true,
        } as any);
      }

      newOptions.push({
        value: 'history-header',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <ClockCircleOutlined /> 相关历史
            </Text>
          </div>
        ),
        type: 'history',
        disabled: true,
      } as any);

      relatedHistory.forEach(text => {
        newOptions.push({
          value: text,
          label: (
            <div style={{ padding: '2px 0' }}>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#999' }} />
              <span dangerouslySetInnerHTML={{ 
                __html: highlightMatch(text, keyword) 
              }} />
            </div>
          ),
          type: 'history',
        });
      });
    }

    // 添加相关标签
    const relatedTags = suggestion.popularTags.filter(tag =>
      tag.name.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 4);

    if (relatedTags.length > 0) {
      if (newOptions.length > 0) {
        newOptions.push({
          value: 'tag-divider',
          label: <Divider style={{ margin: '4px 0' }} />,
          type: 'tag',
          disabled: true,
        } as any);
      }

      newOptions.push({
        value: 'tag-header',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <TagOutlined /> 相关标签
            </Text>
          </div>
        ),
        type: 'tag',
        disabled: true,
      } as any);

      relatedTags.forEach(tag => {
        newOptions.push({
          value: `tag:${tag.id}`,
          label: (
            <div>
              <Tag color={tag.color} style={{ margin: 0 }}>
                <span dangerouslySetInnerHTML={{ 
                  __html: highlightMatch(tag.name, keyword) 
                }} />
              </Tag>
            </div>
          ),
          type: 'tag',
          data: tag,
        });
      });
    }

    // 如果没有任何建议，显示提示
    if (newOptions.length === 0) {
      newOptions.push({
        value: 'no-results',
        label: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无搜索建议"
            style={{ margin: '8px 0' }}
          />
        ),
        type: 'suggestion',
        disabled: true,
      } as any);
    }

    setOptions(newOptions);
  };

  // 高亮匹配文本
  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #fffbe6; padding: 0;">$1</mark>');
  };

  // 处理输入变化
  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange?.(val);
  };

  // 处理搜索
  const handleSearch = (searchValue: string) => {
    if (searchValue.trim()) {
      // 保存到搜索历史
      searchHistoryManager.addSearch(searchValue.trim());
      setSearchHistory(searchHistoryManager.getHistory());
      
      onSearch?.(searchValue.trim());
    }
  };

  // 处理选项选择
  const handleSelect = (selectedValue: string, option: any) => {
    // 检查是否是标签选择
    if (selectedValue.startsWith('tag:')) {
      const selectedOption = options.find(opt => opt.value === selectedValue);
      const tagData = selectedOption?.data;
      
      if (tagData) {
        // 对于标签，我们使用标签名称作为搜索词
        setInputValue(tagData.name);
        onSuggestionSelect?.(tagData.name, 'tag');
        
        // 自动搜索
        setTimeout(() => {
          handleSearch(tagData.name);
        }, 100);
      }
    } else if (selectedValue !== 'suggestion-header' && 
               selectedValue !== 'history-divider' && 
               selectedValue !== 'history-header' && 
               selectedValue !== 'tag-divider' && 
               selectedValue !== 'tag-header' && 
               selectedValue !== 'no-results') {
      setInputValue(selectedValue);
      
      // 确定选择类型
      const selectedOption = options.find(opt => opt.value === selectedValue);
      const type = selectedOption?.type || 'suggestion';
      
      onSuggestionSelect?.(selectedValue, type);
      
      // 自动搜索
      setTimeout(() => {
        handleSearch(selectedValue);
      }, 100);
    }
  };

  // 移除搜索历史
  const handleRemoveHistory = (keyword: string) => {
    searchHistoryManager.removeHistory(keyword);
    setSearchHistory(searchHistoryManager.getHistory());
    showDefaultOptions(); // 刷新选项
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOptions([]);
      searchInputRef.current?.blur();
    }
  };

  return (
    <AutoComplete
      ref={searchInputRef}
      value={inputValue}
      options={options}
      onSearch={handleInputChange}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      style={style}
      className={className}
      dropdownStyle={{ maxHeight: '300px' }}
      notFoundContent={suggestionLoading ? <Spin size="small" /> : null}
    >
      <Search
        placeholder={placeholder}
        size={size}
        loading={loading}
        disabled={disabled}
        allowClear={allowClear}
        enterButton={
          <Button type="primary" icon={<SearchOutlined />} loading={loading}>
            搜索
          </Button>
        }
        onSearch={handleSearch}
      />
    </AutoComplete>
  );
};

export default SearchInput;