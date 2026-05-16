<template>
  <view class="container">
    <view class="header-area">
      <view class="title-section">
        <text class="title">重庆电子科技职业大学校园交易软件</text>
      </view>

      <view class="banner-section">
        <swiper class="banner-swiper" indicator-dots autoplay circular interval="3000">
          <swiper-item>
            <view class="banner-item">
              <text class="banner-text">🎒 新学期特惠</text>
              <text class="banner-sub">精选二手好物</text>
            </view>
          </swiper-item>
          <swiper-item>
            <view class="banner-item banner-2">
              <text class="banner-text">📚 教材低价转卖</text>
              <text class="banner-sub">开学必备</text>
            </view>
          </swiper-item>
          <swiper-item>
            <view class="banner-item banner-3">
              <text class="banner-text">🎮 数码好物</text>
              <text class="banner-sub">品质保证</text>
            </view>
          </swiper-item>
        </swiper>
      </view>
    </view>

    <view class="search-wrapper" :class="{ 'fixed': isSticky }">
      <view class="search-bar">
        <view class="category-dropdown" @click="toggleCategory">
          <text class="category-text">{{ selectedCategoryLabel }}</text>
          <text class="category-arrow">▼</text>
        </view>
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">
          <text>搜索</text>
        </view>
      </view>
    </view>

    <view class="category-popup" v-if="showCategoryPopup" @click="toggleCategory">
      <view class="category-list" @click.stop>
        <view
          class="category-item"
          :class="{ active: selectedCategory === '' }"
          @click="selectCategory('')"
        >
          <text>全部</text>
        </view>
        <view
          class="category-item"
          v-for="cat in categories"
          :key="cat.value"
          :class="{ active: selectedCategory === cat.value }"
          @click="selectCategory(cat.value)"
        >
          <text>{{ cat.label }}</text>
        </view>
      </view>
    </view>

    <scroll-view
      class="main-scroll"
      scroll-y
      @scroll="onScroll"
      :scroll-top="scrollTop"
    >
      <view class="scroll-content">
        <view class="header-placeholder" v-if="isSticky"></view>

        <view class="goods-section">
          <view class="goods-list">
            <view
              class="goods-card"
              v-for="goods in goodsList"
              :key="goods.id"
            >
              <view class="goods-image-wrapper" @click="goToDetail(goods.id)">
                <image
                  class="goods-image"
                  :src="getImageUrl(goods.images?.[0])"
                  mode="aspectFill"
                  @load="onImageLoad(goods.id)"
                  @error="handleImageError($event, goods.id)"
                  :class="{ 'image-loaded': imageLoadedMap[goods.id] }"
                />
                <view class="image-placeholder" v-if="!imageLoadedMap[goods.id]">
                  <text class="placeholder-text">加载中...</text>
                </view>
              </view>
              <view class="goods-info">
                <text class="goods-name" @click="goToDetail(goods.id)">{{ goods.name }}</text>
                <text class="goods-desc" @click="goToDetail(goods.id)">{{ goods.description }}</text>
                <view class="goods-price-row">
                  <text class="goods-price">¥{{ goods.price }}</text>
                  <text v-if="goods.originalPrice" class="goods-original-price">¥{{ goods.originalPrice }}</text>
                  <view class="favorite-btn" @click="toggleFavorite(goods.id)">
                    <text class="favorite-icon">{{ isFavorite(goods.id) ? '❤️' : '🤍' }}</text>
                  </view>
                </view>
                <text class="goods-time">{{ formatTime(goods.createdAt) }}</text>
              </view>
            </view>
          </view>

          <view class="load-more" v-if="loading">
            <text class="loading-text">加载中...</text>
          </view>
          <view class="no-more" v-else-if="!hasMore && goodsList.length > 0">
            <text class="no-more-text">暂无更多物品</text>
          </view>
          <view class="empty-state" v-else-if="goodsList.length === 0 && !loading">
            <text class="empty-icon">📦</text>
            <text class="empty-text">暂无商品</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="tab-bar">
      <view class="tab-item active" @click="goToHome()">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item publish-item" @click="goToPublish()">
        <view class="publish-btn">
          <view class="publish-icon-cross">
            <view class="cross-line cross-h"></view>
            <view class="cross-line cross-v"></view>
          </view>
        </view>
        <text class="tab-text">发布</text>
      </view>
      <view class="tab-item" @click="goToProfile()">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getGoods, type Goods } from '@/api/goods'
