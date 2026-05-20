<template>
  <view class="container">
    <scroll-view class="message-list" scroll-y :refresher-enabled="true" @refresherrefresh="loadMessages" :scroll-into-view="scrollToId" scroll-with-animation>
      <view class="time-divider">
        <text class="time-text">{{ currentTime }}</text>
      </view>
      <view 
        class="message-item" 
        :class="{ 'message-self': msg.isSelf }" 
        v-for="(msg, index) in messages" 
        :key="index"
        :id="`msg-${index}`"
      >
        <image class="message-avatar" :src="msg.isSelf ? getImageUrl(selfAvatar) : getImageUrl(otherAvatar)" mode="aspectFill" />
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="input-section">
      <input class="input-box" v-model="inputText" placeholder="输入消息..." confirm-type="send" @confirm="sendMessage" />
      <view class="send-btn" @click="sendMessage">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { getMessages, sendMessage as apiSendMessage, type ChatMessage } from '@/api/chat'

const userStore = useUserStore()
const inputText = ref('')
const messages = ref<{ content: string; time: string; isSelf: boolean }[]>([])
const goodsId = ref('')
const goodsName = ref('')
const otherId = ref('')
const otherAvatar = ref('https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4')
const selfAvatar = ref('https://api.dicebear.com/9.x/initials/png?seed=Me&backgroundColor=b6e3f4')
const messageList = ref<uni.NodeInfo | null>(null)
const scrollToId = ref('')

const currentTime = ref('')

function updateCurrentTime() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${month}月${day}日 ${hours}:${minutes}`
}

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/png?seed=User&backgroundColor=b6e3f4'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function formatTime(dateStr?: string) {
  if (!dateStr) {
    const now = new Date()
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
  }
  const date = new Date(dateStr)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

function scrollToBottom() {
  nextTick(() => {
    const lastIndex = messages.value.length - 1
    if (lastIndex >= 0) {
      scrollToId.value = `msg-${lastIndex}`
      setTimeout(() => {
        scrollToId.value = ''
      }, 300)
    }
  })
}

async function loadMessages() {
  if (!goodsId.value || !otherId.value) return
  
  try {
    const result = await getMessages(goodsId.value, otherId.value)
    const messageList = result.map((msg: ChatMessage) => ({
      content: msg.content,
      time: formatTime(msg.createdAt),
      isSelf: msg.senderId === userStore.user?.id
    }))
    
    if (messageList.length === 0) {
      messages.value = [
        { content: '您好，有什么问题可以问我哦', time: formatTime(), isSelf: false }
      ]
    } else {
      messages.value = messageList
    }
    
    scrollToBottom()
  } catch (err) {
    console.error('加载消息失败', err)
    if (messages.value.length === 0) {
      messages.value = [
        { content: '您好，有什么问题可以问我哦', time: formatTime(), isSelf: false }
      ]
    }
  }
}

async function sendMessage() {
  if (!inputText.value.trim()) {
    uni.showToast({ title: '请输入消息内容', icon: 'none' })
    return
  }
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!userStore.user?.id) {
    uni.showToast({ title: '用户信息异常', icon: 'none' })
    return
  }
  if (!goodsId.value) {
    uni.showToast({ title: '商品信息异常', icon: 'none' })
    return
  }
  if (!otherId.value) {
    uni.showToast({ title: '对方信息异常', icon: 'none' })
    return
  }
  
  const selfMsg = {
    content: inputText.value,
    time: formatTime(),
    isSelf: true
  }
  
  messages.value.push(selfMsg)
  inputText.value = ''
  scrollToBottom()
  
  try {
    uni.showLoading({ title: '发送中...' })
    await apiSendMessage({
      goodsId: goodsId.value,
      receiverId: otherId.value,
      content: selfMsg.content
    })
    uni.hideLoading()
    
    setTimeout(() => {
      messages.value.push({
        content: '感谢您的留言，卖家会尽快回复您',
        time: formatTime(),
        isSelf: false
      })
      scrollToBottom()
    }, 1000)
  } catch (err: any) {
    uni.hideLoading()
    console.error('发送消息失败', err)
    uni.showToast({ title: err.message || '发送失败', icon: 'none' })
    // 如果发送失败，移除刚才添加的消息
    messages.value.pop()
  }
}

onLoad((options) => {
  if (options?.goodsId) goodsId.value = options.goodsId
  if (options?.goodsName) goodsName.value = decodeURIComponent(options.goodsName)
  if (options?.otherId) otherId.value = options.otherId
  if (options?.otherAvatar) otherAvatar.value = decodeURIComponent(options.otherAvatar) || 'https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4'
})

onMounted(() => {
  userStore.initFromStorage()
  
  // 无论用户是否登录，都设置头像
  if (userStore.user && userStore.user.avatar) {
    selfAvatar.value = userStore.user.avatar
  } else if (userStore.user) {
    selfAvatar.value = 'https://api.dicebear.com/9.x/initials/png?seed=' + encodeURIComponent(userStore.user.nickname || userStore.user.name || 'Me') + '&backgroundColor=b6e3f4'
  } else {
    selfAvatar.value = 'https://api.dicebear.com/9.x/initials/png?seed=Me&backgroundColor=b6e3f4'
  }
  
  if (!otherAvatar.value) {
    otherAvatar.value = 'https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4'
  }
  
  updateCurrentTime()
  uni.setNavigationBarTitle({ title: goodsName.value || '联系卖家' })
  loadMessages()
})

onShow(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.time-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30rpx 0;
}

.time-text {
  font-size: 24rpx;
  color: #999;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
  
  &.message-self {
    flex-direction: row-reverse;
    padding-right: 30rpx;
    
    .message-content {
      .message-text {
        background-color: #90EE90;
        color: #333;
      }
    }
    
    .message-avatar {
      margin-left: 16rpx;
      margin-right: 0;
    }
  }
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.message-content {
  max-width: 550rpx;
}

.message-text {
  background-color: #fff;
  padding: 20rpx 28rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.input-section {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}

.input-box {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 140rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  margin-left: 20rpx;
  font-size: 28rpx;
}
</style>