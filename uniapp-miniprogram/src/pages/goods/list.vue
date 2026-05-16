<template>
  <view class="container">
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="search"
        />
        <view class="search-btn" @click="search">
          <text>搜索</text>
        </view>
      </view>
    </view>

    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-list">
          <view
            class="filter-item"
            :class="{ active: !category }"
            @click="setCategory('')"
          >
            <text>全部</text>
          </view>
          <view
            class="filter-item"
            v-for="cat in categories"
            :key="cat"
            :class="{ active: category === cat }"
            @click="setCategory(cat)"
          >
            <text>{{ cat }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="active-filter" v-if="keyword || category">
      <view class="filter-tag" v-if="keyword">
        <text>搜索: {{ keyword }}</text>
        <text class="tag-close" @click="clearKeyword">×</text>
      </view>
      <view class="filter-tag" v-if="category">
        <text>分类: {{ category }}</text>
        <text class="tag-close" @click="clearCategory">×</text>
      </view>
    </view>

    <scroll-view
      class="goods-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view class="goods-grid">
        <view
          class="goods-item"
          v-for="goods in goodsList"
          :key="goods.id"
          @click="goToDetail(goods.id)"
        >
          <image class="goods-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" @error="handleImageError($event)" />
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-desc">{{ goods.description }}</text>
            <view class="goods-footer">
              <text class="goods-price">¥{{ goods.price }}</text>
              <text class="goods-condition">{{ getConditionText(goods.condition) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>

      <view v-if="!loading && !hasMore" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <view class="tab-bar">
      <view class="tab-item" @click="switchToHome()">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">📦</text>
        <text class="tab-text">商品</text>
      </view>
      <view class="tab-item" @click="switchToProfile()">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGoods, type Goods } from '@/api/goods'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const keyword = ref('')
const goodsList = ref<Goods[]>([])
const page = ref(1)
const limit = ref(10)
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)
const category = ref('')

const categories = ['数码产品', '服饰鞋包', '图书教材', '运动户外', '生活用品', '其他']

function getImageUrl(url?: string): string {
  if (!url || url === '[]') return 'https://via.placeholder.com/400x280/667EEA/FFFFFF?text=No+Image'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `http://localhost:3000${url}`
  return url
}

function handleImageError(e: any) {
  const image = e.target
  image.src = 'https://via.placeholder.com/400x280/667EEA/FFFFFF?text=No+Image'
}

// function getConditionText(condition: number) {
//   const map: Record<number, string> = {
//     1: '全新',
//     2: '几乎全新',
//     3: '轻微使用',
//     4: '明显使用'
//   }
//   return map[condition] || '其他'
// }

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

function switchToHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function switchToProfile() {
  uni.navigateTo({ url: '/pages/user/profile' })
}

function setCategory(cat: string) {
  category.value = cat
  page.value = 1
  hasMore.value = true
  loadGoods(true)
}

function clearKeyword() {
  keyword.value = ''
  page.value = 1
  hasMore.value = true
  loadGoods(true)
}

function clearCategory() {
  category.value = ''
  page.value = 1
  hasMore.value = true
  loadGoods(true)
}

async function loadGoods(isRefresh = false) {
  if (loading.value) return

  loading.value = true

  try {
    const params: Record<string, any> = {
      page: isRefresh ? 1 : page.value,
      limit: limit.value
    }
    if (keyword.value) params.keyword = keyword.value
    if (category.value) params.category = category.value

    const result = await getGoods(params)

    if (isRefresh) {
      goodsList.value = result.list
      page.value = 1
    } else {
      goodsList.value = [...goodsList.value, ...result.list]
    }

    hasMore.value = result.list.length >= limit.value
    if (hasMore.value) page.value++
  } catch (err) {
    console.error('加载商品失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function search() {
  page.value = 1
  hasMore.value = true
  loadGoods(true)
}

function onRefresh() {
  refreshing.value = true
  loadGoods(true)
}

function loadMore() {
  if (hasMore.value && !loading.value) {
    loadGoods()
  }
}

onLoad((options) => {
  if (options?.category) {
    category.value = options.category
  }
})

onMounted(() => {
  userStore.initFromStorage()
  loadGoods()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
}

.search-bar {
  padding: $spacing-lg;
  @include gradient-primary;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -20%;
    width: 50%;
    height: 80%;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 50%;
  }
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: $bg-white;
  border-radius: $radius-full;
  padding: 0 $spacing-lg;
  height: 96rpx;
  box-shadow: 0 10rpx 36rpx rgba(102, 126, 234, 0.22);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  transition: all $transition-normal;
  position: relative;
  z-index: 1;
  
  &:active {
    transform: scale(0.97);
    box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.search-icon {
  font-size: $font-lg;
  margin-right: $spacing-md;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
}

.search-btn {
  padding: $spacing-sm $spacing-lg;
  @include gradient-primary;
  color: #fff;
  border-radius: $radius-lg;
  font-size: $font-sm;
  font-weight: 600;
  margin-left: $spacing-md;
  box-shadow: 0 6rpx 18rpx rgba(102, 126, 234, 0.35);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.94);
    box-shadow: 0 3rpx 9rpx rgba(102, 126, 234, 0.45);
  }
}

.filter-bar {
  background-color: $bg-white;
  padding: $spacing-sm 0;
  border-bottom: 2rpx solid $border-color;
  position: sticky;
  top: 0;
  z-index: 50;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: inline-flex;
  padding: 0 $spacing-md;
  gap: $spacing-md;
}

.filter-item {
  padding: $spacing-sm $spacing-lg;
  background-color: $bg-color;
  border-radius: $radius-full;
  font-size: $font-md;
  color: $text-secondary;
  transition: all $transition-normal;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  border: 2rpx solid transparent;
  
  &.active {
    @include gradient-primary;
    color: #fff;
    box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.35);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.96);
  }
}

.active-filter {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  background-color: $bg-white;
  border-bottom: 2rpx solid $border-color;
}

.filter-tag {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
  border-radius: $radius-lg;
  font-size: $font-sm;
  color: #856404;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.94);
  }
}

