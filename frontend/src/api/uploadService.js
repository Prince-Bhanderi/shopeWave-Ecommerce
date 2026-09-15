import axiosClient from './axiosClient';

const uploadService = {
  uploadImages: (files, folder = 'products') => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    formData.append('folder', folder);
    return axiosClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (publicId) => axiosClient.delete('/upload', { data: { publicId } }),
};

export default uploadService;
