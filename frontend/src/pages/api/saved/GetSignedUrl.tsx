import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises'; // Usamos fs.promises para async/await

// Configuración para la carpeta de subidas local
const UPLOADS_FOLDER = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { key, fileData } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Missing key in request body.' });
      }
      if (!fileData) {
        return res.status(400).json({ error: 'Missing file data in request body.' });
      }

      try {
        await fs.mkdir(UPLOADS_FOLDER, { recursive: true });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create uploads folder.' });
      }

      const filePath = path.join(UPLOADS_FOLDER, key);

      try {
        const buffer = Buffer.from(fileData, 'base64');
        await fs.writeFile(filePath, buffer);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to write file.' });
      }

      const localFileURL = `/uploads/${key}`;
      return res.status(200).json({ results: localFileURL });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to handle file upload.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
