// 文档相关类型定义

export interface Document {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  friendly_type: string;
  formatted_size: string;
  is_public: number;
  view_count: number;
  download_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_username: string;
  tag_count: number;
  tags?: DocumentTag[];
}

export interface DocumentTag {
  id: number;
  name: string;
  color?: string;
  created_at: string;
}

export interface DocumentStats {
  total: number;
  public: number;
  private: number;
  totalSize: number;
  totalViews: number;
  totalDownloads: number;
  myDocuments?: number;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
  stats: DocumentStats;
}

export interface DocumentDetailResponse {
  document: Document;
  canEdit: boolean;
  canDelete: boolean;
  downloadUrl: string;
}

export interface DocumentCreateRequest {
  title: string;
  description?: string;
  file: File;
  tags?: number[]; // Changed from string[] to number[] for tag IDs
  isPublic: boolean;
}

export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  tags?: number[]; // Changed from string[] to number[] for tag IDs
  is_public?: number; // 修复：使用后端期望的字段名和类型
}

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  mimeType?: string;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}