<template>
  <view class="line-container">
    <view class="line-header">
      <view class="line-title-bar">
        <view class="line-dot"></view>
        <text class="line-title">校园二手交易</text>
        <view class="line-dot"></view>
      </view>
      
      <view class="line-banner-box">
        <view class="line-banner">
          <swiper class="line-swiper" indicator-dots autoplay circular interval="3500" indicator-color="#e0e0e0" indicator-active-color="#3f37c9">
            <swiper-item>
              <view class="line-banner-item">
                <view class="line-banner-content">
                  <text class="line-banner-text">发现好物</text>
                  <view class="line-banner-line"></view>
                  <text class="line-banner-sub">探索校园闲置</text>
                </view>
              </view>
            </swiper-item>
            <swiper-item>
              <view class="line-banner-item">
                <view class="line-banner-content">
                  <text class="line-banner-text">快速出手</text>
                  <view class="line-banner-line"></view>
                  <text class="line-banner-sub">发布你的闲置</text>
                </view>
              </view>
            </swiper-item>
            <swiper-item>
              <view class="line-banner-item">
                <view class="line-banner-content">
                  <text class="line-banner-text">环保交易</text>
                  <view class="line-banner-line"></view>
                  <text class="line-banner-sub">让价值延续</text>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </view>
    </view>

    <view class="line-search-wrapper" :class="{ 'fixed': isSticky }">
      <view class="line-search-box">
        <view class="line-category-picker" @click="toggleCategory">
          <text class="line-category-text">{{ selectedCategoryLabel }}</text>
          <view class="line-category-arrow">
            <LineIcon name="arrow-down" />
          </view>
        </view>
        <view class="line-search-icon">
          <LineIcon name="search" />
        </view>
        <input
          class="line-search-input"
          v-model="searchKeyword"
          placeholder="搜索商品..."
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <view class="line-category-popup" v-if="showCategoryPopup" @click="toggleCategory">
      <view class="line-category-container" @click.stop>
        <view class="line-category-item" :class="{ active: selectedCategory === '' }" @click="selectCategory('')">
          <text>全部</text>
        </view>
        <view class="line-category-item" v-for="cat in categories" :key="cat.value" :class="{ active: selectedCategory === cat.value }" @click="selectCategory(cat.value)">
          <text>{{ cat.label }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="line-main-scroll" scroll-y @scroll="onScroll" :scroll-top="scrollTop" @scrolltoupper="onPullDownRefresh" @scrolltolower="onReachBottom" :refresher-enabled="true" :refresher-triggered="isRefreshing">
      <view class="line-scroll-content">
        <view class="line-header-placeholder" v-if="isSticky"></view>
        
        <view class="line-goods-section">
          <view class="line-goods-list">
            <view class="line-goods-card" v-for="goods in goodsList" :key="goods.id">
              <view class="line-goods-image-box" @click="goToDetail(goods.id)">
                <image class="line-goods-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" lazy-load @load="onImageLoad(goods.id)" @error="handleImageError($event, goods.id)" :class="{ 'loaded': imageLoadedMap[goods.id] }" />
                <view class="line-goods-image-border"></view>
              </view>
              <view class="line-goods-info">
                <text class="line-goods-name" @click="goToDetail(goods.id)">{{ goods.name }}</text>
                <text class="line-goods-desc" @click="goToDetail(goods.id)">{{ goods.description }}</text>
                <view class="line-goods-bottom">
                  <text class="line-goods-price">¥{{ goods.price }}</text>
                  <view class="line-favorite-btn" @click="toggleFavorite(goods.id)">
                    <LineIcon name="heart" :active="isFavorite(goods.id)" />
                  </view>
                </view>
                <view class="line-goods-time">
                  <text>{{ formatTime(goods.createdAt) }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="line-load-more" v-if="loading">
            <view class="line-loading-dots">
              <view class="line-dot"></view>
              <view class="line-dot"></view>
              <view class="line-dot"></view>
            </view>
            <text class="line-load-text">加载中</text>
          </view>
          
          <view class="line-empty-state" v-else-if="goodsList.length === 0 && !loading">
            <view class="line-empty-icon">
              <LineIcon name="box" />
            </view>
            <text class="line-empty-text">暂无商品</text>
            <view class="line-empty-line"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="line-tab-bar">
      <view class="line-tab-item active" @click="goToHome()">
        <view class="line-tab-icon">
          <LineIcon name="home" :active="true" />
        </view>
        <view class="line-tab-indicator active"></view>
        <text class="line-tab-label">首页</text>
      </view>
      <view class="line-tab-item publish" @click="goToPublish()">
        <view class="line-publish-btn">
          <LineIcon name="plus" />
        </view>
        <text class="line-tab-label">发布</text>
      </view>
      <view class="line-tab-item" @click="goToProfile()">
        <view class="line-tab-icon">
          <LineIcon name="user" />
        </view>
        <view class="line-tab-indicator"></view>
        <text class="line-tab-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getGoods, type Goods } from '@/api/goods'
import { getFavorites, addFavorite, removeFavorite } from '@/api/favorite'
import { useUserStore } from '@/stores/user'
import { formatImageUrl } from '@/utils/request'
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()
const searchKeyword = ref('')
const goodsList = ref<Goods[]>([])
const favoriteIds = ref<string[]>([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const isRefreshing = ref(false)
const scrollTop = ref(0)
const isSticky = ref(false)
const showCategoryPopup = ref(false)
const selectedCategory = ref('')
const imageLoadedMap = ref<Record<string, boolean>>({})

let lastClickTime = 0

const categories = [
  { value: 'ELECTRONICS', label: '数码产品' },
  { value: 'CLOTHING', label: '服饰鞋包' },
  { value: 'BOOK', label: '图书教材' },
  { value: 'SPORTS', label: '运动户外' },
  { value: 'LIFE', label: '生活用品' },
  { value: 'OTHER', label: '其他' }
]

const selectedCategoryLabel = computed(() => {
  if (!selectedCategory.value) return '全部'
  const cat = categories.find(c => c.value === selectedCategory.value)
  return cat?.label || '全部'
})

const mockGoods: Goods[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro 256GB',
    description: '95成新，使用半年，无磕碰，电池健康度92%',
    price: 5999,
    originalPrice: 8999,
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EiPhone 14 Pro%3C/text%3E%3C/svg%3E'],
    category: 'ELECTRONICS',
    condition: 3,
    status: 1,
    userId: '1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: '高等数学教材（第七版）',
    description: '全新未拆封，考研必备教材',
    price: 35,
    originalPrice: 59,
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E高等数学%3C/text%3E%3C/svg%3E'],
    category: 'BOOKS',
    condition: 5,
    status: 1,
    userId: '2',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14'
  },
  {
    id: '3',
    name: 'Nike Air Force 1 运动鞋',
    description: '42码，穿过几次，几乎全新',
    price: 499,
    originalPrice: 799,
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENike AF1%3C/text%3E%3C/svg%3E'],
    category: 'CLOTHING',
    condition: 4,
    status: 1,
    userId: '3',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13'
  }
]

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0'
  return formatImageUrl(url)
}

function onImageLoad(goodsId: string) {
  imageLoadedMap.value[goodsId] = true
}

function handleImageError(e: any, goodsId: string) {
  const image = e.target
  image.src = formatImageUrl('')
  imageLoadedMap.value[goodsId] = true
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function isFavorite(goodsId: string) {
  return favoriteIds.value.includes(goodsId)
}

async function toggleFavorite(goodsId: string) {
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
    if (isFavorite(goodsId)) {
      await removeFavorite(goodsId)
      favoriteIds.value = favoriteIds.value.filter(id => id !== goodsId)
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      await addFavorite(goodsId)
      favoriteIds.value.push(goodsId)
      uni.showToast({ title: '已收藏', icon: 'none' })
    }
  } catch (err) {
    console.error('收藏操作失败', err)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

async function loadFavorites() {
  if (!userStore.token) return
  try {
    const result = await getFavorites()
    favoriteIds.value = (result || []).map(fav => fav.goodsId)
  } catch (err) {
    console.error('加载收藏列表失败', err)
  }
}

function goToHome() {
  const currentTime = Date.now()
  if (currentTime - lastClickTime < 300) {
    refreshPage()
  }
  lastClickTime = currentTime
}

function refreshPage() {
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  scrollTop.value = 0
  loadGoods()
  uni.showToast({ title: '已刷新', icon: 'none' })
}

function goToPublish() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '发布商品需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }
  uni.navigateTo({ url: '/pages/publish/index' })
}

function goToProfile() {
  uni.navigateTo({ url: '/pages/user/profile' })
}

function toggleCategory() {
  showCategoryPopup.value = !showCategoryPopup.value
}

function selectCategory(value: string) {
  selectedCategory.value = value
  showCategoryPopup.value = false
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  loadGoods()
}

function handleSearch() {
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  loadGoods()
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

function onScroll(e: any) {
  const scrollY = e.detail.scrollTop
  isSticky.value = scrollY >= 300
}

function onPullDownRefresh() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  loadGoods().then(() => {
    isRefreshing.value = false
    uni.showToast({ title: '刷新成功', icon: 'none' })
  }).catch(() => {
    isRefreshing.value = false
  })
}

function onReachBottom() {
  if (loading.value || !hasMore.value || isRefreshing.value) return
  loadGoods()
}

function loadGoods(): Promise<void> {
  return new Promise((resolve) => {
    if (loading.value || !hasMore.value) {
      resolve()
      return
    }

    loading.value = true
    const params: Record<string, any> = { page: page.value, limit: 6 }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (selectedCategory.value) params.category = selectedCategory.value

    getGoods(params).then((result) => {
      if (result.list && result.list.length > 0) {
        goodsList.value = [...goodsList.value, ...result.list]
        page.value++
        if (result.list.length < 6) {
          hasMore.value = false
        }
      } else {
        hasMore.value = false
      }
      loading.value = false
      resolve()
    }).catch((err) => {
      console.error('加载商品失败，使用mock数据', err)
      if (goodsList.value.length === 0) {
        let filtered = mockGoods
        if (selectedCategory.value) {
          filtered = filtered.filter(g => g.category === selectedCategory.value)
        }
        if (searchKeyword.value) {
          const keyword = searchKeyword.value.toLowerCase()
          filtered = filtered.filter(g =>
            g.name.toLowerCase().includes(keyword) ||
            g.description.toLowerCase().includes(keyword)
          )
        }
        goodsList.value = filtered
      }
      hasMore.value = false
      loading.value = false
      resolve()
    })
  })
}

onMounted(() => {
  userStore.initFromStorage()
  loadGoods()
  loadFavorites()
})

onShow(() => {
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  loadGoods()
  loadFavorites()
})
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-container {
  min-height: 100vh;
  background-color: $line-bg;
  padding-bottom: 160rpx;
}

.line-header {
  padding: 40rpx 32rpx 24rpx;
}

.line-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.line-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $line-accent 0%, $line-accent-light 100%);
}

.line-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 6rpx;
}

