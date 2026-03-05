import EditImage, { ImageData } from '@/components/forms/EditImage';
import EditRichText from '@/components/forms/EditRichText';
import EditSelect from '@/components/forms/EditSelect';
import EditText from '@/components/forms/EditText';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError, ToastSuccess } from '@/components/toast/toast';
import usePostCategories from '@/hooks/usePostCategories';
import { isRichTextEmpty } from '@/hooks/usePostForm';
import { IPost } from '@/interfaces/blog/IPost';

import fetchPost from '@/utils/api/blog/post/get';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

interface ComponentProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  slug: string;
  // loading: boolean
}

export default function EditPostModal({ open, setOpen, slug }: ComponentProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<IPost | null>(null);
  const [title, setTitle] = useState<string>('');
  const [Description, setDescription] = useState<string>('');
  const [Content, setContent] = useState<string>('');
  const [PostSlug, setPostSlug] = useState<string>('');
  const [Keywords, setKeywords] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');
  const [category, setCategory] = useState<string>('');

  const { categories, loading: loadingCategories } = usePostCategories();

  const [thumbnail, setThumbnail] = useState<ImageData | string | null>(null);
  const [hasChangesThumbnail, setHasChangesThumbnail] = useState<boolean>(false);
  const onLoadThumbnail = (newImage: ImageData) => {
    if (newImage?.file !== thumbnail?.file) {
      setThumbnail(newImage);
      setHasChangesThumbnail(true);
    }
  };

  const getPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchPost({ slug });
      if (res.status === 200) {
        setPost(res.results);
      } else {
        ToastError(
          `Error al obtener la información del post con slug: ${slug}. Estado: ${res.status}`,
        );
      }
    } catch {
      ToastError(`Error inesperado al obtener la información del post con slug: ${slug}`);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (open) {
      getPost();
    }
  }, [getPost, open]);

  useEffect(() => {
    if (post) {
      setTitle(post?.title || '');
      setDescription(post?.description || '');
      setPostSlug(post?.slug || '');
      setKeywords(post?.keywords || '');
      setCategory(post?.category?.slug || '');
      setThumbnail(post?.thumbnail || null);
      setContent(post?.content || '');
    }
  }, [post]);

  const handleOnSubmit = async () => {
    if (isRichTextEmpty(Content)) {
      ToastError('El contenido no puede estar vacío.');
      return;
    }
    if (!category?.trim()) {
      ToastError('Selecciona una categoría.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('post_slug', slug);
      formData.append('title', title);
      formData.append('description', Description);
      formData.append('content', Content);
      formData.append('keywords', Keywords);
      formData.append('slug', PostSlug);
      formData.append('category', category);
      formData.append('status', status);

      if (
        thumbnail &&
        typeof thumbnail === 'object' &&
        'file' in thumbnail &&
        thumbnail.file &&
        typeof thumbnail.file !== 'string'
      ) {
        formData.append(
          'thumbnail',
          thumbnail.file,
          `thumbnail_${Date.now()}_${thumbnail.file.name.replace(/\s/g, '_')}`,
        );
      }

      const res = await fetch('/api/blog/post/update/', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        ToastSuccess(data.message || `Post '${title}' actualizado correctamente!`);
        setTitle('');
        setDescription('');
        setContent('');
        setKeywords('');
        setPostSlug('');
        setCategory('');
        setStatus('draft');
        setThumbnail(null);
        setOpen(false);
      } else {
        ToastError(data.error || `Error al actualizar el post: ${res.statusText}`);
      }
    } catch {
      ToastError('Ocurrió un error inesperado al actualizar el post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  Editar Post: {title || 'Cargando...'}
                </DialogTitle>
              </div>
              <div className="mt-3 space-y-4">
                <EditText data={title} setData={setTitle} title="Título" />
                <EditText data={Description} setData={setDescription} title="Descripción" />
                <EditImage
                  onLoad={onLoadThumbnail}
                  title="Miniatura"
                  data={thumbnail}
                  setData={setThumbnail}
                />
                <EditRichText
                  data={Content}
                  setData={setContent}
                  title="Contenido"
                  maxTextLength={2400}
                />
                <EditText data={PostSlug} setData={setPostSlug} title="Slug" />
                <EditText data={Keywords} setData={setKeywords} title="Palabras Clave" />
                <EditSelect
                  title="Categoría"
                  data={category}
                  setData={setCategory}
                  disabled={loadingCategories}
                  options={categories.map((cat) => cat.slug)}
                  placeholder="Seleccionar categoría"
                  required
                />
                <EditSelect
                  title="Estado"
                  data={status}
                  setData={setStatus}
                  options={['draft', 'published']}
                  placeholder="Seleccionar estado"
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleOnSubmit}
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? <LoadingMoon /> : 'Guardar Cambios'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