.tag-close {
  margin-left: $spacing-sm;
  font-size: $font-md;
  color: #dc3545;
  padding: 0 $spacing-xs;
}

.goods-scroll {
  height: calc(100vh - 120rpx - $tabbar-height - constant(safe-area-inset-bottom));
  height: calc(100vh - 120rpx - $tabbar-height - env(safe-area-inset-bottom));
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: $spacing-md;
  box-sizing: border-box;
}

.goods-item {
  width: calc(50% - $spacing-sm);
  margin-right: $spacing-md;
  margin-bottom: $spacing-md;
  background-color: $bg-white;
  border-radius: $radius-xl;
  overflow: hidden;
  @include shadow-card;
  transition: all $transition-slow;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
  
  &:nth-child(2n) {
    margin-right: 0;
  }
  
  &:active {
    transform: translateY(-12rpx) scale(1.02);
    @include shadow-card-hover;
  }
}

.goods-image {
  width: 100%;
  height: 320rpx;
  @include gradient-bg;
  transition: transform $transition-slow;
  
  .goods-item:active & {
    transform: scale(1.05);
  }
}

.goods-info {
  padding: $spacing-md;
}

.goods-name {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
  @include text-clamp(2);
  line-height: 1.5;
}

.goods-desc {
  display: block;
  font-size: $font-xs;
  color: $text-light;
  margin-bottom: $spacing-md;
  @include text-ellipsis;
}

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: $font-xxl;
  font-weight: 700;
  color: $accent-color;
  letter-spacing: 2rpx;
}

.goods-condition {
  font-size: $font-xs;
  color: $info-color;
  background-color: rgba(64, 158, 255, 0.1);
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-full;
  font-weight: 500;
}

.loading, .no-more {
  text-align: center;
  padding: $spacing-lg;
  color: $text-light;
  font-size: $font-sm;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $tabbar-height;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -8rpx 32rpx rgba(102, 126, 234, 0.08);
  border-top: 2rpx solid rgba(102, 126, 234, 0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xs $spacing-xl;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  font-size: 52rpx;
  margin-bottom: $spacing-xs;
  transition: all $transition-normal;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 6rpx;
    background: $primary-color;
    border-radius: $radius-full;
    transition: width $transition-normal;
  }
}

.tab-text {
  font-size: $font-xs;
  color: $text-light;
  transition: all $transition-normal;
}

.tab-item.active {
  .tab-icon {
    transform: scale(1.1);
    
    &::after {
      width: 40rpx;
    }
  }
  
  .tab-text {
    color: $primary-color;
    font-weight: 600;
  }
}
</style>
