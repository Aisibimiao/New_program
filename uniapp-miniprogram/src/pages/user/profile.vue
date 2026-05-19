<template>
  <view class="line-container">
    <view class="line-header-bar">
      <view class="line-spacer"></view>
      <text class="line-header-title">个人中心</text>
      <view class="line-spacer"></view>
    </view>

    <scroll-view class="line-content-scroll" scroll-y>
      <view class="line-header-section" v-if="user">
        <view class="line-user-info">
          <view class="line-avatar-wrapper">
            <image class="line-avatar" :src="getImageUrl(user.avatar)" mode="aspectFill" />
            <view class="line-avatar-border"></view>
          </view>
          <view class="line-user-detail">
            <text class="line-nickname">{{ user.nickname || user.name || '用户' }}</text>
            <view class="line-role-tag">
              <text class="line-role">{{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}</text>
            </view>
          </view>
        </view>
        <view class="line-edit-btn" @click="goToEdit">
          <text class="line-edit-text">编辑资料</text>
        </view>
      </view>

      <view class="line-header-section" v-else>
        <view class="line-login-prompt" @click="goToLogin">
          <view class="line-login-icon">
            <LineIcon name="user" />
          </view>
          <text class="line-login-text">点击登录</text>
          <view class="line-login-line"></view>
        </view>
      </view>

      <view class="line-stats-section" v-if="user">
        <view class="line-stat-item">
          <text class="line-stat-num">{{ stats.goodsCount }}</text>
          <text class="line-stat-label">发布商品</text>
        </view>
        <view class="line-stat-divider"></view>
        <view class="line-stat-item">
          <text class="line-stat-num">{{ stats.orderCount }}</text>
          <text class="line-stat-label">已售出</text>
        </view>
      </view>

      <view class="line-menu-list">
        <view class="line-menu-item" @click="goToPublish">
          <view class="line-menu-icon">
            <LineIcon name="plus" />
          </view>
          <text class="line-menu-text">发布商品</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>

        <view class="line-menu-divider"></view>

        <view class="line-menu-item" @click="goToMyGoods">
          <view class="line-menu-icon">
            <LineIcon name="order" />
          </view>
          <text class="line-menu-text">我的发布</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>

        <view class="line-menu-divider"></view>

        <view class="line-menu-item" @click="goToOrders">
          <view class="line-menu-icon">
            <LineIcon name="wallet" />
          </view>
          <text class="line-menu-text">我的订单</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>

        <view class="line-menu-divider"></view>

        <view class="line-menu-item" @click="goToFavorites">
          <view class="line-menu-icon">
            <LineIcon name="heart" />
          </view>
          <text class="line-menu-text">我的收藏</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>
      </view>

      <view class="line-menu-list">
        <view class="line-menu-item" @click="goToSettings">
          <view class="line-menu-icon">
            <LineIcon name="settings" />
          </view>
          <text class="line-menu-text">设置</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>

        <view class="line-menu-divider"></view>

        <view class="line-menu-item" @click="goToAbout">
          <view class="line-menu-icon">
            <LineIcon name="info" />
          </view>
          <text class="line-menu-text">关于我们</text>
          <view class="line-menu-arrow">
            <LineIcon name="arrow-right" />
          </view>
        </view>
      </view>

      <view class="line-menu-list" v-if="user">
        <view class="line-menu-item line-logout-item" @click="handleLogout">
          <view class="line-menu-icon">
            <LineIcon name="trash" />
          </view>
          <text class="line-menu-text">退出登录</text>
        </view>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <view class="line-tab-bar">
      <view class="line-tab-item" @click="switchToHome">
        <view class="line-tab-icon">
          <LineIcon name="home" />
        </view>
        <view class="line-tab-indicator"></view>
        <text class="line-tab-text">首页</text>
      </view>
      <view class="line-tab-item line-publish-item" @click="switchToPublish">
        <view class="line-publish-btn">
          <LineIcon name="plus" />
        </view>
        <text class="line-tab-text">发布</text>
      </view>
      <view class="line-tab-item line-tab-active">
        <view class="line-tab-icon">
          <LineIcon name="user" :active="true" />
        </view>
        <view class="line-tab-indicator line-indicator-active"></view>
        <text class="line-tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getMyGoods } from '@/api/goods'
import { getSellOrders } from '@/api/order'
import type { User } from '@/api/auth'
import { formatImageUrl } from '@/utils/request'
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()
const user = ref<User | null>(null)
const stats = ref({
  goodsCount: 0,
  orderCount: 0
})

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/svg?seed=User&backgroundColor=b6e3f4'
  return formatImageUrl(url)
}

async function loadUserData() {
  if (!userStore.token) return
  
  try {
    const myGoods = await getMyGoods()
    stats.value.goodsCount = Array.isArray(myGoods) ? myGoods.length : 0
  } catch (err) {
    console.error('加载商品数据失败', err)
    stats.value.goodsCount = 0
  }
  
  try {
    const sellOrders = await getSellOrders()
    stats.value.orderCount = Array.isArray(sellOrders) ? sellOrders.length : 0
  } catch (err) {
    console.error('加载订单数据失败', err)
    stats.value.orderCount = 0
  }
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/user/login' })
}

