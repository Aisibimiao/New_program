import { request } from '@/utils/request'

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  goodsId: string
  createdAt: string
}

export function getMessages(goodsId: string, otherId: string) {
  return request<ChatMessage[]>({
    url: '/chat/messages',
    method: 'GET',
    data: { goodsId, otherId }
  })
}

export function sendMessage(data: {
  goodsId: string
  receiverId: string
  content: string
}) {
  return request<{ message: ChatMessage }>({
    url: '/chat/send',
    method: 'POST',
    data
  })
}