<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <swiper class="image-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(img, index) in imagesArray" :key="index">
          <image class="goods-image" :src="getImageUrl(img)" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <view class="goods-header">
        <text class="goods-price">¥{{ goods?.price }}</text>
        <text class="goods-original-price">原价 ¥{{ goods?.originalPrice }}</text>
      </view>

      <view class="goods-info">
        <text class="goods-name">{{ goods?.name }}</text>
        <text class="goods-desc">{{ goods?.description }}</text>
      </view>

      <view class="goods-meta">
        <view class="meta-item">
          <text class="meta-label">分类</text>
          <text class="meta-value">{{ goods?.category }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">成色</text>
          <text class="meta-value">{{ getConditionText(goods?.condition) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">发布时间</text>
          <text class="meta-value">{{ formatDate(goods?.createdAt) }}</text>
        </view>
      </view>

      <view class="seller-info">
        <text class="section-title">卖家信息</text>
        <view class="seller-card">
          <image class="seller-avatar" :src="getImageUrl(goods?.seller?.avatar)" mode="aspectFill" />
          <view class="seller-detail">
            <text class="seller-name">{{ goods?.seller?.nickname || goods?.seller?.name || '用户' }}</text>
            <text class="seller-role">{{ goods?.seller?.role === 'admin' ? '管理员' : '普通用户' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="bottom-left">
        <view class="action-item" @click="goToChat">
          <text class="action-icon">💬</text>
          <text class="action-text">聊天</text>
        </view>
        <view class="action-item" @click="collect">
          <text class="action-icon">{{ collected ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ collected ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-item" @click="handleShare">
          <text class="action-icon">🔗</text>
          <text class="action-text">分享</text>
        </view>
      </view>
      <view class="bottom-right">
        <view class="btn-secondary" @click="goToContactSeller">联系卖家</view>
        <view class="btn-primary" @click="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGoodsDetail, type Goods } from '@/api/goods'
import { createOrder } from '@/api/order'
import { addFavorite, removeFavorite, getFavorites } from '@/api/favorite'
import { createWechatPay } from '@/api/pay'
import { useUserStore } from '@/stores/user'

const goods = ref<Goods | null>(null)
const collected = ref(false)
const goodsId = ref('')
const userStore = useUserStore()

const imagesArray = ref<string[]>([])

function parseImages(images: any): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  if (typeof images === 'string' && images.startsWith('[')) {
    try {
      return JSON.parse(images)
    } catch {
      return []
    }
  }
  return []
}

function getImageUrl(url?: string): string {
  if (!url) return 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20image%20placeholder&image_size=square'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function getConditionText(condition?: number) {
  const map: Record<number, string> = {
    1: '全新',
    2: '几乎全新',
    3: '轻微使用',
    4: '明显使用'
  }
  return map[condition || 0] || '其他'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function goToChat() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '使用聊天功能需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }

  uni.navigateTo({
    url: `/pages/chat/index?goodsId=${goods.value?.id}&goodsName=${encodeURIComponent(goods.value?.name || '')}&otherId=${goods.value?.userId}&otherAvatar=${encodeURIComponent(goods.value?.seller?.avatar || '')}`
  })
}

async function collect() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '收藏商品需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }

  try {
    if (collected.value) {
      await removeFavorite(goods.value?.id?.toString() || '')
      collected.value = false
      uni.showToast({ title: '取消收藏', icon: 'success' })
    } else {
      await addFavorite(goods.value?.id?.toString() || '')
      collected.value = true
      uni.showToast({ title: '收藏成功', icon: 'success' })
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || '操作失败', icon: 'none' })
  }
}

function goToContactSeller() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '联系卖家需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }

  uni.makePhoneCall({
    phoneNumber: goods.value?.contact || '10086',
    fail: () => {
      uni.showToast({ title: '暂无联系方式', icon: 'none' })
    }
  })
}

function handleShare() {
  const shareUrl = `http://localhost:5173/goods/${goods.value?.id}`
  uni.showActionSheet({
    itemList: ['复制链接', '分享给朋友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.setClipboardData({
          data: shareUrl,
          success: () => {
            uni.showToast({ title: '链接已复制', icon: 'success' })
          }
        })
      } else if (res.tapIndex === 1) {
        uni.showToast({ title: '分享功能开发中', icon: 'none' })
      }
    }
  })
}

async function checkFavoriteStatus() {
  if (!userStore.token) return
  try {
    const favorites = await getFavorites()
    collected.value = favorites.some(fav => fav.goodsId === goodsId.value)
  } catch (err) {
    console.error('检查收藏状态失败', err)
  }
}

async function buyNow() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '购买商品需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }

  uni.showModal({
    title: '确认购买',
    content: `确定要购买「${goods.value?.name}」吗？价格：¥${goods.value?.price}`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中...' })
        try {
          const orderResult = await createOrder({ goodsId: goods.value?.id?.toString() || '' })
          const orderId = orderResult.order?.id || orderResult.data?.order?.id || ''

          if (orderId) {
            const payResult = await createWechatPay(orderId)
            uni.hideLoading()

            uni.requestPayment({
              provider: 'wxpay',
              timeStamp: payResult.payData?.timestamp || '',
              nonceStr: payResult.payData?.noncestr || '',
              package: payResult.payData?.package || '',
              signType: 'MD5',
              paySign: payResult.payData?.sign || '',
              success: () => {
                uni.showToast({ title: '支付成功', icon: 'success' })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              },
              fail: (err) => {
                uni.showToast({ title: err.errMsg || '支付失败', icon: 'none' })
              }
            })
          } else {
            uni.hideLoading()
            uni.showToast({ title: '下单成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        } catch (err: any) {
          uni.hideLoading()
          uni.showToast({ title: err.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadData() {
  try {
    const goodsResult = await getGoodsDetail(goodsId.value)
    goods.value = goodsResult
    imagesArray.value = parseImages(goodsResult?.images)
    await checkFavoriteStatus()
  } catch (err) {
    console.error('加载数据失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad((options) => {
  if (options?.id) {
    goodsId.value = options.id
  }
})

onMounted(() => {
  userStore.initFromStorage()
  if (goodsId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding-bottom: 160rpx;
}

.image-swiper {
  height: 600rpx;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.goods-header {
  background-color: #fff;
  padding: 30rpx;
  display: flex;
  align-items: baseline;
  gap: 20rpx;
}

.goods-price {
  font-size: 56rpx;
  font-weight: bold;
  color: #e74c3c;
}

.goods-original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.goods-info {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.goods-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.goods-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.goods-meta {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}

.meta-label {
  font-size: 28rpx;
  color: #999;
}

.meta-value {
  font-size: 28rpx;
  color: #333;
}

.seller-info {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.seller-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.seller-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.seller-detail {
  margin-left: 30rpx;
}

.seller-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.seller-role {
  font-size: 26rpx;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.bottom-left {
  display: flex;
  gap: 40rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 48rpx;
}

.action-text {
  font-size: 22rpx;
  color: #666;
  margin-top: 5rpx;
}

.bottom-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-secondary {
  width: 160rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #333;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.btn-primary {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>