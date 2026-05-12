import request from './request';

export const createOrder = (data) => request.post('/orders', data);
export const confirmOrder = (orderId) => request.put(`/orders/${orderId}/confirm`);
export const cancelOrder = (orderId) => request.put(`/orders/${orderId}/cancel`);
export const deleteOrder = (orderId) => request.delete(`/orders/${orderId}`);
export const getBuyOrders = () => request.get('/orders/buy');
export const getSellOrders = () => request.get('/orders/sell');