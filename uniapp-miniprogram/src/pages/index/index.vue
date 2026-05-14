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
                  @error="handleImageError($event)"
                />
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
      <view class="tab-item" @click="goToPublish()">
        <text class="tab-icon">📤</text>
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

function handleImageError(e: any) {
  const image = e.target
  image.src = 'https://via.placeholder.com/400x300/667EEA/FFFFFF?text=No+Image'
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
  uni.reLaunch({ url: '/pages/index/index' })
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
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header-area {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 30rpx;
}

.title-section {
  padding: 20rpx 0;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.banner-section {
  margin-top: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-swiper {
  height: 200rpx;
}

.banner-item {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30rpx;
}

.banner-2 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.banner-3 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.banner-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.banner-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10rpx;
}

.search-wrapper {
  padding: 20rpx 30rpx;
  background-color: #f5f5f5;
  z-index: 100;
  transition: all 0.3s;
}

.search-wrapper.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 50rpx;
  padding: 15rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.category-dropdown {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  margin-right: 15rpx;
  background-color: #f5f5f5;
  border-radius: 25rpx;
  border-right: 1rpx solid #eee;
}

.category-text {
  font-size: 26rpx;
  color: #666;
}

.category-arrow {
  font-size: 20rpx;
  color: #999;
  margin-left: 8rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.search-input {
  flex: 1;
  height: 50rpx;
  font-size: 28rpx;
}

.search-btn {
  padding: 10rpx 25rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25rpx;
  margin-left: 15rpx;
}

.search-btn text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 500;
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
  padding-top: 200rpx;
}

.category-list {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  width: 80%;
  max-height: 60vh;
  overflow-y: auto;
}

.category-item {
  padding: 30rpx;
  text-align: center;
  border-radius: 15rpx;
  margin-bottom: 10rpx;
  font-size: 30rpx;
  color: #333;
  background-color: #f8f8f8;
  &.active {
    background-color: #667eea;
    color: #fff;
  }
}

.main-scroll {
  height: 100vh;
}

.scroll-content {
  padding-bottom: 20rpx;
}

.header-placeholder {
  height: 300rpx;
}

.goods-section {
  padding: 20rpx 30rpx;
}

.goods-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.goods-card {
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.goods-image-wrapper {
  width: 100%;
  height: 300rpx;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.goods-info {
  padding: 20rpx;
}

.goods-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.goods-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15rpx;
}

.goods-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #f5576c;
}

.goods-original-price {
  font-size: 22rpx;
  color: #ccc;
  text-decoration: line-through;
  margin-left: 10rpx;
  flex: 1;
}

.favorite-btn {
  padding: 5rpx;
}

.favorite-icon {
  font-size: 36rpx;
}

.goods-time {
  font-size: 22rpx;
  color: #ccc;
  margin-top: 10rpx;
}

.load-more {
  text-align: center;
  padding: 30rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 30rpx;
}

.no-more-text {
  font-size: 26rpx;
  color: #ccc;
}

.empty-state {
  text-align: center;
  padding: 100rpx 30rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  padding: 15rpx 0;
  padding-bottom: calc(15rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(15rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-icon {
  font-size: 40rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.tab-item.active .tab-text {
  color: #667eea;
  font-weight: 500;
}
</style>
