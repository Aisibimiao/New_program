import request from './request';

export const sendRegisterCode = (data) => request.post('/auth/send-register-code', data);
export const register = (data) => request.post('/auth/register', data);
export const login = (data) => request.post('/auth/login', data);
export const sendResetCode = (data) => request.post('/auth/send-reset-code', data);
export const resetPassword = (data) => request.post('/auth/reset-password', data);
export const getProfile = () => request.get('/auth/profile');
export const updateProfile = (data) => request.put('/auth/profile', data);
export const uploadAvatar = (formData) => request.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});