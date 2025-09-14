/**
 * 文本高亮工具类
 * 用于在搜索结果中高亮关键词
 */

export interface HighlightOptions {
  className?: string;
  style?: React.CSSProperties | string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxLength?: number;
}

export class HighlightTextHelper {
  
  /**
   * 高亮单个关键词
   */
  static highlightSingleKeyword(
    text: string,
    keyword: string,
    options: HighlightOptions = {}
  ): string {
    if (!text || !keyword) return text;

    const {
      className = 'search-highlight',
      style,
      caseSensitive = false,
      wholeWord = false,
      maxLength
    } = options;

    // 截断文本（如果指定了最大长度）
    const processedText = maxLength && text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;

    // 转义特殊字符
    const escapedKeyword = this.escapeRegExp(keyword);
    
    // 构建正则表达式
    let regexPattern = escapedKeyword;
    if (wholeWord) {
      regexPattern = `\\b${regexPattern}\\b`;
    }
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(regexPattern, flags);

    // 构建样式字符串
    const styleAttr = style 
      ? (typeof style === 'string' ? style : this.objectToStyleString(style))
      : '';
    
    const styleString = styleAttr ? ` style="${styleAttr}"` : '';

    // 执行替换
    return processedText.replace(regex, `<mark class="${className}"${styleString}>$&</mark>`);
  }

  /**
   * 高亮多个关键词
   */
  static highlightMultipleKeywords(
    text: string,
    keywords: string[],
    options: HighlightOptions = {}
  ): string {
    if (!text || !keywords || keywords.length === 0) return text;

    const {
      className = 'search-highlight',
      style,
      caseSensitive = false,
      wholeWord = false,
      maxLength
    } = options;

    // 截断文本
    const processedText = maxLength && text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;

    // 过滤并转义关键词
    const escapedKeywords = keywords
      .filter(keyword => keyword && keyword.trim())
      .map(keyword => this.escapeRegExp(keyword.trim()));

    if (escapedKeywords.length === 0) return processedText;

    // 构建正则表达式
    let regexPattern = escapedKeywords.join('|');
    if (wholeWord) {
      regexPattern = `\\b(${regexPattern})\\b`;
    } else {
      regexPattern = `(${regexPattern})`;
    }
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(regexPattern, flags);

    // 构建样式字符串
    const styleAttr = style 
      ? (typeof style === 'string' ? style : this.objectToStyleString(style))
      : '';
    
    const styleString = styleAttr ? ` style="${styleAttr}"` : '';

    // 执行替换
    return processedText.replace(regex, `<mark class="${className}"${styleString}>$1</mark>`);
  }

  /**
   * 智能高亮（自动分词）
   */
  static smartHighlight(
    text: string,
    searchQuery: string,
    options: HighlightOptions = {}
  ): string {
    if (!text || !searchQuery) return text;

    // 简单分词：按空格、标点符号分割
    const keywords = searchQuery
      .split(/[\s\-_.,，。、！？;；:：]+/)
      .filter(keyword => keyword.length > 0);

    return this.highlightMultipleKeywords(text, keywords, options);
  }

  /**
   * 获取高亮摘要
   * 自动截取包含关键词的文本片段
   */
  static getHighlightSnippet(
    text: string,
    keyword: string,
    options: {
      maxLength?: number;
      contextLength?: number;
      className?: string;
      style?: React.CSSProperties | string;
    } = {}
  ): string {
    if (!text || !keyword) return text;

    const {
      maxLength = 200,
      contextLength = 50,
      className = 'search-highlight',
      style
    } = options;

    // 如果文本长度小于最大长度，直接高亮返回
    if (text.length <= maxLength) {
      return this.highlightSingleKeyword(text, keyword, { className, style });
    }

    // 查找关键词位置
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);

    let snippet: string;
    
    if (index === -1) {
      // 没找到关键词，返回开头部分
      snippet = text.substring(0, maxLength) + '...';
    } else {
      // 找到关键词，提取上下文
      const start = Math.max(0, index - contextLength);
      const end = Math.min(text.length, index + keyword.length + contextLength);
      
      let extractedText = text.substring(start, end);
      
      // 添加省略号
      if (start > 0) extractedText = '...' + extractedText;
      if (end < text.length) extractedText = extractedText + '...';
      
      snippet = extractedText;
    }

    // 高亮关键词
    return this.highlightSingleKeyword(snippet, keyword, { className, style });
  }

  /**
   * 移除HTML标签
   */
  static stripHtml(html: string): string {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    }
    
    // 后备方案：使用正则表达式
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * 转义正则表达式特殊字符
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 将样式对象转换为CSS字符串
   */
  private static objectToStyleString(styleObj: React.CSSProperties): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // 将驼峰转换为连字符
        const cssKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  /**
   * 预定义样式
   */
  static styles = {
    // 默认高亮样式
    default: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '0 2px',
      borderRadius: '2px',
      fontWeight: 'bold',
    },
    
    // 强调高亮
    emphasis: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '1px 4px',
      borderRadius: '3px',
      fontWeight: 'bold',
      border: '1px solid #c3e6cb',
    },
    
    // 警告高亮
    warning: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '1px 4px',
      borderRadius: '3px',
      fontWeight: 'bold',
    },
    
    // 信息高亮
    info: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      padding: '1px 4px',
      borderRadius: '3px',
      fontWeight: 'bold',
    },
  };
}

/**
 * 便捷方法导出
 */
export const highlightText = HighlightTextHelper.highlightSingleKeyword;
export const highlightMultiple = HighlightTextHelper.highlightMultipleKeywords;
export const smartHighlight = HighlightTextHelper.smartHighlight;
export const getSnippet = HighlightTextHelper.getHighlightSnippet;
export const stripHtml = HighlightTextHelper.stripHtml;

export default HighlightTextHelper;