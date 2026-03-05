import { useState } from 'react';
import { ImageData } from '@/components/forms/EditImage';

export function isRichTextEmpty(str: string): boolean {
  return str.replace(/<[^>]+>/g, '').trim() === '';
}

export interface PostFormState {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  keywords: string;
  setKeywords: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  thumbnail: ImageData | null;
  setThumbnail: (v: ImageData | null) => void;
  hasChangesThumbnail: boolean;
  onLoadThumbnail: (newImage: ImageData) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  resetForm: () => void;
}

export default function usePostForm(initialStatus = 'published'): PostFormState {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [thumbnail, setThumbnail] = useState<ImageData | null>(null);
  const [hasChangesThumbnail, setHasChangesThumbnail] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLoadThumbnail = (newImage: ImageData) => {
    if (newImage?.file !== thumbnail?.file) {
      setThumbnail(newImage);
      setHasChangesThumbnail(true);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setKeywords('');
    setSlug('');
    setCategory('');
    setStatus(initialStatus);
    setThumbnail(null);
    setHasChangesThumbnail(false);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    keywords,
    setKeywords,
    slug,
    setSlug,
    category,
    setCategory,
    status,
    setStatus,
    thumbnail,
    setThumbnail,
    hasChangesThumbnail,
    onLoadThumbnail,
    loading,
    setLoading,
    resetForm,
  };
}

export function buildPostFormData(form: PostFormState): FormData {
  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('description', form.description);
  formData.append('content', form.content);
  formData.append('keywords', form.keywords);
  formData.append('slug', form.slug);
  formData.append('category', form.category);
  formData.append('status', form.status);

  if (form.thumbnail?.file && typeof form.thumbnail.file !== 'string') {
    formData.append(
      'thumbnail',
      form.thumbnail.file,
      `thumbnail_${Date.now()}_${form.thumbnail.file.name.replace(/\s/g, '_')}`,
    );
  }

  return formData;
}
