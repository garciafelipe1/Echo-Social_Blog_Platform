export default async function fetchAllCategories() {
  try {
    const res = await fetch(`/api/blog/categories/list_all`);
    const data = await res.json();
    if (!res.ok) return null;
    return data;
  } catch {
    return null;
  }
}
