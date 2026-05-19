<template>
  <view class="line-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="switchToHome()">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">商品列表</text>
      <view class="line-header-right"></view>
    </view>

    <view class="line-search-bar">
      <view class="line-search-input-wrap">
        <LineIcon name="search" />
        <input
          class="line-search-input"
          v-model="keyword"
          placeholder="搜索商品"
          placeholder-class="line-placeholder"
          confirm-type="search"
          @confirm="search"
        />
        <view class="line-search-btn" @click="search">
          <text class="line-search-btn-text">搜索</text>
        </view>
      </view>
    </view>

    <view class="line-filter-bar">
      <scroll-view class="line-filter-scroll" scroll-x>
        <view class="line-filter-list">
          <view
            class="line-filter-item"
            :class="{ active: !category }"
            @click="setCategory('')"
          >
            <text>全部</text>
          </view>
          <view
            class="line-filter-item"
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

    <view class="line-active-filter" v-if="keyword || category">
      <view class="line-filter-tag" v-if="keyword">
        <text>搜索: {{ keyword }}</text>
        <view class="line-tag-close" @click="clearKeyword">
          <LineIcon name="close" />
        </view>
      </view>
      <view class="line-filter-tag" v-if="category">
        <text>分类: {{ category }}</text>
        <view class="line-tag-close" @click="clearCategory">
          <LineIcon name="close" />
        </view>
      </view>
    </view>

    <scroll-view
      class="line-goods-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view class="line-goods-grid">
        <view
          class="line-goods-card"
          v-for="goods in goodsList"
          :key="goods.id"
          @click="goToDetail(goods.id)"
        >
          <view class="line-goods-image-box">
            <image class="line-goods-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" lazy-load @error="handleImageError($event)" />
            <view class="line-goods-image-border"></view>
          </view>
          <view class="line-goods-info">
            <text class="line-goods-name">{{ goods.name }}</text>
            <text class="line-goods-desc">{{ goods.description }}</text>
            <view class="line-goods-bottom">
              <text class="line-goods-price">¥{{ goods.price }}</text>
              <text class="line-goods-condition">{{ getConditionText(goods.condition) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="loading" class="line-loading">
        <text>加载中...</text>
      </view>

      <view v-if="!loading && !hasMore" class="line-no-more">
        <text>没有更多了</text>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <TabBar ref="tabBarRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGoods, type Goods } from '@/api/goods'
import { useUserStore } from '@/stores/user'
import LineIcon from '@/components/LineIcon.vue'
import TabBar from '@/components/TabBar.vue'

const userStore = useUserStore()
const tabBarRef = ref()

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
  if (!url || url === '[]') return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `http://47.236.64.92${url}`
  return url
}

function handleImageError(e: any) {
  const image = e.target
  image.src = ''
}

function getConditionText(condition: number) {
  const map: Record<number, string> = {
    1: '全新',
    2: '几乎全新',
    3: '轻微使用',
    4: '明显使用'
  }
  return map[condition] || '其他'
}

function goToDetail(id: string) {
  uni.navigateTo({ url: '/pages/goods/detail?id=' + id })
}

function switchToHome() {
  uni.reLaunch({ url: '/pages/index/index' })
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
  tabBarRef.value?.setCurrentIndex(1)
})
</script>

<style lang="scss" scoped>
.line-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 140rpx;
}

.line-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  padding-top: calc(20rpx + var(--status-bar-height, 0px));
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 100;
}

.line-back-btn {
  width: 70rpx;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.line-header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: 1rpx;
}

.line-header-right {
  width: 70rpx;
}

.line-search-bar {
  padding: 20rpx 30rpx;
}

.line-search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  transition: all 0.2s ease;
}

.line-search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a2e;
  margin-left: 16rpx;
}

.line-placeholder {
  color: #8a8a9e;
}

.line-search-btn {
  padding: 12rpx 28rpx;
  border: 2rpx solid #3f37c9;
  border-radius: 12rpx;
  margin-left: 16rpx;
  transition: all 0.2s ease;
}

.line-search-btn-text {
  font-size: 26rpx;
  color: #3f37c9;
  font-weight: 500;
}

.line-filter-bar {
  padding: 10rpx 0;
  background-color: #fff;
  border-bottom: 2rpx solid #e0e0e0;
}

.line-filter-scroll {
  white-space: nowrap;
}

.line-filter-list {
  display: inline-flex;
  padding: 0 30rpx;
  gap: 20rpx;
}

.line-filter-item {
  padding: 14rpx 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #4a4a6a;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &.active {
    border-color: #3f37c9;
    background-color: rgba(63, 55, 201, 0.1);
    color: #3f37c9;
    font-weight: 500;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.line-active-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #e0e0e0;
}

.line-filter-tag {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 20rpx;
  border: 2rpx dashed #ffd166;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #8a6a00;
  transition: all 0.2s ease;
}

.line-tag-close {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-goods-scroll {
  height: calc(100vh - 500rpx - var(--status-bar-height, 0px));
}

.line-goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx;
  box-sizing: border-box;
  gap: 24rpx;
}

.line-goods-card {
  width: calc(50% - 12rpx);
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  overflow: hidden;
  transition: all 0.25s ease;
  
  &:active {
    transform: scale(0.97);
    border-color: #3f37c9;
  }
}

.line-goods-image-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.line-goods-image {
  width: 100%;
  height: 100%;
}

.line-goods-image-border {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  right: 10rpx;
  bottom: 10rpx;
  border: 2rpx solid rgba(26, 26, 46, 0.1);
  border-radius: 12rpx;
  pointer-events: none;
}

.line-goods-info {
  padding: 20rpx;
}

.line-goods-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.5rpx;
}

.line-goods-desc {
  display: block;
  font-size: 24rpx;
  color: #8a8a9e;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.line-goods-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #ef476f;
  letter-spacing: 1rpx;
}

.line-goods-condition {
  font-size: 22rpx;
  color: #4a4a6a;
  padding: 6rpx 14rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-weight: 500;
}

.line-loading, .line-no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #8a8a9e;
  font-size: 26rpx;
  letter-spacing: 1rpx;
}

.line-bottom-space {
  height: 40rpx;
}
</style>
