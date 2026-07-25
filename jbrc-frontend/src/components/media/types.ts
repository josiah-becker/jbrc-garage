export type MediaItem = {
  id: string;
  content_type: string;
  size_bytes: number;
  caption: string | null;
  created_at: string;
};

export type MediaUploadItem = {
  file: File;
  caption?: string;
};
