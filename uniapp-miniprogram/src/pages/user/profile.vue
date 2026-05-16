<template>
  <view class="container">
    <view class="header" v-if="user">
      <view class="user-info">
        <image class="avatar" :src="getImageUrl(user.avatar)" mode="aspectFill" />
        <view class="user-detail">
          <text class="nickname">{{ user.nickname || user.name || '用户' }}</text>
          <text class="role">{{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="goToEdit">
        <text>编辑资料</text>
      </view>
    </view>

    <view class="header" v-else>
      <view class="login-prompt" @click="goToLogin">
        <text class="login-icon">🔒</text>
        <text class="login-text">点击登录</text>
      </view>
    </view>

    <view class="stats-section" v-if="user">
      <view class="stat-item">
        <text class="stat-num">{{ stats.goodsCount }}</text>
        <text class="stat-label">发布商品</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.orderCount }}</text>
        <text class="stat-label">已售出</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goToPublish">
        <text class="menu-icon">📤</text>
        <text class="menu-text">发布商品</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToMyGoods">
        <text class="menu-icon">📦</text>
        <text class="menu-text">我的发布</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToOrders">
        <text class="menu-icon">🛒</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToFavorites">
        <text class="menu-icon">❤️</text>
        <text class="menu-text">我的收藏</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-list" v-if="user">
      <view class="menu-item logout-item" @click="handleLogout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text">退出登录</text>
      </view>
    </view>

    <view class="tab-bar">
      <view class="tab-item" @click="switchToHome">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item" @click="switchToGoods">
        <text class="tab-icon">📦</text>
        <text class="tab-text">商品</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getMyGoods } from '@/api/goods'
import type { User } from '@/api/auth'

const userStore = useUserStore()
const user = ref<User | null>(null)
const stats = ref({
  goodsCount: 0,
  orderCount: 0
})

function getImageUrl(url?: string) {
  if (!url) return 'https://api.dicebear.com/9.x/initials/svg?seed=User&backgroundColor=b6e3f4'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

async function loadUserData() {
  if (!userStore.token) return
  try {
    const myGoods = await getMyGoods()
    stats.value.goodsCount = Array.isArray(myGoods) ? myGoods.length : 0
    stats.value.orderCount = Array.isArray(myGoods) ? myGoods.filter(g => g.status === 'SOLD' || g.status === 1).length : 0
  } catch (err) {
    console.error('加载用户数据失败', err)
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

function switchToGoods() {
  uni.navigateTo({ url: '/pages/goods/list' })
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
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: $tabbar-height;
}

.header {
  @include gradient-primary;
  padding: 80rpx $spacing-xl $spacing-xl;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 $radius-xl $radius-xl;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -30%;
    width: 80%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -20%;
    width: 50%;
    height: 80%;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.user-info {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  transition: all $transition-normal;
  
  &:active {
    transform: scale(0.95);
  }
}

.user-detail {
  margin-left: $spacing-lg;
}

.nickname {
  display: block;
  font-size: $font-xl;
  font-weight: 700;
  color: #fff;
  margin-bottom: $spacing-xs;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.15);
}

.role {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2rpx;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10rpx);
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-full;
  border: 2rpx solid rgba(255, 255, 255, 0.25);
  transition: all $transition-fast;
  position: relative;
  z-index: 1;
  
  &:active {
    background: rgba(255, 255, 255, 0.28);
    transform: scale(0.96);
  }
}

.edit-btn text {
  color: #fff;
  font-size: $font-sm;
  font-weight: 500;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;
  position: relative;
  z-index: 1;
}

.login-icon {
  font-size: 100rpx;
  margin-bottom: $spacing-md;
  opacity: 0.8;
}

.login-text {
  color: #fff;
  font-size: $font-lg;
  font-weight: 500;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  padding: $spacing-xl 0;
  background: $bg-white;
  margin: $spacing-md $spacing-lg;
  border-radius: $radius-xl;
  @include shadow-card;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 $spacing-lg;
  
  &:not(:last-child) {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2rpx;
      height: 60%;
      background: $border-color;
    }
  }
}

.stat-num {
  font-size: 56rpx;
  font-weight: 700;
  @include gradient-primary;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: $font-sm;
  color: $text-light;
  margin-top: $spacing-sm;
  font-weight: 500;
}

.menu-list {
  background: $bg-white;
  margin: 16rpx $spacing-lg;
  border-radius: $radius-xl;
  @include shadow-card;
  overflow: hidden;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $border-color;
  transition: all $transition-fast;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
    transform: scale(0.98);
  }
}

.menu-icon {
  font-size: 48rpx;
  margin-right: $spacing-lg;
  opacity: 0.7;
}

.menu-text {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-placeholder;
  transition: all $transition-fast;
  
  .menu-item:active & {
    transform: translateX(8rpx);
  }
}

.logout-item {
  .menu-text {
    color: $accent-color;
    font-weight: 600;
  }
  
  .menu-icon {
    opacity: 0.8;
  }
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  padding: 16rpx 0;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 32rpx rgba(102, 126, 234, 0.08);
  border-top: 2rpx solid rgba(102, 126, 234, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
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
</style>