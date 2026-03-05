import { ToastError } from '@/components/toast/toast';
export interface ComponentProps {
  key: string; // Nombre deseado para el archivo local
  file: File; // El objeto File que quieres "subir" localmente
}

export async function uploadAndGetLocalURL(
  props: ComponentProps,
): Promise<string | { error: boolean; message: string }> {
  try {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/saved/GetSignedUrl', {
          // Endpoint para la subida local
          method: 'POST',
          body: JSON.stringify({ key: props.key, fileData: base64Data.split(',')[1] }), // Enviamos el nombre y los datos en base64 (sin el prefijo)
        });

        const data = await res.json();
        if (data.url) {
          resolve(data.url);
        } else {
          reject({ error: true, message: data.error || 'Failed to upload locally.' });
        }
      };

      reader.onerror = () => {
        reject({ error: true, message: 'Error reading the file.' });
      };

      reader.readAsDataURL(props.file);
    });
  } catch (error) {
    ToastError('Error uploading locally');
    return { error: true, message: 'An unknown error occurred during local upload.' };
  }
}
