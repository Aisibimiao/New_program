<template>
  <view class="line-container">
    <view class="line-header-section">
      <view class="line-dot-group">
        <view class="line-dot"></view>
        <view class="line-dot"></view>
        <view class="line-dot"></view>
      </view>
      
      <view class="line-logo-wrapper">
        <view class="line-logo-border">
          <text class="line-logo">校园</text>
        </view>
      </view>
      
      <text class="line-title">二手平台</text>
      <view class="line-title-divider"></view>
      <text class="line-subtitle">微信授权登录</text>
    </view>

    <view class="line-login-section">
      <view class="line-login-card">
        <view class="line-wechat-btn" @click="handleWechatLogin">
          <view class="line-wechat-icon">
            <LineIcon name="chat" />
          </view>
          <text class="line-wechat-text">微信授权登录</text>
        </view>
        
        <view class="line-tips-section">
          <text class="line-tip-text">登录即表示同意</text>
          <text class="line-tip-link">《用户协议》</text>
          <text class="line-tip-text">和</text>
          <text class="line-tip-link">《隐私政策》</text>
        </view>
      </view>
    </view>

    <view class="line-footer-section">
      <view class="line-footer-divider"></view>
      <view class="line-dot-group">
        <view class="line-dot"></view>
        <view class="line-dot"></view>
        <view class="line-dot"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import LineIcon from '@/components/LineIcon.vue'

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
    uni.showToast({ title: '登录成功', icon: 'none' })
    
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
@import '@/styles/line-ui.scss';

.line-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  padding-top: calc(80rpx + env(safe-area-inset-top));
  padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
}

.line-header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 80rpx;
  margin-bottom: 120rpx;
}

.line-dot-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.line-dot {
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid $line-primary;
  border-radius: 50%;
}

.line-logo-wrapper {
  margin-bottom: 40rpx;
}

.line-logo-border {
  width: 160rpx;
  height: 160rpx;
  border: 4rpx solid $line-primary;
  border-radius: $line-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    right: 12rpx;
    bottom: 12rpx;
    border: 2rpx dashed $line-border;
    border-radius: 8rpx;
    pointer-events: none;
  }
}

.line-logo {
  font-size: 56rpx;
  font-weight: 700;
  color: $line-primary;
  letter-spacing: 8rpx;
}

.line-title {
  font-size: 52rpx;
  font-weight: 700;
  color: $line-primary;
  letter-spacing: 12rpx;
  margin-bottom: 20rpx;
}

.line-title-divider {
  width: 120rpx;
  height: 4rpx;
  background-color: $line-primary;
  margin-bottom: 20rpx;
}

.line-subtitle {
  font-size: 28rpx;
  color: $line-light;
  letter-spacing: 6rpx;
}

.line-login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.line-login-card {
  width: 100%;
  max-width: 600rpx;
  background-color: white;
  border: 4rpx solid $line-primary;
  border-radius: $line-radius-lg;
  padding: 40rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    right: 16rpx;
    bottom: 16rpx;
    border: 2rpx dashed $line-border;
    border-radius: 8rpx;
    pointer-events: none;
  }
}

.line-wechat-btn {
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  border: 4rpx solid $line-primary;
  border-radius: $line-radius-lg;
  background-color: white;
  transition: all 0.2s ease;
  
  &:active {
    background-color: $line-primary;
    transform: scale(0.98);
    
    .line-wechat-icon,
    .line-wechat-text {
      color: white;
    }
  }
}

.line-wechat-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $line-primary;
  transition: all 0.2s ease;
}

.line-wechat-text {
  font-size: 34rpx;
  font-weight: 600;
  color: $line-primary;
  letter-spacing: 4rpx;
  transition: all 0.2s ease;
}

.line-tips-section {
  margin-top: 40rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rpx;
}

.line-tip-text {
  font-size: 24rpx;
  color: $line-light;
  letter-spacing: 2rpx;
}

.line-tip-link {
  font-size: 24rpx;
  color: $line-primary;
  letter-spacing: 2rpx;
  text-decoration: underline;
}

.line-footer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  margin-top: 60rpx;
}

.line-footer-divider {
  width: 40rpx;
  height: 2rpx;
  background-color: $line-border;
  margin-bottom: 20rpx;
}
</style>