import { getFavorites, addFavorite, removeFavorite } from '@/api/favorite'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const searchKeyword = ref('')
const goodsList = ref<Goods[]>([])
const favoriteIds = ref<string[]>([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const scrollTop = ref(0)
const isSticky = ref(false)
const showCategoryPopup = ref(false)
const selectedCategory = ref('')
const imageLoadedMap = ref<Record<string, boolean>>({})

let lastClickTime = 0

const categories = [
  { value: 'ELECTRONICS', label: '数码产品' },
  { value: 'CLOTHING', label: '服饰鞋包' },
  { value: 'BOOKS', label: '图书教材' },
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
    images: ['https://via.placeholder.com/400x300/667EEA/FFFFFF?text=iPhone+14+Pro'],
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
    images: ['https://via.placeholder.com/400x300/42E695/FFFFFF?text=高等数学'],
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
    images: ['https://via.placeholder.com/400x300/F093FB/FFFFFF?text=Nike+AF1'],
    category: 'CLOTHING',
    condition: 4,
    status: 1,
    userId: '3',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13'
  },
  {
    id: '4',
    name: '羽毛球拍套装',
    description: '含球拍、球、护腕，九成新',
    price: 120,
    originalPrice: 260,
    images: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=羽毛球拍'],
    category: 'SPORTS',
    condition: 3,
    status: 1,
    userId: '4',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  },
  {
    id: '5',
    name: '小米台灯Pro',
    description: '护眼台灯，可调节亮度色温',
    price: 89,
    originalPrice: 169,
    images: ['https://via.placeholder.com/400x300/FFD26F/FFFFFF?text=小米台灯'],
    category: 'LIFE',
    condition: 4,
    status: 1,
    userId: '5',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11'
  }
]

function getImageUrl(url?: string) {
  if (!url || url === '[]') return 'https://via.placeholder.com/400x300/667EEA/FFFFFF?text=No+Image'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `http://localhost:3000${url}`
  return url
}

function onImageLoad(goodsId: string) {
  imageLoadedMap.value[goodsId] = true
}

function handleImageError(e: any, goodsId: string) {
  const image = e.target
  image.src = 'https://via.placeholder.com/400x300/667EEA/FFFFFF?text=No+Image'
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

function loadGoods() {
  if (loading.value || !hasMore.value) return

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
  })
}

onMounted(() => {
  userStore.initFromStorage()
  loadGoods()
  loadFavorites()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: $tabbar-height;
}

.header-area {
  @include gradient-primary;
  padding: 80rpx $spacing-lg $spacing-lg;
  border-radius: 0 0 $radius-xl $radius-xl;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 60%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -20%;
    width: 40%;
    height: 80%;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.title-section {
  padding: $spacing-md 0;
  position: relative;
  z-index: 1;
}

.title {
  font-size: $font-xl;
  font-weight: 700;
  color: #fff;
  text-align: center;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 4rpx;
}

.banner-section {
  margin-top: $spacing-md;
  border-radius: $radius-lg;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.3);
}

.banner-swiper {
  height: 240rpx;
}

.banner-item {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $secondary-color 0%, $accent-color 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 $spacing-xl;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -20%;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    animation: float 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    right: 10%;
    width: 150rpx;
    height: 150rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 4s ease-in-out infinite 1s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.banner-2 {
  background: linear-gradient(135deg, $info-color 0%, #00f2fe 100%);
}

.banner-3 {
  background: linear-gradient(135deg, $success-color 0%, #38f9d7 100%);
}

.banner-text {
  font-size: $font-title;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.banner-sub {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.9);
  margin-top: $spacing-sm;
  letter-spacing: 2rpx;
}

.search-wrapper {
  padding: $spacing-md $spacing-lg;
  background-color: $bg-color;
  z-index: 100;
  transition: all $transition-normal;
}

.search-wrapper.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-lg;
  background-color: $bg-white;
  box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.08);
  padding-top: calc($spacing-md + env(safe-area-inset-top));
  padding-top: calc($spacing-md + constant(safe-area-inset-top));
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: $bg-white;
  border-radius: $radius-full;
  padding: $spacing-sm $spacing-lg;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.12);
  border: 2rpx solid rgba(102, 126, 234, 0.08);
  transition: all $transition-normal;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.18);
    border-color: rgba(102, 126, 234, 0.2);
  }
}

.category-dropdown {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  margin-right: $spacing-md;
  @include gradient-bg;
  border-radius: $radius-lg;
  border-right: 2rpx solid rgba(102, 126, 234, 0.12);
  transition: all $transition-fast;
  
  &:active {
    @include gradient-primary;
    border-color: transparent;
    
    .category-text, .category-arrow {
      color: #fff;
    }
  }
}

.category-text {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: 500;
}

.category-arrow {
  font-size: $font-xs;
  color: $text-light;
  margin-left: $spacing-xs;
  transition: all $transition-fast;
  transform: rotate(0deg);
}

