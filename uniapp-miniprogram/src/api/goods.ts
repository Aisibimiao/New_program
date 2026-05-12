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
  price: number
  originalPrice: number
  images: string[]
  category: string
  condition: number
}) {
  return request<Goods>({
    url: '/goods',
    method: 'POST',
    data
  })
}

export async function uploadImage(filePath: string): Promise<string> {
  const result = await uploadFile('/goods/upload', filePath, 'file')
  return result.url
}
