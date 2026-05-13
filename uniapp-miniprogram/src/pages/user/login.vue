<template>
  <view class="container">
    <view class="logo-section">
      <text class="logo">🏫</text>
      <text class="title">校园二手平台</text>
      <text class="subtitle">微信授权登录</text>
    </view>

    <view class="login-container">
      <view class="wechat-btn" @click="handleWechatLogin">
        <text class="wechat-icon">💬</text>
        <text class="wechat-text">微信授权登录</text>
      </view>

      <view class="tips">
        <text class="tip-text">登录即表示同意</text>
        <text class="tip-link">《用户协议》</text>
        <text class="tip-text">和</text>
        <text class="tip-link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

async function handleWechatLogin() {
  uni.showLoading({ title: '登录中...' })
  
  try {
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginRes.code) {
      uni.showToast({ title: '获取code失败', icon: 'none' })
      return
    }

    await userStore.wechatLogin(loginRes.code)
    
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' })
    }, 1000)
    
  } catch (err: any) {
    uni.hideLoading()
    console.error('登录失败:', err)
    uni.showToast({ 
      title: err.message || '登录失败，请重试', 
      icon: 'none' 
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
  margin-top: 100rpx;
}

.logo {
  font-size: 160rpx;
  margin-bottom: 40rpx;
}

.title {
  font-size: 52rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wechat-btn {
  width: 100%;
  max-width: 600rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
  margin-bottom: 40rpx;
}

.wechat-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.wechat-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.tip-link {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}
</style>