.category-dropdown:active .category-arrow {
  transform: rotate(180deg);
}

.search-icon {
  font-size: $font-lg;
  margin-right: $spacing-sm;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: $font-md;
  color: $text-primary;
}

.search-btn {
  padding: $spacing-sm $spacing-lg;
  @include gradient-primary;
  border-radius: $radius-lg;
  margin-left: $spacing-md;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.35);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.92);
    box-shadow: 0 3rpx 10rpx rgba(102, 126, 234, 0.45);
  }
}

.search-btn text {
  color: #fff;
  font-size: $font-sm;
  font-weight: 600;
}

.category-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 220rpx;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.category-list {
  background-color: $bg-white;
  border-radius: $radius-xl;
  padding: $spacing-sm;
  width: 85%;
  max-height: 65vh;
  overflow-y: auto;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-item {
  padding: $spacing-lg;
  text-align: center;
  border-radius: $radius-md;
  margin-bottom: $spacing-xs;
  font-size: $font-md;
  color: $text-primary;
  background-color: $bg-color;
  transition: all $transition-fast;
  
  &.active {
    @include gradient-primary;
    color: #fff;
    box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.main-scroll {
  height: calc(100vh - $tabbar-height);
}

.scroll-content {
  padding-bottom: $spacing-lg;
}

.header-placeholder {
  height: 360rpx;
}

.goods-section {
  padding: $spacing-md $spacing-lg;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.goods-card {
  background-color: $bg-white;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.08);
  transition: all $transition-slow;
  border: none;
  
  &:active {
    transform: translateY(-6rpx) scale(1.01);
    box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.15);
  }
}

.goods-image-wrapper {
  width: 100%;
  height: 300rpx;
  overflow: hidden;
  @include gradient-bg;
  position: relative;
}

.goods-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity $transition-normal;
  transform: scale(1.05);
}

.goods-image.image-loaded {
  opacity: 1;
  transform: scale(1);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @include flex-center;
  @include gradient-bg;
}

.placeholder-text {
  font-size: $font-sm;
  color: $text-light;
}

.goods-info {
  padding: 20rpx 20rpx 16rpx;
}

.goods-name {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  @include text-clamp(1);
  line-height: 1.4;
}

.goods-desc {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 8rpx;
  @include text-ellipsis;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.goods-price {
  font-size: 40rpx;
  font-weight: 700;
  color: $accent-color;
  letter-spacing: 0.5rpx;
}

.goods-original-price {
  font-size: $font-xs;
  color: $text-placeholder;
  text-decoration: line-through;
  margin-left: $spacing-xs;
  flex: 1;
}

.favorite-btn {
  padding: 4rpx;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.88);
  }
}

.favorite-icon {
  font-size: 48rpx;
}

.goods-time {
  font-size: $font-xs;
  color: $text-placeholder;
  margin-top: 12rpx;
}

.load-more {
  text-align: center;
  padding: $spacing-lg;
}

.loading-text {
  font-size: $font-sm;
  color: $text-light;
}

.no-more {
  text-align: center;
  padding: $spacing-lg;
}

.no-more-text {
  font-size: $font-sm;
  color: $text-placeholder;
}

.empty-state {
  text-align: center;
  padding: 120rpx $spacing-lg;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-md;
  opacity: 0.5;
}

.empty-text {
  font-size: $font-md;
  color: $text-light;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  padding: $spacing-sm 0;
  padding-bottom: calc($spacing-sm + constant(safe-area-inset-bottom));
  padding-bottom: calc($spacing-sm + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 40rpx rgba(102, 126, 234, 0.08);
  border-top: 2rpx solid rgba(102, 126, 234, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xs 0;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  font-size: 52rpx;
  transition: all $transition-normal;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
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
  margin-top: $spacing-xs;
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

.publish-item {
  position: relative;
  flex: 1.2;
}

.publish-btn {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, $accent-color 0%, #ee5a5a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -50rpx;
  box-shadow: 0 16rpx 48rpx rgba(245, 87, 108, 0.5);
  border: 6rpx solid $bg-white;
  transition: all $transition-slow;
  
  &:active {
    transform: scale(0.88);
    box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.6);
  }
}

.publish-icon-cross {
  position: relative;
  width: 52rpx;
  height: 52rpx;
}

.cross-line {
  position: absolute;
  background-color: #fff;
  border-radius: 4rpx;
  transition: all $transition-fast;
}

.cross-h {
  width: 100%;
  height: 8rpx;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.cross-v {
  width: 8rpx;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

.publish-btn:active {
  .cross-line {
    background-color: rgba(255, 255, 255, 0.9);
  }
}

.publish-item .tab-text {
  margin-top: $spacing-sm;
}
</style>
