<template>
  <view class="line-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="goBack">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">商品详情</text>
      <view class="line-header-right">
        <view class="line-header-dot"></view>
      </view>
    </view>

    <scroll-view class="line-content-scroll" scroll-y>
      <view class="line-image-section">
        <view class="line-image-wrapper">
          <image class="line-goods-image" :src="getImageUrl(goods?.images?.[0])" mode="aspectFill" @error="handleImageError($event)" />
          <view class="line-image-border"></view>
        </view>
        <view class="line-sold-badge" v-if="isSold">
          <text class="line-sold-text">已售出</text>
        </view>
      </view>

      <view class="line-price-section">
        <view class="line-price-wrapper">
          <view class="line-currency">¥</view>
          <text class="line-price">{{ goods?.price }}</text>
        </view>
        <view class="line-price-line"></view>
      </view>

      <view class="line-info-card">
        <text class="line-goods-name">{{ goods?.name }}</text>
        <text class="line-goods-desc">{{ goods?.description }}</text>
      </view>

      <view class="line-meta-card">
        <view class="line-meta-item">
          <text class="line-meta-label">分类</text>
          <view class="line-meta-value-wrapper">
            <text class="line-meta-value">{{ getCategoryText(goods?.category) }}</text>
          </view>
        </view>
        <view class="line-divider"></view>
        <view class="line-meta-item">
          <text class="line-meta-label">发布时间</text>
          <view class="line-meta-value-wrapper">
            <text class="line-meta-value">{{ formatDate(goods?.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view class="line-seller-card">
        <view class="line-seller-header">
          <view class="line-seller-icon">
            <LineIcon name="user" />
          </view>
          <text class="line-seller-title">卖家信息</text>
          <view class="line-seller-line"></view>
        </view>
        <view class="line-seller-detail">
          <view class="line-seller-avatar-wrapper">
            <image class="line-seller-avatar" :src="getImageUrl(goods?.seller?.avatar)" mode="aspectFill" />
            <view class="line-avatar-border"></view>
          </view>
          <view class="line-seller-info">
            <text class="line-seller-name">{{ goods?.seller?.nickname || goods?.seller?.name || '用户' }}</text>
            <view class="line-seller-role-tag">
              <text class="line-seller-role">{{ goods?.seller?.role === 'admin' ? '管理员' : '普通用户' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <view class="line-bottom-bar" :class="{ 'disabled': isSold && !isFromFavorite }">
      <view class="line-bottom-left">
        <view class="line-action-item" @click="goToChat">
          <view class="line-action-icon">
            <LineIcon name="chat" />
          </view>
          <text class="line-action-text">聊天</text>
        </view>
        <view class="line-action-item" @click="collect">
          <view class="line-action-icon">
            <LineIcon name="heart" :active="collected" />
          </view>
          <text class="line-action-text">{{ collected ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="line-action-item" @click="handleShare">
          <view class="line-action-icon">
            <LineIcon name="share" />
          </view>
          <text class="line-action-text">分享</text>
        </view>
      </view>
      <view class="line-bottom-right">
        <view class="line-btn-outline" @click="goToContactSeller">联系卖家</view>
        <view class="line-btn-primary" :class="{ 'disabled': isSold }" @click="buyNow">
          <text class="line-btn-text">{{ isSold ? '已售出' : '立即购买' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getGoodsDetail, type Goods } from '@/api/goods'
import { createOrder } from '@/api/order'
import { addFavorite, removeFavorite, getFavorites } from '@/api/favorite'
import { createWechatPay } from '@/api/pay'
import { useUserStore } from '@/stores/user'
import { formatImageUrl } from '@/utils/request'
import LineIcon from '@/components/LineIcon.vue'

const goods = ref<Goods | null>(null)
const collected = ref(false)
const goodsId = ref('')
const userStore = useUserStore()
const isFromFavorite = ref(false)

const isSold = computed(() => {
  return goods.value?.status === 'SOLD' || goods.value?.status === 0
})

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

function getCategoryText(category?: string): string {
  const map: Record<string, string> = {
    'ELECTRONICS': '数码产品',
    'CLOTHING': '服饰鞋包',
    'BOOKS': '图书教材',
    'SPORTS': '运动户外',
    'LIFE': '生活用品',
    'OTHER': '其他'
  }
  return map[category || ''] || category || '未分类'
}

function getImageUrl(url?: string): string {
  if (!url) return 'https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0'
  return formatImageUrl(url)
}

function handleImageError(e: any) {
  const image = e.target
  image.src = formatImageUrl('')
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function goBack() {
  uni.navigateBack()
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
    url: `/pages/chat/index?goodsId=${goods.value?.id}&goodsName=${encodeURIComponent(goods.value?.name || '')}&otherId=${goods.value?.userId}&otherAvatar=${encodeURIComponent(goods.value?.seller?.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=Seller&backgroundColor=b6e3f4')}`
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
      uni.showToast({ title: '取消收藏', icon: 'none' })
    } else {
      await addFavorite(goods.value?.id?.toString() || '')
      collected.value = true
      uni.showToast({ title: '收藏成功', icon: 'none' })
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
            uni.showToast({ title: '链接已复制', icon: 'none' })
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
  if (isSold.value && !isFromFavorite.value) {
    uni.showModal({
      title: '提示',
      content: '该商品已售出，仅可查看详情',
      showCancel: false
    })
    return
  }

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
                uni.showToast({ title: '支付成功', icon: 'none' })
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
            uni.showToast({ title: '下单成功', icon: 'none' })
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
  if (options?.from === 'favorite') {
    isFromFavorite.value = true
  }
})

onMounted(() => {
  userStore.initFromStorage()
  if (goodsId.value) {
    loadData()
  }
})

onShow(() => {
  if (goodsId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
}

.line-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background-color: white;
  position: relative;
  z-index: 100;
  border-bottom: 3rpx solid $line-primary;
}

.line-back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.9);
  }
}

.line-header-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 4rpx;
}

.line-header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-header-dot {
  width: 12rpx;
  height: 12rpx;
  border: 3rpx solid $line-primary;
  border-radius: 50%;
}

.line-content-scroll {
  flex: 1;
  padding-bottom: 200rpx;
}

.line-image-section {
  position: relative;
  width: 100%;
}

.line-image-wrapper {
  width: 100%;
  height: 680rpx;
  overflow: hidden;
  position: relative;
  background-color: white;
  border-bottom: 3rpx solid $line-primary;
}

.line-goods-image {
  width: 100%;
  height: 100%;
}

.line-image-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border: 2rpx dashed $line-border;
  margin: 24rpx;
  border-radius: $line-radius-lg;
}

.line-sold-badge {
  position: absolute;
  top: 40rpx;
  left: 32rpx;
  z-index: 20;
  border: 4rpx solid $line-danger;
  background-color: white;
  padding: 16rpx 32rpx;
  border-radius: $line-radius;
}

.line-sold-text {
  color: $line-danger;
  font-size: $line-font-md;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.line-price-section {
  background-color: white;
  padding: 40rpx 32rpx;
  border-bottom: 3rpx solid $line-primary;
}

.line-price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.line-currency {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-accent;
  letter-spacing: 2rpx;
}

.line-price {
  font-size: 72rpx;
  font-weight: 700;
  color: $line-accent;
  letter-spacing: 4rpx;
}

.line-price-line {
  width: 120rpx;
  height: 4rpx;
  background-color: $line-accent;
  margin-top: 16rpx;
}

.line-info-card {
  margin: 24rpx 32rpx;
  background-color: white;
  border: 3rpx solid $line-primary;
  border-radius: $line-radius-lg;
  padding: 32rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    right: 12rpx;
    bottom: 12rpx;
    border: 1rpx dashed $line-border;
    border-radius: 8rpx;
    pointer-events: none;
  }
}

.line-goods-name {
  display: block;
  font-size: $line-font-xl;
  font-weight: 600;
  color: $line-primary;
  margin-bottom: 20rpx;
  line-height: 1.4;
  letter-spacing: 2rpx;
}

.line-goods-desc {
  font-size: $line-font-md;
  color: $line-secondary;
  line-height: 1.8;
  letter-spacing: 1rpx;
}

.line-meta-card {
  margin: 24rpx 32rpx;
  background-color: white;
  border: 3rpx solid $line-primary;
  border-radius: $line-radius-lg;
  padding: 32rpx;
}

.line-meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.line-meta-label {
  font-size: $line-font-md;
  color: $line-light;
  font-weight: 500;
  letter-spacing: 2rpx;
}

.line-meta-value-wrapper {
  border: 2rpx solid $line-border;
  padding: 12rpx 24rpx;
  border-radius: $line-radius;
}

.line-meta-value {
  font-size: $line-font-md;
  color: $line-primary;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.line-divider {
  height: 2rpx;
  background-color: $line-border;
  margin: 24rpx 0;
}

.line-seller-card {
  margin: 24rpx 32rpx;
  background-color: white;
  border: 3rpx solid $line-primary;
  border-radius: $line-radius-lg;
  padding: 32rpx;
}

.line-seller-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.line-seller-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-seller-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 3rpx;
}

.line-seller-line {
  flex: 1;
  height: 3rpx;
  background-color: $line-border;
  margin-left: 16rpx;
}

.line-seller-detail {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border: 2rpx dashed $line-border;
  border-radius: $line-radius;
}

.line-seller-avatar-wrapper {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.line-seller-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.line-avatar-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3rpx solid $line-primary;
  border-radius: 50%;
  pointer-events: none;
}

.line-seller-info {
  flex: 1;
}

.line-seller-name {
  display: block;
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.line-seller-role-tag {
  display: inline-flex;
  align-items: center;
  border: 2rpx solid $line-border;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.line-seller-role {
  font-size: $line-font-sm;
  color: $line-light;
  letter-spacing: 1rpx;
}

.line-bottom-space {
  height: 80rpx;
}

.line-bottom-bar {
  position: fixed;
  bottom: 24rpx;
  left: 24rpx;
  right: 24rpx;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  border: 4rpx solid $line-primary;
  border-radius: $line-radius-lg;
  z-index: 200;
  transition: all 0.2s ease;
}

.line-bottom-bar.disabled {
  opacity: 0.5;
}

.line-bottom-left {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.line-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.9);
  }
}

.line-action-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-action-text {
  font-size: $line-font-sm;
  color: $line-light;
  letter-spacing: 1rpx;
  font-weight: 500;
}

.line-bottom-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.line-btn-outline {
  border: 3rpx solid $line-primary;
  color: $line-primary;
  padding: 16rpx 32rpx;
  border-radius: $line-radius;
  font-size: $line-font-md;
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
  
  &:active {
    background-color: $line-primary;
    color: white;
    transform: scale(0.95);
  }
}

.line-btn-primary {
  border: 3rpx solid $line-accent;
  background-color: white;
  color: $line-accent;
  padding: 16rpx 36rpx;
  border-radius: $line-radius;
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
  
  &:active {
    background-color: $line-accent;
    color: white;
    transform: scale(0.95);
  }
}

.line-btn-primary.disabled {
  border-color: $line-border;
  color: $line-light;
  pointer-events: none;
}

.line-btn-text {
  font-size: $line-font-md;
}
</style>
