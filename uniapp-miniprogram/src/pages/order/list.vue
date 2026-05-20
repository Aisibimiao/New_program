<template>
  <view class="container">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'buy' }"
        @click="activeTab = 'buy'"
      >
        <text>我买到的</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'sell' }"
        @click="activeTab = 'sell'"
      >
        <text>我卖出的</text>
      </view>
    </view>

    <scroll-view 
      class="order-scroll" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="order-list">
        <view 
          class="order-item" 
          v-for="order in orderList" 
          :key="order.id"
        >
          <view class="order-header">
            <text class="order-id">订单号: {{ order.id }}</text>
            <text class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </text>
          </view>
          
          <view class="order-content" @click="goToDetail(order.id)">
            <image class="goods-image" :src="getImageUrl(order.goods.images?.[0])" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ order.goods.name }}</text>
              <text class="goods-desc">{{ order.goods.description }}</text>
              <text class="goods-price">¥{{ order.goods.price }}</text>
            </view>
          </view>

          <view class="order-footer">
            <text class="order-time">{{ formatDate(order.createdAt) }}</text>
            <view class="order-actions">
              <view 
                v-if="order.status === 'PENDING'" 
                class="action-btn cancel"
                @click="handleCancel(order.id)"
              >
                <text>取消订单</text>
              </view>
              <view 
                v-if="order.status === 'PENDING' && activeTab === 'sell'" 
                class="action-btn confirm"
                @click="handleConfirm(order.id)"
              >
                <text>确认交易</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="orderList.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getBuyOrders, getSellOrders, cancelOrder, confirmOrder } from '@/api/order'
import type { Order } from '@/api/order'

const activeTab = ref('buy')
const orderList = ref<Order[]>([])
const refreshing = ref(false)

function getImageUrl(url?: string) {
  if (!url) return ''
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

function goToDetail(orderId: string) {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` })
}

async function handleCancel(orderId: string) {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId)
          uni.showToast({ title: '取消成功', icon: 'success' })
          loadOrders()
        } catch (err: any) {
          uni.showToast({ title: err.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

async function handleConfirm(orderId: string) {
  uni.showModal({
    title: '确认交易',
    content: '确认已收到货款并交付商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmOrder(orderId)
          uni.showToast({ title: '确认成功', icon: 'success' })
          loadOrders()
        } catch (err: any) {
          uni.showToast({ title: err.message || '确认失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadOrders() {
  refreshing.value = true
  try {
    if (activeTab.value === 'buy') {
      orderList.value = await getBuyOrders()
    } else {
      orderList.value = await getSellOrders()
    }
  } catch (err) {
    console.error('加载订单失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

function onRefresh() {
  loadOrders()
}

watch(activeTab, () => {
  loadOrders()
})

onMounted(() => {
  loadOrders()
})

onShow(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 32rpx;
  color: #666;
  &.active {
    color: #667eea;
    font-weight: bold;
    border-bottom: 4rpx solid #667eea;
  }
}

.order-scroll {
  height: calc(100vh - 100rpx);
}

.order-list {
  padding: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-id {
  font-size: 26rpx;
  color: #999;
}

.order-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
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

.order-content {
  display: flex;
  padding: 20rpx;
}

.goods-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.goods-info {
  flex: 1;
  padding: 0 20rpx;
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

.goods-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  &.cancel {
    background-color: #f5f5f5;
    color: #666;
  }
  &.confirm {
    background-color: #667eea;
    color: #fff;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
}
</style>