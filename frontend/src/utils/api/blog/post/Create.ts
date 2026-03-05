export interface CreatePostProps {
  title: string;
  description: string;
  content: string;
  keywords: string;
  slug: string;
  category: string;
  status: string;
  thumbnail?: string;
}
export default async function createPost(props: CreatePostProps) {
  try {
    const res = await fetch('/api/blog/post/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
  return null;
}
