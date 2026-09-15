import axiosClient from './axiosClient';

const productService = {
  getProducts: (params) => axiosClient.get('/products', { params }),
  getProductById: (idOrSlug) => axiosClient.get(`/products/${idOrSlug}`),
  createProduct: (payload) => axiosClient.post('/products', payload),
  updateProduct: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
  updateStock: (id, stock) => axiosClient.patch(`/products/${id}/stock`, { stock }),
};

export default productService;