.line-banner-box {
  margin-top: 24rpx;
}

.line-banner {
  border-radius: $line-radius-lg;
  overflow: hidden;
  background: linear-gradient(135deg, $line-accent 0%, $line-accent-light 100%);
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.25);
}

.line-swiper {
  height: 240rpx;
}

.line-banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-banner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
}

.line-banner-text {
  font-size: $line-font-xl;
  font-weight: 600;
  color: white;
  letter-spacing: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.line-banner-line {
  width: 80rpx;
  height: 3rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2rpx;
}

.line-banner-sub {
  font-size: $line-font-sm;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 4rpx;
}

.line-search-wrapper {
  padding: 16rpx 32rpx;
  background-color: $line-bg;
  z-index: 100;
}

.line-search-wrapper.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16rpx 32rpx;
  padding-top: calc(16rpx + env(safe-area-inset-top));
  background-color: white;
  border-bottom: 2rpx solid $line-border;
}

.line-search-box {
  display: flex;
  align-items: center;
  background-color: $line-bg-card;
  border: 2rpx solid $line-border-light;
  border-radius: $line-radius-lg;
  padding: 16rpx 20rpx;
  position: relative;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.line-category-picker {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  margin-right: 12rpx;
  border-right: 2rpx solid $line-border-light;
  transition: all 0.2s ease;
  
  &:active {
    opacity: 0.7;
  }
}

.line-category-text {
  font-size: $line-font-sm;
  color: $line-secondary;
  font-weight: 500;
}

.line-category-arrow {
  width: 28rpx;
  height: 28rpx;
  margin-left: 8rpx;
  color: $line-light;
}

.line-search-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 12rpx;
  color: $line-light;
}

