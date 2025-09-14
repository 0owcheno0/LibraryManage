import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Card, Typography, Collapse, Tag } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * 全局错误边界组件
 * 捕获React组件树中的JavaScript错误并显示友好的错误界面
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新state，使下一次渲染能够显示错误UI
    return {
      hasError: true,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误日志到后端
    this.logErrorToService(error, errorInfo);
  }

  // 记录错误到后端服务
  logErrorToService = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // 生成唯一错误ID
      const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const errorLog = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };

      // 只使用本地存储，移除向不存在的API端点发送请求的代码
      // 存储到本地存储
      const localErrors = JSON.parse(localStorage.getItem('clientErrors') || '[]');
      localErrors.push(errorLog);
      // 只保留最近50个错误
      if (localErrors.length > 50) {
        localErrors.splice(0, localErrors.length - 50);
      }
      localStorage.setItem('clientErrors', JSON.stringify(localErrors));

      // 更新组件状态
      this.setState({ errorId });
    } catch (logError) {
      console.error('无法记录错误日志:', logError);
    }
  };

  // 重新加载页面
  handleReload = () => {
    window.location.reload();
  };

  // 返回首页
  handleGoHome = () => {
    window.location.href = '/';
  };

  // 重置错误状态
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div style={{ padding: '24px', minHeight: '400px' }}>
          <Result
            status="500"
            title="应用程序出现错误"
            subTitle="很抱歉，应用程序遇到了意外错误。我们已经记录了此问题，请稍后重试。"
            icon={<BugOutlined />}
            extra={
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Button type="primary" onClick={this.handleRetry} style={{ marginRight: '8px' }}>
                    <ReloadOutlined /> 重新尝试
                  </Button>
                  <Button onClick={this.handleReload} style={{ marginRight: '8px' }}>
                    刷新页面
                  </Button>
                  <Button onClick={this.handleGoHome}>
                    <HomeOutlined /> 返回首页
                  </Button>
                </div>
                
                {this.state.errorId && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">错误ID: </Text>
                    <Tag color="red">{this.state.errorId}</Tag>
                  </div>
                )}
              </div>
            }
          />

          {/* 开发环境显示详细错误信息 */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Card title="错误详情 (仅开发环境显示)" style={{ marginTop: '24px' }}>
              <Collapse
                items={[
                  {
                    key: '1',
                    label: '错误信息',
                    children: (
                      <Paragraph>
                        <Text strong>错误消息:</Text>
                        <br />
                        <Text code>{this.state.error.message}</Text>
                      </Paragraph>
                    ),
                  },
                  {
                    key: '2',
                    label: '错误堆栈',
                    children: (
                      <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.error.stack}
                      </pre>
                    ),
                  },
                  ...(this.state.errorInfo ? [{
                    key: '3',
                    label: '组件堆栈',
                    children: (
                      <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    ),
                  }] : []),
                ]}
              />
            </Card>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook：手动报告错误
 */
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    // 创建一个错误事件
    const errorEvent = new ErrorEvent('error', {
      error,
      message: error.message,
      filename: context || 'manual-report'
    });
    
    // 触发全局错误处理
    window.dispatchEvent(errorEvent);
  };

  return { reportError };
}