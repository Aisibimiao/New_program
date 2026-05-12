<template>
  <view class="container">
    <scroll-view 
      class="favorite-scroll" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="favorite-list">
        <view 
          class="favorite-item" 
          v-for="item in favorites" 
          :key="item.id"
        >
          <view class="goods-card" @click="goToDetail(item.goodsId)">
            <image class="goods-image" :src="getImageUrl(item.goods?.images?.[0])" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.goods?.name }}</text>
              <text class="goods-desc">{{ item.goods?.description }}</text>
              <text class="goods-price">¥{{ item.goods?.price }}</text>
            </view>
          </view>
          <view class="remove-btn" @click="handleRemove(item.goodsId)">
            <text>移除</text>
          </view>
        </view>
      </view>

      <view v-if="favorites.length === 0" class="empty">
        <text class="empty-icon">🤍</text>
        <text class="empty-text">暂无收藏</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFavorites, removeFavorite } from '@/api/favorite'
import type { Favorite } from '@/api/favorite'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const favorites = ref<Favorite[]>([])
const refreshing = ref(false)

function getImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function goToDetail(goodsId: string) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` })
}

async function handleRemove(goodsId: string) {
  uni.showModal({
    title: '移除收藏',
    content: '确定要移除该收藏吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeFavorite(goodsId)
          uni.showToast({ title: '移除成功', icon: 'success' })
          loadFavorites()
        } catch (err: any) {
          uni.showToast({ title: err.message || '移除失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadFavorites() {
  refreshing.value = true
  try {
    favorites.value = await getFavorites()
  } catch (err) {
    console.error('加载收藏失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

function onRefresh() {
  loadFavorites()
}

onMounted(() => {
  userStore.initFromStorage()
  loadFavorites()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.favorite-scroll {
  height: 100vh;
}

.favorite-list {
  padding: 20rpx;
}

.favorite-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.goods-card {
  flex: 1;
  display: flex;
}

.goods-image {
  width: 180rpx;
  height: 180rpx;
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

.remove-btn {
  width: 100rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 30rpx;
  font-size: 26rpx;
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