.line-search-input {
  flex: 1;
  height: 56rpx;
  font-size: $line-font-md;
  color: $line-primary;
}

.line-category-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 220rpx;
}

.line-category-container {
  background-color: white;
  border: 2rpx solid $line-border;
  border-radius: $line-radius-lg;
  padding: 16rpx;
  width: 85%;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.12);
}

.line-category-item {
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid transparent;
  border-radius: $line-radius;
  margin-bottom: 8rpx;
  font-size: $line-font-md;
  color: $line-secondary;
  transition: all 0.2s ease;
  font-weight: 500;

  &.active {
    border-color: $line-accent;
    color: $line-accent;
    font-weight: 600;
  }

  &:active {
    transform: scale(0.98);
  }
}

.line-main-scroll {
  height: calc(100vh - 160rpx);
}

.line-scroll-content {
  padding-bottom: 32rpx;
}

.line-header-placeholder {
  height: 380rpx;
}

.line-goods-section {
  padding: 16rpx 32rpx;
}

.line-goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.line-goods-card {
  background-color: $line-bg-card;
  border: 2rpx solid $line-border-light;
  border-radius: $line-radius-lg;
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, $line-accent 0%, $line-accent-light 100%);
    border-radius: $line-radius-lg $line-radius-lg 0 0;
  }

  &:active {
    transform: translateY(-4rpx) scale(0.98);
    box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.18);
  }
}

