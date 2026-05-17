<template>
  <view class="container">
    <view class="header-bar">
      <text class="title">我的收藏</text>
      <text class="count">共 {{ favorites.length }} 件商品</text>
    </view>

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
          <view class="goods-card" @click="goToDetail(item.goodsId, item.goods?.status)">
            <view class="sold-tag" v-if="item.goods?.status === 'SOLD' || item.goods?.status === 0">
              <text>已售出</text>
            </view>
            <image class="goods-image" :src="getImageUrl(item.goods?.images?.[0])" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.goods?.name }}</text>
              <text class="goods-desc">{{ item.goods?.description }}</text>
              <view class="goods-price-row">
                <text class="goods-price">¥{{ item.goods?.price }}</text>
                <text class="original-price" v-if="item.goods?.originalPrice">¥{{ item.goods?.originalPrice }}</text>
              </view>
            </view>
          </view>
          <view class="remove-btn" @click="handleRemove(item.goodsId)">
            <text>移除</text>
          </view>
        </view>
      </view>

      <view v-if="favorites.length === 0" class="empty">
        <view class="empty-icon">
          <LineIcon name="heart" />
        </view>
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
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()

const favorites = ref<Favorite[]>([])
const refreshing = ref(false)

function getImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function goToDetail(goodsId: string, status?: string | number) {
  const isSold = status === 'SOLD' || status === 0
  if (isSold) {
    uni.showModal({
      title: '提示',
      content: '该商品已售出，仅可查看详情',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: `/pages/goods/detail?id=${goodsId}&from=favorite` })
        }
      }
    })
  } else {
    uni.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` })
  }
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

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.count {
  font-size: 28rpx;
  color: #999;
}

.favorite-scroll {
  height: calc(100vh - 120rpx);
}

.favorite-list {
  padding: 20rpx;
}

.favorite-item {
  display: flex;
  align-items: stretch;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.goods-card {
  flex: 1;
  display: flex;
  position: relative;
  min-width: 0;
}

.sold-tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(231, 76, 60, 0.9);
  padding: 6rpx 16rpx;
  border-radius: 12rpx 0 12rpx 0;
  z-index: 1;
}

.sold-tag text {
  font-size: 22rpx;
  color: #fff;
}

.goods-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.goods-info {
  flex: 1;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 180rpx;
}

.goods-name {
  display: -webkit-box;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.goods-desc {
  display: -webkit-box;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  flex-shrink: 0;
}

.goods-price-row {
  display: flex;
  align-items: center;
}

.goods-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 24rpx;
  color: #ccc;
  text-decoration: line-through;
  margin-left: 15rpx;
}

.remove-btn {
  flex-shrink: 0;
  width: 100rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 30rpx;
  font-size: 26rpx;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
}
</style>