function refreshUser() {
  userStore.initFromStorage()
  user.value = userStore.user
  if (user.value) {
    loadUserData()
  }
}

function goToEdit() {
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '编辑资料需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      }
    })
    return
  }
  uni.navigateTo({ url: '/pages/user/edit' })
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

function goToMyGoods() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/goods/my-list' })
}

function goToOrders() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/list' })
}

function goToFavorites() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/favorite/index' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/user/settings' })
}

function goToAbout() {
  uni.navigateTo({ url: '/pages/user/about' })
}

function switchToHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function switchToPublish() {
  uni.navigateTo({ url: '/pages/publish/index' })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后将无法同步收藏和发布记录，是否继续？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        userStore.logout()
        user.value = null
        stats.value = { goodsCount: 0, orderCount: 0 }
        uni.reLaunch({ url: '/pages/user/login' })
      }
    }
  })
}

onMounted(() => {
  refreshUser()
})
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-container {
  min-height: 100vh;
  background-color: $line-bg;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.line-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background-color: white;
  position: relative;
  z-index: 100;
  border-bottom: 3rpx solid $line-primary;
}

.line-spacer {
  width: 60rpx;
}

.line-header-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 4rpx;
}

.line-content-scroll {
  flex: 1;
}

.line-header-section {
  background-color: white;
  padding: 32rpx;
  border-bottom: 3rpx solid $line-primary;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.line-user-info {
  display: flex;
  align-items: center;
}

.line-avatar-wrapper {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.line-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.line-avatar-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3rpx solid $line-primary;
  border-radius: 50%;
  pointer-events: none;
}

.line-user-detail {
  margin-left: 24rpx;
}

.line-nickname {
  display: block;
  font-size: $line-font-xl;
  font-weight: 600;
  color: $line-primary;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.line-role-tag {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 16rpx;
  border: 2rpx solid $line-border;
  border-radius: $line-radius;
}

.line-role {
  font-size: $line-font-sm;
  color: $line-light;
  letter-spacing: 1rpx;
}

.line-edit-btn {
  border: 3rpx solid $line-primary;
  padding: 12rpx 24rpx;
  border-radius: $line-radius;
  transition: all 0.2s ease;
  
  &:active {
    background-color: $line-primary;
    transform: scale(0.95);
    
    .line-edit-text {
      color: white;
    }
  }
}

.line-edit-text {
  font-size: $line-font-sm;
  color: $line-primary;
  font-weight: 500;
  letter-spacing: 1rpx;
  transition: all 0.2s ease;
}

.line-login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 12rpx;
}

.line-login-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-login-text {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 2rpx;
}

.line-login-line {
  width: 100rpx;
  height: 3rpx;
  background-color: $line-primary;
}

.line-stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24rpx 32rpx;
  padding: 32rpx;
  background-color: white;
  border: 3rpx solid $line-primary;
  border-radius: $line-radius-lg;
}

.line-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
}

.line-stat-num {
  font-size: 56rpx;
  font-weight: 700;
  color: $line-accent;
  letter-spacing: 2rpx;
}

.line-stat-label {
  font-size: $line-font-sm;
  color: $line-light;
  margin-top: 12rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.line-stat-divider {
  width: 2rpx;
  height: 80rpx;
  background-color: $line-border;
}

.line-menu-list {
  background-color: white;
  margin: 16rpx 32rpx;
  border: 3rpx solid $line-primary;
  border-radius: $line-radius-lg;
  overflow: hidden;
}

.line-menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  transition: all 0.2s ease;
  
  &:active {
    background-color: $line-bg;
  }
}

.line-menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-menu-text {
  flex: 1;
  font-size: $line-font-md;
  color: $line-primary;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.line-menu-arrow {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-menu-divider {
  height: 2rpx;
  background-color: $line-border;
  margin: 0 32rpx;
}

.line-logout-item {
  .line-menu-text {
    color: $line-danger;
    font-weight: 600;
  }
}

.line-bottom-space {
  height: 80rpx;
}

.line-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 3rpx solid $line-primary;
  z-index: 200;
}

.line-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  position: relative;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
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
  background-color: $line-accent;
  margin-top: 4rpx;
  transition: width 0.2s ease;
}

.line-indicator-active {
  width: 40rpx;
}

.line-tab-text {
  font-size: $line-font-xs;
  color: $line-light;
  margin-top: 6rpx;
  letter-spacing: 1rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.line-tab-active {
  .line-tab-text {
    color: $line-accent;
    font-weight: 600;
  }
}

.line-publish-item {
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
  background-color: white;
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
    pointer-events: none;
  }
  
  &:active {
    transform: scale(0.88);
    border-color: $line-accent;
  }
}
</style>
