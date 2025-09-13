import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useThemeColors } from '../../contexts/ThemeContext';

const { Title } = Typography;
const { TextArea } = Input;

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  tags: string[];
  uploadUser: string;
  uploadTime: string;
  downloadCount: number;
  viewCount: number;
}

export default function DocumentListPage() {
  const [uploadVisible, setUploadVisible] = useState(false);
  const [form] = Form.useForm();
  const colors = useThemeColors();

  // 模拟数据
  const documents: Document[] = [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const columns: ColumnsType<Document> = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: size => formatFileSize(size),
      width: 100,
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 80,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map(tag => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '上传者',
      dataIndex: 'uploadUser',
      key: 'uploadUser',
      width: 100,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 120,
    },
    {
      title: '下载/浏览',
      key: 'stats',
      render: (_, record) => `${record.downloadCount}/${record.viewCount}`,
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small" />
          <Button type="text" icon={<DownloadOutlined />} size="small" />
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" icon={<DeleteOutlined />} danger size="small" />
        </Space>
      ),
      width: 140,
      fixed: 'right',
    },
  ];

  const handleUpload = async (values: any) => {
    try {
      console.log('上传文档:', values);
      message.success('文档上传成功');
      setUploadVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('文档上传失败');
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          文档管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadVisible(true)}>
          上传文档
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ marginBottom: 16, fontSize: 16, color: '#999' }}>暂无文档数据</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setUploadVisible(true)}
                >
                  立即上传文档
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title="上传文档"
        open={uploadVisible}
        onCancel={() => {
          setUploadVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="file"
            label="选择文件"
            rules={[{ required: true, message: '请选择要上传的文件' }]}
          >
            <Upload.Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 PDF、Word、Excel、PowerPoint、文本和图片文件</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="title"
            label="文档标题"
            rules={[{ required: true, message: '请输入文档标题' }]}
          >
            <Input placeholder="请输入文档标题" />
          </Form.Item>

          <Form.Item name="description" label="文档描述">
            <TextArea rows={3} placeholder="请输入文档描述（可选）" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="multiple"
              placeholder="选择标签"
              options={[
                { label: '技术文档', value: '技术文档' },
                { label: '产品文档', value: '产品文档' },
                { label: 'API文档', value: 'API文档' },
                { label: '用户手册', value: '用户手册' },
                { label: '项目文档', value: '项目文档' },
              ]}
            />
          </Form.Item>

          <Form.Item name="visibility" label="可见性" initialValue={2}>
            <Select>
              <Select.Option value={1}>私有</Select.Option>
              <Select.Option value={2}>团队</Select.Option>
              <Select.Option value={3}>公开</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
