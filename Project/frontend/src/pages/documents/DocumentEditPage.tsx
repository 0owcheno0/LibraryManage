import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Form,
  Input,
  Switch,
  message,
  Spin,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { documentService } from '../../services/document';
import { ErrorHandler } from '../../utils/errorHandler';
import TagSelector from '../../components/TagSelector';
import type { Document } from '../../types';

const { Title } = Typography;

export default function DocumentEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useAuth();
  const { canEditDocument } = usePermission();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);

  // 获取文档详情
  const fetchDocument = async () => {
    if (!id || isNaN(Number(id))) {
      ErrorHandler.showError('无效的文档ID');
      navigate('/documents');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocument(Number(id));
      setDocument(data.document);
      
      // 设置表单初始值
      form.setFieldsValue({
        title: data.document.title,
        description: data.document.description,
        is_public: data.document.is_public === 1, // 修复：转换为布尔值
        tags: data.document.tags?.map(tag => tag.id) || []
      });
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message);
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // 保存文档
  const handleSave = async (values: any) => {
    if (!document) return;

    setSaving(true);
    try {
      // 更新文档信息
      await documentService.updateDocument(document.id, {
        title: values.title,
        description: values.description,
        is_public: values.is_public ? 1 : 0, // 修复：转换为数字
        tags: values.tags
      });

      message.success('文档更新成功');
      navigate(`/documents/${document.id}`);
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message);
      console.error('更新文档失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (document) {
      navigate(`/documents/${document.id}`);
    } else {
      navigate('/documents');
    }
  };

  // 检查权限
  if (document && !canEditDocument(document)) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="无权限编辑"
          description="您没有权限编辑此文档，请联系文档创建者或管理员。"
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleCancel}>
              返回详情
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            返回详情
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            编辑文档
          </Title>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchDocument}>
              重新加载
            </Button>
          }
        />
      ) : document ? (
        <Row justify="center">
          <Col xs={24} lg={16}>
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                autoComplete="off"
              >
                <Form.Item
                  name="title"
                  label="文档标题"
                  rules={[{ required: true, message: '请输入文档标题' }]}
                >
                  <Input placeholder="请输入文档标题" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="文档描述"
                >
                  <Input.TextArea 
                    placeholder="请输入文档描述" 
                    rows={4}
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="tags"
                  label="标签"
                >
                  <TagSelector
                    mode="multiple"
                    placeholder="选择或创建标签..."
                    allowCreate={true}
                    maxTagCount={10}
                  />
                </Form.Item>

                <Form.Item
                  name="is_public"
                  label="公开状态"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="公开" 
                    unCheckedChildren="私有" 
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      htmlType="submit" 
                      loading={saving}
                    >
                      保存
                    </Button>
                    <Button 
                      icon={<CloseOutlined />} 
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}