.line-goods-image-box {
  width: 100%;
  height: 280rpx;
  overflow: hidden;
  position: relative;
  background: white;
}

.line-goods-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.line-goods-image.loaded {
  opacity: 1;
}

.line-goods-image-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: 3rpx solid $line-primary;
  pointer-events: none;
}

.line-goods-info {
  padding: 20rpx 20rpx 16rpx;
}

.line-goods-name {
  font-size: $line-font-md;
  font-weight: 600;
  color: $line-primary;
  @include line-clamp(1);
  line-height: 1.3;
}

.line-goods-desc {
  font-size: $line-font-xs;
  color: $line-light;
  margin-top: 8rpx;
  @include line-clamp(2);
  line-height: 1.4;
}

.line-goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.line-goods-price {
  font-size: 36rpx;
  font-weight: 700;
  color: $line-accent;
  letter-spacing: 1rpx;
}

.line-favorite-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.9);
  }
}

.line-goods-time {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 2rpx dashed $line-border;
}

.line-goods-time text {
  font-size: $line-font-xs;
  color: $line-light;
}

.line-load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  gap: 16rpx;
}

.line-loading-dots {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.line-loading-dots .line-dot {
  width: 10rpx;
  height: 10rpx;
  border-color: $line-accent;
  animation: dotBounce 1.2s ease infinite;
}

.line-loading-dots .line-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.line-loading-dots .line-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

.line-load-text {
  font-size: $line-font-sm;
  color: $line-light;
  letter-spacing: 2rpx;
}

.line-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  gap: 20rpx;
}

.line-empty-icon {
  width: 100rpx;
  height: 100rpx;
  border: 3rpx dashed $line-border;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-empty-text {
  font-size: $line-font-md;
  color: $line-light;
  letter-spacing: 4rpx;
}

.line-empty-line {
  width: 80rpx;
  height: 3rpx;
  background: $line-border;
}

.line-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  border-top: 3rpx solid $line-primary;
}

.line-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
  position: relative;
}

.line-tab-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-tab-indicator {
  width: 0;
  height: 3rpx;
  background: $line-accent;
  margin-top: 4rpx;
  transition: width 0.2s ease;
}

.line-tab-indicator.active {
  width: 40rpx;
}

.line-tab-label {
  font-size: $line-font-xs;
  color: $line-light;
  margin-top: 6rpx;
  letter-spacing: 1rpx;
  font-weight: 500;
}

.line-tab-item.active .line-tab-label {
  color: $line-accent;
  font-weight: 600;
}

.line-tab-item.publish {
  flex: 1.2;
}

.line-publish-btn {
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid $line-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -60rpx;
  background: white;
  position: relative;
  transition: all 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    right: 6rpx;
    bottom: 6rpx;
    border: 2rpx dashed $line-border;
    border-radius: 50%;
  }

  &:active {
    transform: scale(0.95);
    border-color: $line-accent;
  }
}

.line-tab-item.publish .line-tab-label {
  margin-top: 10rpx;
}
</style>
