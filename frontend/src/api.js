import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export async function fetchProducts({ category, limit, cursor } = {}) {
  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (cursor) params.cursor = cursor;

  const response = await api.get('/products', { params });
  return response.data;
}

export async function fetchCategories() {
  const response = await api.get('/categories');
  return response.data.data;
}