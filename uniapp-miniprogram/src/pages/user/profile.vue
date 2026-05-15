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
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-detail {
  margin-left: 30rpx;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.role {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
}

.edit-btn text {
  color: #fff;
  font-size: 26rpx;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.login-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.login-text {
  color: #fff;
  font-size: 32rpx;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 0;
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.menu-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f8f8;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-item {
  .menu-text {
    color: #ff6b6b;
  }
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.active {
    .tab-icon,
    .tab-text {
      color: #667eea;
    }
  }
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
}
</style>