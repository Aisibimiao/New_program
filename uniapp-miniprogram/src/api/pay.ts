import { request } from '@/utils/request'

export interface PayResult {
  msg: string
  payData: {
    appid: string
    partnerid: string
    prepayid: string
    noncestr: string
    timestamp: string
    package: string
    sign: string
  }
  order: any
}

export function createWechatPay(orderId: string) {
  return request<PayResult>({
    url: '/pay/wechat',
    method: 'POST',
    data: { orderId }
  })
}