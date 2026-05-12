<template>
  <view class="container">
    <view class="logo-section">
      <text class="logo">🏫</text>
      <text class="title">校园二手平台</text>
      <text class="subtitle">注册新账号</text>
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
        <text class="form-icon">👤</text>
        <input 
          class="form-input" 
          v-model="nickname" 
          placeholder="请输入昵称"
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

      <view class="form-item">
        <text class="form-icon">🔒</text>
        <input 
          class="form-input" 
          v-model="confirmPassword" 
          placeholder="请确认密码"
          type="password"
        />
      </view>

      <view class="form-item">
        <text class="form-icon">📱</text>
        <input 
          class="form-input code-input" 
          v-model="code" 
          placeholder="验证码"
        />
        <view class="get-code-btn" :class="{ disabled: codeDisabled }" @click="getCode">
          <text>{{ codeText }}</text>
        </view>
      </view>

      <view class="register-btn" @click="handleRegister">
        <text>注册</text>
      </view>

      <view class="links">
        <text class="link" @click="goToLogin">已有账号？去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { sendCode } from '@/api/auth'

const userStore = useUserStore()

const email = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const codeDisabled = ref(false)
const codeText = ref('获取验证码')

async function getCode() {
  if (!email.value) {
    uni.showToast({ title: '请先输入邮箱', icon: 'none' })
    return
  }

  codeDisabled.value = true
  codeText.value = '60s后重试'

  try {
    await sendCode(email.value)
    uni.showToast({ title: '验证码已发送', icon: 'success' })

    let count = 60
    const timer = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(timer)
        codeDisabled.value = false
        codeText.value = '获取验证码'
      } else {
        codeText.value = `${count}s后重试`
      }
    }, 1000)
  } catch (err) {
    codeDisabled.value = false
    codeText.value = '获取验证码'
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}

async function handleRegister() {
  if (!email.value) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!nickname.value) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  try {
    await userStore.register(email.value, password.value, nickname.value, code.value)
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' })
    }, 1000)
  } catch (err: any) {
    uni.showToast({ title: err.message || '注册失败', icon: 'none' })
  }
}

function goToLogin() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.logo {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.form-container {
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 90rpx;
  margin-bottom: 25rpx;
}

.form-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
}

.code-input {
  flex: 1;
}

.get-code-btn {
  width: 180rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
  &.disabled {
    opacity: 0.5;
  }
}

.register-btn {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 30rpx;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

.link {
  font-size: 26rpx;
  color: #999;
}
</style>
