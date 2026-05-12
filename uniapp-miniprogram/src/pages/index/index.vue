<template>
  <view class="container">
    <view class="header">
      <text class="title">重庆电子科技职业大学校园交易平台</text>
      <view class="search-bar">
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

    <scroll-view class="main-scroll" scroll-y>
      <view class="banner">
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

      <view class="category-section">
        <text class="section-title">分类浏览</text>
        <view class="category-grid">
          <view 
            class="category-item" 
            v-for="cat in categories" 
            :key="cat.name"
            @click="goToCategory(cat.name)"
          >
            <text class="category-icon">{{ cat.icon }}</text>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <view class="hot-section">
        <view class="section-header">
          <text class="section-title">热门商品</text>
          <text class="section-more" @click="goToGoods()">更多 ›</text>
        </view>
        <scroll-view class="hot-scroll" scroll-x>
          <view class="hot-list">
            <view 
              class="hot-item" 
              v-for="goods in hotGoods" 
              :key="goods.id"
              @click="goToDetail(goods.id)"
            >
              <image class="hot-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" />
              <view class="hot-info">
                <text class="hot-name">{{ goods.name }}</text>
                <text class="hot-price">¥{{ goods.price }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="features">
        <view class="feature-item" @click="goToGoods()">
          <text class="feature-icon">📦</text>
          <text class="feature-text">浏览商品</text>
        </view>
        <view class="feature-item" @click="goToPublish()">
          <text class="feature-icon">📤</text>
          <text class="feature-text">发布商品</text>
        </view>
        <view class="feature-item" @click="goToProfile()">
          <text class="feature-icon">👤</text>
          <text class="feature-text">个人中心</text>
        </view>
        <view class="feature-item" @click="goToFavorites()">
          <text class="feature-icon">❤️</text>
          <text class="feature-text">我的收藏</text>
        </view>
      </view>

      <view class="data-info">
        <text class="info-title">数据互联效果</text>
        <view class="info-item">
          <text class="info-label">Web端地址:</text>
          <text class="info-value">http://localhost:5173</text>
        </view>
        <view class="info-item">
          <text class="info-label">后端API:</text>
          <text class="info-value">http://localhost:3000/api</text>
        </view>
        <view class="info-item">
          <text class="info-label">数据存储:</text>
          <text class="info-value">MySQL数据库</text>
        </view>
      </view>
    </scroll-view>

    <view class="tab-bar">
      <view class="tab-item active" @click="goToHome()">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item" @click="goToGoods()">
        <text class="tab-icon">📦</text>
        <text class="tab-text">商品</text>
      </view>
      <view class="tab-item" @click="goToProfile()">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getGoods, type Goods } from '@/api/goods'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const searchKeyword = ref('')

const categories = [
  { name: '数码产品', icon: '📱' },
  { name: '服饰鞋包', icon: '👔' },
  { name: '图书教材', icon: '📚' },
  { name: '运动户外', icon: '⚽' },
  { name: '生活用品', icon: '🏠' },
  { name: '其他', icon: '🎯' }
]

const hotGoods = ref<Goods[]>([])

const mockGoods: Goods[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro 256GB',
    description: '95成新，使用半年，无磕碰',
    price: 5999,
    originalPrice: 8999,
    images: [],
    category: '数码产品',
    condition: 3,
    status: 1,
    userId: '1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: '高等数学教材（第七版）',
    description: '全新未拆封，考研必备',
    price: 35,
    originalPrice: 59,
    images: [],
    category: '图书教材',
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
    images: [],
    category: '服饰鞋包',
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
    images: [],
    category: '运动户外',
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
    images: [],
    category: '生活用品',
    condition: 4,
    status: 1,
    userId: '5',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11'
  },
  {
    id: '6',
    name: '机械键盘青轴',
    description: 'RGB背光，手感极佳',
    price: 159,
    originalPrice: 299,
    images: [],
    category: '数码产品',
    condition: 3,
    status: 1,
    userId: '6',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
]

function getImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

function goToHome() {
  uni.navigateTo({ url: '/pages/index/index' })
}

function goToGoods() {
  uni.navigateTo({ url: '/pages/goods/list' })
}

function goToSearch() {
  uni.navigateTo({ url: '/pages/goods/list' })
}

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/goods/list?keyword=${encodeURIComponent(searchKeyword.value)}` })
}

function goToCategory(category: string) {
  uni.navigateTo({ url: `/pages/goods/list?category=${category}` })
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

function goToFavorites() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/favorite/index' })
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

function loadHotGoods() {
  hotGoods.value = mockGoods
  getGoods({ page: 1, limit: 6 }).then((result) => {
    if (result.list && result.list.length > 0) {
      hotGoods.value = result.list
    }
  }).catch((err) => {
    console.error('后台API加载失败，使用mock数据', err)
  })
}

onMounted(() => {
  userStore.initFromStorage()
  loadHotGoods()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 40rpx 40rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 30rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 80rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.search-btn {
  padding: 15rpx 30rpx;
  background-color: #667eea;
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  margin-left: 20rpx;
}

.main-scroll {
  flex: 1;
}

.banner {
  padding: 20rpx;
}

.banner-swiper {
  height: 280rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &.banner-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  &.banner-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
}

.banner-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 15rpx;
}

.banner-sub {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.category-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.category-item {
  width: calc(33.33% - 10rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.category-icon {
  font-size: 56rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 26rpx;
  color: #333;
}

.hot-section {
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-more {
  font-size: 26rpx;
  color: #667eea;
}

.hot-scroll {
  white-space: nowrap;
}

.hot-list {
  display: inline-flex;
  gap: 20rpx;
}

.hot-item {
  width: 240rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: inline-block;
  vertical-align: top;
}

.hot-image {
  width: 100%;
  height: 200rpx;
}

.hot-info {
  padding: 15rpx;
}

.hot-name {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #e74c3c;
}

.features {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  margin: 0 20rpx 20rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.feature-icon {
  font-size: 60rpx;
  margin-bottom: 15rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

.data-info {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 20rpx;
}

.info-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
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
  font-family: monospace;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 40rpx;
}

.tab-icon {
  font-size: 48rpx;
  margin-bottom: 5rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #999;
}

.tab-item.active {
  .tab-icon {
    transform: scale(1.1);
  }
  .tab-text {
    color: #667eea;
    font-weight: bold;
  }
}
</style>