import { request } from '@/utils/request'

export interface User {
  id: number
  nickname: string
  email: string
  avatar: string
  role: string
}

export function login(data: { email: string; password: string }) {
  return request<{ token: string; user: User }>({
    url: '/auth/login',
    method: 'POST',
    data: { account: data.email, password: data.password }
  })
}

export function register(data: {
  email: string
  password: string
  nickname: string
  code: string
}) {
  return request<{ token: string; user: User }>({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

export function getProfile() {
  return request<User>({
    url: '/auth/profile',
    method: 'GET'
  })
}

export function updateProfile(data: {
  nickname?: string
  avatar?: string
}) {
  return request<User>({
    url: '/auth/profile',
    method: 'PUT',
    data
  })
}

export function sendCode(email: string) {
  return request({
    url: '/auth/send-register-code',
    method: 'POST',
    data: { email }
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}
