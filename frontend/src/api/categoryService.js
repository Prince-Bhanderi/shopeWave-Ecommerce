import axiosClient from './axiosClient';

const categoryService = {
  getCategories: (params) => axiosClient.get('/categories', { params }),
  getCategoryById: (idOrSlug) => axiosClient.get(`/categories/${idOrSlug}`),
  getCategoryProducts: (idOrSlug, params) => axiosClient.get(`/categories/${idOrSlug}/products`, { params }),
  createCategory: (payload) => axiosClient.post('/categories', payload),
  updateCategory: (id, payload) => axiosClient.put(`/categories/${id}`, payload),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),
};

export default categoryService;
