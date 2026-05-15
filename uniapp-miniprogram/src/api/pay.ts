import { request } from '@/utils/request'

export interface PayData {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

export function createWechatPay(data: { orderId: string }) {
  return request<{ msg: string; payData: PayData; orderId: string }>({
    url: '/pay/wechat',
    method: 'POST',
    data
  })
}

export function getOrderStatus(orderId: string) {
  return request<{
    msg: string
    order: {
      id: string
      status: string
      goods: any
      buyer: any
      seller: any
    }
  }>({
    url: `/pay/order/${orderId}`,
    method: 'GET'
  })
}