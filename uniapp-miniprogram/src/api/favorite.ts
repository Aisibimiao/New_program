import { request } from '@/utils/request'
import type { Goods } from './goods'

export interface Favorite {
  id: string
  goodsId: string
  userId: string
  createdAt: string
  goods?: Goods
}

export function addFavorite(goodsId: string) {
  return request({
    url: '/favorites',
    method: 'POST',
    data: { goodsId }
  })
}

export function removeFavorite(goodsId: string) {
  return request({
    url: `/favorites/${goodsId}`,
    method: 'DELETE'
  })
}

export function getFavorites() {
  return request<Favorite[]>({
    url: '/favorites',
    method: 'GET'
  })
}