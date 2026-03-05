import formidable, { File } from 'formidable';
import { createReadStream, promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import parseCookies from '@/utils/cookies/parseCookies';

export const config = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'User unauthorized to make this request' });
  }

  try {
    const formDataPromise = new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        const form = formidable({ keepExtensions: true });
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({ fields, files });
        });
      },
    );

    const { fields, files } = await formDataPromise;
    const thumbnailFile = files.thumbnail as File | File[] | undefined;

    const djangoFormData = new FormData();
    for (const key in fields) {
      const value = fields[key];
      if (value) {
        djangoFormData.append(key, value.toString());
      }
    }

    if (thumbnailFile) {
      let file: File | undefined;
      if (Array.isArray(thumbnailFile) && thumbnailFile.length > 0) {
        file = thumbnailFile[0];
      } else if (!Array.isArray(thumbnailFile)) {
        file = thumbnailFile;
      }

      if (file?.filepath) {
        const fileStream = createReadStream(file.filepath);
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          fileStream.on('data', (chunk) => {
            // Dejamos que TypeScript infiera el tipo de 'chunk'
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); // Convertimos a Buffer si es string
          });
          fileStream.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
          fileStream.on('error', reject);
        });

        djangoFormData.append(
          'thumbnail',
          new Blob([fileBuffer]),
          file.originalFilename || 'thumbnail',
        );
      }
    }

    const apiRes = await fetch(`${process.env.API_URL}/api/blog/post/author/`, {
      method: 'PUT',
      headers: {
        Authorization: `JWT ${accessToken}`,
        Accept: 'application/json',
      },
      body: djangoFormData as any,
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (error) {
    console.error('Error communicating with Django:', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong while communicating with the backend' });
  }
}
