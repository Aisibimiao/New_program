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
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background-color: #fff;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
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
  padding: 10rpx 25rpx;
  background-color: #667eea;
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  margin-left: 20rpx;
}

.filter-bar {
  background-color: #fff;
  padding: 15rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: inline-flex;
  padding: 0 20rpx;
  gap: 20rpx;
}

.filter-item {
  padding: 15rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  &.active {
    background-color: #667eea;
    color: #fff;
  }
}

.active-filter {
  display: flex;
  gap: 15rpx;
  padding: 15rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-tag {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #fff3cd;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #856404;
}

.tag-close {
  margin-left: 10rpx;
  font-size: 32rpx;
  color: #dc3545;
}

.goods-scroll {
  height: calc(100vh - 200rpx);
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  box-sizing: border-box;
}

.goods-item {
  width: 48%;
  margin-right: 4%;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  &:nth-child(2n) {
    margin-right: 0;
  }
}

.goods-image {
  width: 100%;
  height: 280rpx;
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

.goods-condition {
  font-size: 22rpx;
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
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
