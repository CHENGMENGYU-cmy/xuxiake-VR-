import apiClient from './api-client';

export interface UploadImageResult {
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
}

export interface LinkPreview {
  title: string;
  description: string;
  favicon: string;
  image?: string;
}

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export async function uploadImage(file: File): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const result = data.data;
  return {
    ...result,
    url: BACKEND_BASE + result.url,
  };
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('无法加载图片'));
    };
    img.src = url;
  });
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const { data } = await apiClient.post('/upload/links/preview', { url });
  return data.data;
}
