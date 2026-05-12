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
      <view class="tab-item" @click="goToHome()">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item" @click="goToGoods()">
        <text class="tab-icon">📦</text>
        <text class="tab-text">商品</text>
      </view>
      <view class="tab-item active" @click="goToProfile()">
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
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

async function loadUserData() {
  if (!userStore.token) return
  try {
    const myGoods = await getMyGoods()
    stats.value.goodsCount = Array.isArray(myGoods) ? myGoods.length : 0
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
  uni.showModal({
    title: '关于我们',
    content: '校园二手平台 v1.0\n\n让闲置物品找到新主人\n\n联系我们：support@campus-trade.com',
    showCancel: false
  })
}

function goToHome() {
  uni.navigateTo({ url: '/pages/index/index' })
}

function goToGoods() {
  uni.navigateTo({ url: '/pages/goods/list' })
}

function goToProfile() {}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        user.value = null
        stats.value = { goodsCount: 0, orderCount: 0 }
        uni.showToast({ title: '退出成功', icon: 'success' })
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
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  width: 160rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 35rpx;
  font-size: 26rpx;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.login-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.login-text {
  font-size: 32rpx;
  color: #fff;
}

.stats-section {
  display: flex;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.menu-list {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #ccc;
}

.logout-item {
  background-color: #fff5f5;
  .menu-text {
    color: #e74c3c;
  }
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