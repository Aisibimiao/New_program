import { request } from '@/utils/request'

export interface Order {
  id: string
  goodsId: string
  buyerId: string
  status: string
  contactInfo: string
  createdAt: string
  updatedAt: string
  goods?: any
  buyer?: any
}

export function createOrder(data: { goodsId: string; contactInfo?: string }) {
  return request<{ order: Order }>({
    url: '/orders',
    method: 'POST',
    data
  })
}

export function getBuyOrders() {
  return request<Order[]>({
    url: '/orders/buy',
    method: 'GET'
  })
}

export function getSellOrders() {
  return request<Order[]>({
    url: '/orders/sell',
    method: 'GET'
  })
}

export function confirmOrder(orderId: string) {
  return request({
    url: `/orders/${orderId}/confirm`,
    method: 'PUT'
  })
}

export function shipOrder(orderId: string) {
  return request({
    url: `/orders/${orderId}/ship`,
    method: 'PUT'
  })
}

export function receiveOrder(orderId: string) {
  return request({
    url: `/orders/${orderId}/receive`,
    method: 'PUT'
  })
}

export function cancelOrder(orderId: string) {
  return request({
    url: `/orders/${orderId}/cancel`,
    method: 'PUT'
  })
}

export function getOrderDetail(orderId: string) {
  return request<Order>({
    url: `/orders/${orderId}`,
    method: 'GET'
  })
}