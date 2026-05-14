import { request, uploadFile } from '@/utils/request'

export interface Goods {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  condition: number
  status: number
  userId: string
  createdAt: string
  updatedAt: string
  seller?: {
    id: string
    nickname?: string
    name?: string
    avatar?: string
    email?: string
    role?: string
  }
  college?: string
  major?: string
  bookName?: string
  grade?: string
}

export function getGoods(params?: {
  page?: number
  limit?: number
  keyword?: string
  category?: string
}) {
  return request<{ list: Goods[]; total: number }>({
    url: '/goods',
    method: 'GET',
    data: params
  })
}

export function getMyGoods(params?: { page?: number; limit?: number }) {
  return request<Goods[]>({
    url: '/goods/my/list',
    method: 'GET',
    data: params
  })
}

export function getGoodsDetail(id: string) {
  return request<Goods>({
    url: `/goods/${id}`,
    method: 'GET'
  })
}

export function createGoods(data: {
  name: string
  description: string
  price: number | string
  originalPrice?: number | string
  images: string[]
  category: string
  college?: string
  major?: string
  bookName?: string
  grade?: string
}) {
  return request<Goods>({
    url: '/goods',
    method: 'POST',
    data
  })
}

export function updateGoods(id: string, data: {
  name?: string
  description?: string
  price?: number | string
  originalPrice?: number | string
  images?: string[]
  category?: string
  status?: number
  college?: string
  major?: string
  bookName?: string
  grade?: string
}) {
  return request<Goods>({
    url: `/goods/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteGoods(id: string) {
  return request({
    url: `/goods/${id}`,
    method: 'DELETE'
  })
}

export function offShelfGoods(id: string) {
  return updateGoods(id, { status: 0 })
}

export async function uploadImage(filePath: string): Promise<string> {
  try {
    const result = await uploadFile('/goods/upload', filePath, 'file')
    return result.url || result.data?.url || ''
  } catch (err) {
    console.error('上传失败', err)
    return ''
  }
}
