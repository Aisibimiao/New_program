<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <view class="order-card">
        <view class="order-header">
          <text class="order-id">订单号: {{ order?.id }}</text>
          <text class="order-status" :class="getStatusClass(order?.status)">
            {{ getStatusText(order?.status) }}
          </text>
        </view>

        <view class="goods-section">
          <text class="section-title">商品信息</text>
          <view class="goods-card" @click="goToGoodsDetail(order?.goods?.id)">
            <image class="goods-image" :src="getImageUrl(order?.goods?.images?.[0])" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ order?.goods?.name }}</text>
              <text class="goods-desc">{{ order?.goods?.description }}</text>
              <view class="goods-meta">
                <text class="goods-price">¥{{ order?.goods?.price }}</text>
                <text class="goods-condition">{{ getConditionText(order?.goods?.condition) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="seller-section" v-if="order?.goods?.seller">
          <text class="section-title">卖家信息</text>
          <view class="seller-card">
            <image class="seller-avatar" :src="getImageUrl(order?.goods?.seller?.avatar)" mode="aspectFill" />
            <view class="seller-info">
              <text class="seller-name">{{ order?.goods?.seller?.nickname || order?.goods?.seller?.name || '用户' }}</text>
              <text class="seller-role">{{ order?.goods?.seller?.role === 'admin' ? '管理员' : '普通用户' }}</text>
            </view>
          </view>
        </view>

        <view class="buyer-section" v-if="order?.buyer">
          <text class="section-title">买家信息</text>
          <view class="buyer-card">
            <image class="buyer-avatar" :src="getImageUrl(order?.buyer?.avatar)" mode="aspectFill" />
            <view class="buyer-info">
              <text class="buyer-name">{{ order?.buyer?.nickname || order?.buyer?.name || '用户' }}</text>
              <text class="buyer-role">{{ order?.buyer?.role === 'admin' ? '管理员' : '普通用户' }}</text>
            </view>
          </view>
        </view>

        <view class="order-info">
          <text class="section-title">订单信息</text>
          <view class="info-item">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ formatDate(order?.createdAt) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单状态</text>
            <text class="info-value status-text" :class="getStatusClass(order?.status)">
              {{ getStatusText(order?.status) }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar" v-if="order?.status === 'PENDING'">
      <view 
        v-if="isSeller" 
        class="btn-primary" 
        @click="handleConfirm"
      >
        <text>确认交易</text>
      </view>
      <view 
        v-if="!isSeller" 
        class="btn-secondary" 
        @click="handleCancel"
      >
        <text>取消订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, cancelOrder, confirmOrder } from '@/api/order'
import type { Order } from '@/api/order'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const orderId = ref('')
const order = ref<Order | null>(null)

const isSeller = computed(() => {
  return order.value?.goods?.userId === userStore.user?.id
})

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/svg?seed=User&backgroundColor=b6e3f4'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

function getStatusText(status?: string) {
  const map: Record<string, string> = {
    PENDING: '待确认',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return map[status || ''] || '未知'
}

function getStatusClass(status?: string) {
  const map: Record<string, string> = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
  return map[status || ''] || ''
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

function goToGoodsDetail(goodsId?: string) {
  if (!goodsId) return
  uni.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` })
}

async function handleCancel() {
  if (!orderId.value) return
  
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId.value)
          uni.showToast({ title: '取消成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (err: any) {
          uni.showToast({ title: err.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

async function handleConfirm() {
  if (!orderId.value) return
  
  uni.showModal({
    title: '确认交易',
    content: '确认已收到货款并交付商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmOrder(orderId.value)
          uni.showToast({ title: '确认成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (err: any) {
          uni.showToast({ title: err.message || '确认失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadData() {
  if (!orderId.value) return
  
  try {
    order.value = await getOrderDetail(orderId.value)
    uni.setNavigationBarTitle({ title: '订单详情' })
  } catch (err) {
    console.error('加载订单详情失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad((options) => {
  if (options?.id) {
    orderId.value = options.id
  }
})

onMounted(() => {
  loadData()
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
  padding: 20rpx;
  padding-bottom: 160rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-id {
  font-size: 28rpx;
  color: #999;
}

.order-status {
  font-size: 28rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  &.completed {
    background-color: #d4edda;
    color: #155724;
  }
  &.cancelled {
    background-color: #f8d7da;
    color: #721c24;
  }
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.goods-section, .seller-section, .buyer-section, .order-info {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}

.goods-card {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.goods-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.goods-info {
  flex: 1;
  padding-left: 20rpx;
}

.goods-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 15rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.goods-condition {
  font-size: 24rpx;
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.seller-card, .buyer-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.seller-avatar, .buyer-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.seller-info, .buyer-info {
  margin-left: 20rpx;
}

.seller-name, .buyer-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.seller-role, .buyer-role {
  font-size: 24rpx;
  color: #999;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  &.status-text.pending {
    color: #856404;
  }
  &.status-text.completed {
    color: #155724;
  }
  &.status-text.cancelled {
    color: #721c24;
  }
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
  justify-content: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn-secondary {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #333;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.btn-primary {
  width: 250rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>