import Button from "@/components/Button";
import EditImage from "@/components/forms/EditImage";
import EditKeywords from "@/components/forms/EditKeywords";
import EditRichText from "@/components/forms/EditRichText";
import EditSelect from "@/components/forms/EditSelect";
import EditSlug from "@/components/forms/EditSlug";
import EditText from "@/components/forms/EditText";
import LoadingMoon from "@/components/loaders/LoadingMoon";
import { ToastError, ToastSuccess } from "@/components/toast/toast";
import { ICategoryList } from "@/interfaces/blog/ICategory";
import usePostForm, { buildPostFormData, isRichTextEmpty } from "@/hooks/usePostForm";

interface ComponentProps {
  categories: ICategoryList[];
  loadingCategories: boolean;
}

export default function CreatePost({ categories, loadingCategories }: ComponentProps) {
  const form = usePostForm('published');

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRichTextEmpty(form.content)) {
      ToastError('Content cannot be empty');
      return;
    }
    if (!form.category?.trim()) {
      ToastError('Please select a category');
      return;
    }
    form.setLoading(true);
    try {
      const formData = buildPostFormData(form);
      const res = await fetch('/api/blog/post/create/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        ToastSuccess(data.results || `Post '${form.title}' created successfully!`);
        form.resetForm();
      } else {
        ToastError(data.error || `Failed to create post: ${res.statusText}`);
      }
    } catch (error) {
      ToastError('An unexpected error occurred while creating the post.');
    } finally {
      form.setLoading(false);
    }
  };

  return (
    <form onSubmit={handleOnSubmit} className="space-y-5">
      <EditText title="Titulo" data={form.title} setData={form.setTitle} required />
      <EditText title="Descripcion" data={form.description} setData={form.setDescription} required />
      <EditRichText title="Contenido" data={form.content} setData={form.setContent} />
      <EditImage
        onLoad={form.onLoadThumbnail}
        title="Imagen"
        data={form.thumbnail}
        setData={form.setThumbnail}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EditKeywords title="Keywords" data={form.keywords} setData={form.setKeywords} required />
        <EditSlug title="Slug" data={form.slug} setData={form.setSlug} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EditSelect
          title="Categoria"
          data={form.category}
          setData={form.setCategory}
          disabled={loadingCategories}
          options={categories.map((cat) => cat.slug)}
          placeholder="Selecciona categoria"
        />
        <EditSelect
          title="Estado"
          data={form.status}
          setData={form.setStatus}
          options={['draft', 'published']}
          placeholder="Selecciona estado"
        />
      </div>
      <Button type="submit">{form.loading ? <LoadingMoon /> : 'Crear post'}</Button>
    </form>
  );
}
