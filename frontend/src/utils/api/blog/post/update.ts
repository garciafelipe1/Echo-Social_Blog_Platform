export interface UpdatePostProps {
  title: string;
  description: string;
  content: string;
  keywords: string;
  slug: string; // El slug del post a actualizar
  category: string;
  status: string;
  thumbnail?: string;
}

export default async function updatePost(props: UpdatePostProps) {
  try {
    const res = await fetch(`/api/blog/post/update/`, {
      // Incluimos el slug en la URL
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props), // Enviamos el resto de los datos como JSON
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error al actualizar el post:', err);
    return { error: 'Error al comunicarse con el servidor' }; // Devuelve un objeto de error más informativo
  }
}
