<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <view class="sold-badge" v-if="isSold">
        <text class="sold-text">已售出</text>
      </view>

      <image class="goods-image" :src="getImageUrl(goods?.images?.[0])" mode="aspectFill" @error="handleImageError($event)" />

      <view class="goods-header">
        <text class="goods-price">¥{{ goods?.price }}</text>
      </view>

      <view class="goods-info">
        <text class="goods-name">{{ goods?.name }}</text>
        <text class="goods-desc">{{ goods?.description }}</text>
      </view>

      <view class="goods-meta">
        <view class="meta-item">
          <text class="meta-label">分类</text>
          <text class="meta-value">{{ getCategoryText(goods?.category) }}</text>
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

    <view class="bottom-bar" :class="{ 'disabled': isSold && !isFromFavorite }">
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
        <view class="btn-primary" :class="{ 'btn-disabled': isSold }" @click="buyNow">{{ isSold ? '已售出' : '立即购买' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const isFromFavorite = ref(false)

const isSold = computed(() => {
  return goods.value?.status === 'SOLD' || goods.value?.status === 1
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
  if (!url || url === '[]') return 'https://via.placeholder.com/400x600/667EEA/FFFFFF?text=No+Image'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function handleImageError(e: any) {
  const image = e.target
  image.src = 'https://via.placeholder.com/400x600/667EEA/FFFFFF?text=No+Image'
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
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding-bottom: 180rpx;
}

.goods-image {
  width: 100%;
  height: 750rpx;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8edff 100%);
}

.goods-header {
  background-color: $bg-white;
  padding: $spacing-lg;
  position: relative;
}

.goods-price {
  font-size: 64rpx;
  font-weight: 700;
  color: $accent-color;
  letter-spacing: 2rpx;
  
  &::before {
    content: '¥';
    font-size: 40rpx;
    font-weight: 600;
    margin-right: 4rpx;
  }
}

.goods-info {
  background-color: $bg-white;
  margin: $spacing-md $spacing-lg;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  @include shadow-card;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.goods-name {
  display: block;
  font-size: $font-xl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-md;
  line-height: 1.4;
}

.goods-desc {
  font-size: $font-md;
  color: $text-secondary;
  line-height: 1.7;
}

.goods-meta {
  background-color: $bg-white;
  margin: $spacing-md $spacing-lg;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  @include shadow-card;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 2rpx solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
}

.meta-label {
  font-size: $font-md;
  color: $text-light;
  font-weight: 500;
}

.meta-value {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 600;
}

.seller-info {
  background-color: $bg-white;
  margin: $spacing-md $spacing-lg;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  @include shadow-card;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.seller-card {
  display: flex;
  align-items: center;
  padding: $spacing-lg;
  @include gradient-bg;
  border-radius: $radius-lg;
  transition: all $transition-normal;
  
  &:active {
    transform: scale(0.98);
    @include shadow-sm;
  }
}

.seller-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(102, 126, 234, 0.1);
}

.seller-detail {
  margin-left: $spacing-lg;
  flex: 1;
}

.seller-name {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.seller-role {
  font-size: $font-sm;
  color: $text-light;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140rpx;
  background-color: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  padding: 0 $spacing-lg;
  box-shadow: 0 -8rpx 40rpx rgba(102, 126, 234, 0.1);
  border-top: 2rpx solid rgba(102, 126, 234, 0.06);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-left {
  display: flex;
  gap: $spacing-xl;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xs;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.92);
  }
}

.action-icon {
  font-size: 56rpx;
}

.action-text {
  font-size: $font-xs;
  color: $text-secondary;
  margin-top: $spacing-xs;
  font-weight: 500;
}

.bottom-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
}

.btn-secondary {
  width: 180rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  @include gradient-bg;
  color: $primary-color;
  border-radius: $radius-full;
  font-size: $font-md;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.12);
  border: 2rpx solid rgba(102, 126, 234, 0.15);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.94);
    box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.18);
  }
}

.btn-primary {
  width: 220rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  @include gradient-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $font-md;
  font-weight: 600;
  box-shadow: 0 10rpx 32rpx rgba(102, 126, 234, 0.4);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.94);
    box-shadow: 0 5rpx 16rpx rgba(102, 126, 234, 0.5);
  }
}

.btn-disabled {
  background: $text-placeholder !important;
  box-shadow: none !important;
  
  &:active {
    transform: none;
  }
}

.sold-badge {
  position: absolute;
  top: $spacing-xl;
  left: $spacing-xl;
  z-index: 10;
  background: linear-gradient(135deg, $accent-color 0%, #dc3545 100%);
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  box-shadow: 0 6rpx 20rpx rgba(231, 76, 60, 0.4);
}

.sold-text {
  color: #fff;
  font-size: $font-md;
  font-weight: 600;
}

.disabled {
  opacity: 0.5;
}
</style>
