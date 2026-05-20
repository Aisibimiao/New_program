<template>
  <view class="line-container">
    <view class="line-header-bar">
      <view class="line-header-left"></view>
      <text class="line-header-title">我的发布</text>
      <view class="line-header-right"></view>
    </view>

    <view class="line-tab-bar-page">
      <view
        class="line-tab-item-page"
        :class="{ active: activeTab === 'selling' }"
        @click="activeTab = 'selling'"
      >
        <text>在售中</text>
        <view class="line-tab-indicator" v-if="activeTab === 'selling'"></view>
      </view>
      <view
        class="line-tab-item-page"
        :class="{ active: activeTab === 'sold' }"
        @click="activeTab = 'sold'"
      >
        <text>已售出</text>
        <view class="line-tab-indicator" v-if="activeTab === 'sold'"></view>
      </view>
    </view>

    <scroll-view
      class="line-goods-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="line-goods-list">
        <view
          class="line-goods-item"
          v-for="goods in goodsList"
          :key="goods._id"
        >
          <view class="line-goods-content" @click="goToDetail(goods._id)">
            <view class="line-goods-image-box">
              <image class="line-goods-image" :src="getImageUrl(goods.images?.[0])" mode="aspectFill" @error="handleImageError($event)" />
              <view class="line-goods-image-border"></view>
            </view>
            <view class="line-goods-info">
              <text class="line-goods-name">{{ goods.title }}</text>
              <text class="line-goods-desc">{{ goods.description }}</text>
              <view class="line-goods-footer">
                <text class="line-goods-price">¥{{ goods.price }}</text>
                <text class="line-goods-status">{{ goods.status === 1 ? '在售' : '已售出' }}</text>
              </view>
            </view>
          </view>

          <view class="line-goods-actions" v-if="goods.status === 1">
            <view class="line-action-btn line-off-btn" @click="handleOffShelf(goods._id)">
              <text>下架</text>
            </view>
            <view class="line-action-btn line-edit-btn" @click="goToEdit(goods._id)">
              <text>编辑</text>
            </view>
            <view class="line-action-btn line-delete-btn" @click="handleDelete(goods._id)">
              <text>删除</text>
            </view>
          </view>

          <view class="line-goods-actions" v-else>
            <view class="line-action-btn line-delete-btn" @click="handleDelete(goods._id)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="goodsList.length === 0" class="line-empty">
        <view class="line-empty-icon">
          <LineIcon name="box" />
        </view>
        <text class="line-empty-text">暂无商品</text>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyGoods, deleteGoods, offShelfGoods, type Goods } from '@/api/goods'
import LineIcon from '@/components/LineIcon.vue'

const activeTab = ref('selling')
const goodsList = ref<Goods[]>([])
const refreshing = ref(false)
const imageUrls = ref<Record<string, string>>({})

async function getImageUrl(fileID?: string): Promise<string> {
  if (!fileID || fileID === '[]' || fileID === '') return ''
  
  if (fileID.startsWith('http')) {
    return fileID
  }
  
  if (imageUrls.value[fileID]) {
    return imageUrls.value[fileID]
  }
  
  try {
    const result = await uni.cloud.getTempFileURL({
      fileList: [fileID]
    })
    if (result.fileList[0].tempFileURL) {
      imageUrls.value[fileID] = result.fileList[0].tempFileURL
      return result.fileList[0].tempFileURL
    }
  } catch (err) {
    console.error('获取图片URL失败', err)
  }
  return ''
}

function handleImageError(e: any) {
  const image = e.target
  image.src = ''
}

function goBack() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goToDetail(id: string) {
  uni.navigateTo({ url: '/pages/goods/detail?id=' + id })
}

function goToEdit(id: string) {
  uni.navigateTo({ url: '/pages/publish/edit?id=' + id })
}

async function handleOffShelf(id: string) {
  uni.showModal({
    title: '确认下架',
    content: '确定要下架这个商品吗？下架后会移至已售出',
    success: async (res) => {
      if (res.confirm) {
        try {
          await offShelfGoods(id)
          uni.showToast({ title: '下架成功', icon: 'success' })
          loadGoods()
        } catch (err) {
          console.error('下架失败', err)
          uni.showToast({ title: '下架失败', icon: 'none' })
        }
      }
    }
  })
}

async function handleDelete(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个商品吗？删除后不可恢复',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteGoods(id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadGoods()
        } catch (err) {
          console.error('删除失败', err)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadGoods() {
  refreshing.value = true
  imageUrls.value = {}
  try {
    const result = await getMyGoods()
    if (result.success && result.data) {
      const list = result.data.list || []
      if (activeTab.value === 'selling') {
        goodsList.value = list.filter(g => g.status === 1)
      } else {
        goodsList.value = list.filter(g => g.status === 0)
      }
    } else {
      goodsList.value = []
    }
  } catch (err) {
    console.error('加载失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
    goodsList.value = []
  } finally {
    refreshing.value = false
  }
}

function onRefresh() {
  loadGoods()
}

watch(activeTab, () => {
  loadGoods()
})

onMounted(() => {
  loadGoods()
})

onShow(() => {
  loadGoods()
})
</script>

<style lang="scss" scoped>
.line-container {
  min-height: 100vh;
  background-color: #f8f9fa;
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

.line-tab-bar-page {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
}

.line-tab-item-page {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  font-size: 28rpx;
  color: #4a4a6a;
  position: relative;
  transition: all 0.2s ease;
  
  &.active {
    color: #3f37c9;
    font-weight: 600;
  }
}

.line-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #3f37c9 0%, #4a4a6a 100%);
  border-radius: 2rpx;
}

.line-goods-scroll {
  height: calc(100vh - 200rpx - var(--status-bar-height, 0px));
}

.line-goods-list {
  padding: 30rpx;
}

.line-goods-item {
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  transition: all 0.25s ease;
}

.line-goods-content {
  display: flex;
  padding: 24rpx;
}

.line-goods-image-box {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
}

.line-goods-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.line-goods-image-border {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  right: 8rpx;
  bottom: 8rpx;
  border: 2rpx solid rgba(26, 26, 46, 0.1);
  border-radius: 12rpx;
  pointer-events: none;
}

.line-goods-info {
  flex: 1;
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.line-goods-name {
  display: block;
  font-size: 30rpx;
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

.line-goods-footer {
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

.line-goods-status {
  font-size: 22rpx;
  color: #4a4a6a;
  padding: 6rpx 14rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-weight: 500;
}

.line-goods-actions {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-top: 2rpx solid #e0e0e0;
}

.line-action-btn {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  border-radius: 14rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.line-off-btn {
  border: 2rpx solid #ffd166;
  color: #8a6a00;
}

.line-edit-btn {
  border: 2rpx solid #3f37c9;
  color: #3f37c9;
}

.line-delete-btn {
  border: 2rpx solid #ef476f;
  color: #ef476f;
}

.line-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.line-empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.4;
}

.line-empty-text {
  font-size: 28rpx;
  color: #8a8a9e;
  letter-spacing: 1rpx;
}

.line-bottom-space {
  height: 40rpx;
}
</style>
