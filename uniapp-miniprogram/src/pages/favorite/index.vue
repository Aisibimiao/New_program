<template>
  <view class="line-favorite-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="goBack">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">我的收藏</text>
      <view class="line-header-right">
        <text class="line-count">{{ favorites.length }} 件</text>
      </view>
    </view>

    <scroll-view
      class="line-favorite-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="line-favorite-list">
        <view
          class="line-favorite-item"
          v-for="item in favorites"
          :key="item.id"
        >
          <view class="line-goods-card" @click="goToDetail(item.goodsId, item.goods?.status)">
            <view class="line-sold-tag" v-if="item.goods?.status === 'SOLD' || item.goods?.status === 0">
              <text>已售出</text>
            </view>
            <view class="line-image-wrapper">
              <image class="line-goods-image" :src="getImageUrl(item.goods?.images?.[0])" mode="aspectFill" />
              <view class="line-image-border"></view>
            </view>
            <view class="line-goods-info">
              <text class="line-goods-name">{{ item.goods?.name }}</text>
              <text class="line-goods-desc">{{ item.goods?.description }}</text>
              <view class="line-price-row">
                <text class="line-price">¥{{ item.goods?.price }}</text>
                <text class="line-original-price" v-if="item.goods?.originalPrice">¥{{ item.goods?.originalPrice }}</text>
              </view>
            </view>
          </view>
          <view class="line-remove-btn" @click="handleRemove(item.goodsId)">
            <LineIcon name="close" />
          </view>
        </view>
      </view>

      <view v-if="favorites.length === 0" class="line-empty">
        <view class="line-empty-icon">
          <LineIcon name="heart" />
        </view>
        <text class="line-empty-text">暂无收藏</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getFavorites, removeFavorite } from '@/api/favorite'
import type { Favorite } from '@/api/favorite'
import { useUserStore } from '@/stores/user'
import { formatImageUrl } from '@/utils/request'
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()

const favorites = ref<Favorite[]>([])
const refreshing = ref(false)

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0'
  return formatImageUrl(url)
}

function goBack() {
  uni.navigateBack()
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

onShow(() => {
  loadFavorites()
})
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-favorite-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
}

.line-favorite-scroll {
  flex: 1;
  padding: 24rpx;
}

.line-favorite-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.line-favorite-item {
  display: flex;
  align-items: stretch;
  background-color: #fff;
  border: $line-normal solid $line-border;
  border-radius: $line-radius;
  padding: 20rpx;
  position: relative;
}

.line-goods-card {
  flex: 1;
  display: flex;
  position: relative;
  min-width: 0;
}

.line-sold-tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #fff;
  border: $line-normal solid $line-danger;
  padding: 6rpx 16rpx;
  border-radius: $line-radius;
  z-index: 1;
}

.line-sold-tag text {
  font-size: 22rpx;
  color: $line-danger;
}

.line-image-wrapper {
  position: relative;
}

.line-goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: $line-radius-sm;
}

.line-image-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  pointer-events: none;
}

.line-goods-info {
  flex: 1;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 160rpx;
}

.line-goods-name {
  display: -webkit-box;
  font-size: $line-font-md;
  font-weight: 600;
  color: $line-primary;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.line-goods-desc {
  display: -webkit-box;
  font-size: $line-font-sm;
  color: $line-light;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  flex-shrink: 0;
}

.line-price-row {
  display: flex;
  align-items: center;
}

.line-price {
  font-size: 36rpx;
  font-weight: 700;
  color: $line-accent;
}

.line-original-price {
  font-size: 24rpx;
  color: $line-light;
  text-decoration: line-through;
  margin-left: 15rpx;
}

.line-remove-btn {
  flex-shrink: 0;
  width: 60rpx;
  height: 60rpx;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  color: $line-light;
}

.line-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.line-empty-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 30rpx;
  color: $line-light;
}

.line-empty-text {
  font-size: $line-font-md;
  color: $line-light;
}
</style>
