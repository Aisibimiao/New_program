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
              @click="goToDetail(goods.id)"
            >
              <image class="goods-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" />
              <view class="goods-info">
                <text class="goods-name">{{ goods.name }}</text>
                <text class="goods-desc">{{ goods.description }}</text>
                <view class="goods-price-row">
                  <text class="goods-price">¥{{ goods.price }}</text>
                  <text v-if="goods.originalPrice" class="goods-original-price">¥{{ goods.originalPrice }}</text>
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
import { ref, onMounted } from 'vue'
import { getGoods, type Goods } from '@/api/goods'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const searchKeyword = ref('')
const goodsList = ref<Goods[]>([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const scrollTop = ref(0)
const isSticky = ref(false)

const mockGoods: Goods[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro 256GB',
    description: '95成新，使用半年，无磕碰，电池健康度92%',
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
    description: '全新未拆封，考研必备教材',
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
  },
  {
    id: '7',
    name: 'iPad Air 5 256GB',
    description: '几乎全新，带原装笔',
    price: 3599,
    originalPrice: 5499,
    images: [],
    category: '数码产品',
    condition: 5,
    status: 1,
    userId: '7',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09'
  },
  {
    id: '8',
    name: '四六级真题试卷',
    description: '含答案解析，适合备考',
    price: 20,
    originalPrice: 35,
    images: [],
    category: '图书教材',
    condition: 4,
    status: 1,
    userId: '8',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  }
]

function getImageUrl(url?: string) {
  if (!url || url === '[]') return 'https://via.placeholder.com/400x300/f5f5f5/999999?text=No+Image'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `http://localhost:3000${url}`
  return url
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

function goToHome() {
  uni.navigateTo({ url: '/pages/index/index' })
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

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/goods/list?keyword=${encodeURIComponent(searchKeyword.value)}` })
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
  getGoods({ page: page.value, limit: 6 }).then((result) => {
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
      goodsList.value = mockGoods
    }
    hasMore.value = false
    loading.value = false
  })
}

onMounted(() => {
  userStore.initFromStorage()
  loadGoods()
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
  line-height: 1.4;
}

.banner-section {
  margin-top: 10rpx;
}

.banner-swiper {
  height: 280rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%);
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

.search-wrapper {
  padding: 20rpx 30rpx;
  background-color: #f5f5f5;
  position: relative;
  z-index: 50;
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 76rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  margin-left: 20rpx;
}

.main-scroll {
  height: calc(100vh - 520rpx);
}

.scroll-content {
  padding-bottom: 20rpx;
}

.header-placeholder {
  height: 100rpx;
}

.goods-section {
  padding: 0 20rpx;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.goods-card {
  width: calc(50% - 10rpx);
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.goods-image {
  width: 100%;
  height: 240rpx;
  background-color: #f8f8f8;
}

.goods-info {
  padding: 20rpx;
}

.goods-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 15rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.goods-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.goods-original-price {
  font-size: 24rpx;
  color: #ccc;
  text-decoration: line-through;
}

.goods-time {
  font-size: 22rpx;
  color: #999;
}

.load-more, .no-more {
  padding: 30rpx;
  text-align: center;
}

.loading-text, .no-more-text {
  font-size: 28rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
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
  z-index: 1000;
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