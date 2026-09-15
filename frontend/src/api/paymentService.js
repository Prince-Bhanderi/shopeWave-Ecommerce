import axiosClient from './axiosClient';

const paymentService = {
  createPaymentIntent: () => axiosClient.post('/payments/create-payment-intent'),
  createCashfreeOrder: (payload) => axiosClient.post('/payments/cashfree/create-order', payload),
};

export default paymentService;