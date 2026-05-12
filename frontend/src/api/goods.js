import request from './request';

export const getGoods = (params) => request.get('/goods', { params });
export const getGoodsDetail = (id) => request.get(`/goods/${id}`);
export const createGoods = (data) => request.post('/goods', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateGoods = (id, data) => request.put(`/goods/${id}`, data);
export const deleteGoods = (id) => request.delete(`/goods/${id}`);
export const getMyGoods = () => request.get('/goods/my/list');