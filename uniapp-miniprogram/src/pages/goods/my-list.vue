<template>
  <view class="container">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'selling' }"
        @click="activeTab = 'selling'"
      >
        <text>在售中</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'sold' }"
        @click="activeTab = 'sold'"
      >
        <text>已售出</text>
      </view>
    </view>

    <scroll-view 
      class="goods-scroll" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="goods-list">
        <view 
          class="goods-item" 
          v-for="goods in goodsList" 
          :key="goods.id"
          @click="goToDetail(goods.id)"
        >
          <image class="goods-image" :src="getImageUrl(goods.images[0])" mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-desc">{{ goods.description }}</text>
            <view class="goods-footer">
              <text class="goods-price">¥{{ goods.price }}</text>
              <text class="goods-status">{{ goods.status === 1 ? '在售' : '已售出' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="goodsList.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMyGoods, type Goods } from '@/api/goods'

const activeTab = ref('selling')
const goodsList = ref<Goods[]>([])
const refreshing = ref(false)

function getImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

async function loadGoods() {
  refreshing.value = true
  try {
    const result = await getMyGoods()
    if (activeTab.value === 'selling') {
      goodsList.value = result.filter(g => g.status === 1)
    } else {
      goodsList.value = result.filter(g => g.status === 0)
    }
  } catch (err) {
    console.error('加载失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

function onRefresh() {
  loadGoods()
}

watch(activeTab, () => {
  loadGoods()
})

onMounted(() => {
  loadGoods()
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

.goods-scroll {
  height: calc(100vh - 100rpx);
}

.goods-list {
  padding: 20rpx;
}

.goods-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
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

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.goods-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background-color: #f0f0f0;
  color: #666;
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