<template>
  <view class="container">
    <view class="logo-section">
      <text class="logo">🏫</text>
      <text class="title">校园二手平台</text>
    </view>

    <view class="form-container">
      <view class="form-item">
        <text class="form-icon">📧</text>
        <input
          class="form-input"
          v-model="email"
          placeholder="请输入邮箱"
          type="email"
        />
      </view>

      <view class="form-item">
        <text class="form-icon">🔒</text>
        <input
          class="form-input"
          v-model="password"
          placeholder="请输入密码"
          type="password"
        />
      </view>

      <view class="login-btn" @click="handleLogin">
        <text>登录</text>
      </view>

      <view class="links">
        <text class="link" @click="goToRegister">还没有账号？去注册</text>
        <text class="link divider">|</text>
        <text class="link" @click="goToForget">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  try {
    await userStore.login(email.value, password.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' })
    }, 1000)
  } catch (err: any) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  }
}

function goToRegister() {
  uni.navigateTo({ url: '/pages/user/register' })
}

function goToForget() {
  uni.showToast({ title: '忘记密码功能开发中', icon: 'none' })
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
  margin-bottom: 100rpx;
}

.logo {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.form-container {
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 100rpx;
  margin-bottom: 30rpx;
}

.form-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
}

.code-input {
  flex: 1;
}

.get-code-btn {
  width: 200rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 35rpx;
  font-size: 26rpx;
  &.disabled {
    opacity: 0.5;
  }
}

.login-btn {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  gap: 20rpx;
}

.link {
  font-size: 28rpx;
  color: #999;
  &.divider {
    color: #ccc;
  }
}
</style>
