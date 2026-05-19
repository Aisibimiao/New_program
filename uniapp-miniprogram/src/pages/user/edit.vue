<template>
  <view class="line-edit-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="goBack">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">编辑资料</text>
      <view class="line-header-right">
        <view class="line-header-dot"></view>
      </view>
    </view>

    <scroll-view class="line-content-scroll" scroll-y>
      <view class="line-avatar-section">
        <view class="line-avatar-wrap" @click="chooseAvatar">
          <view class="line-avatar-wrapper">
            <image class="line-avatar" :src="getImageUrl(form.avatar)" mode="aspectFill" />
            <view class="line-avatar-border"></view>
          </view>
          <text class="line-avatar-tip">点击更换头像</text>
        </view>
      </view>

      <view class="line-form-section">
        <view class="line-form-item">
          <text class="line-form-label">昵称</text>
          <view class="line-input-wrapper">
            <input class="line-form-input" v-model="form.nickname" placeholder="请输入昵称" placeholder-class="line-placeholder" />
            <view class="line-input-border"></view>
          </view>
        </view>

        <view class="line-form-item">
          <text class="line-form-label">学号</text>
          <view class="line-input-wrapper">
            <input class="line-form-input" v-model="form.studentId" type="number" maxlength="10" placeholder="请输入学号（不超过10位）" placeholder-class="line-placeholder" />
            <view class="line-input-border"></view>
          </view>
        </view>

        <view class="line-form-item">
          <text class="line-form-label">手机号</text>
          <view class="line-input-wrapper">
            <input class="line-form-input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号（不超过11位）" placeholder-class="line-placeholder" />
            <view class="line-input-border"></view>
          </view>
        </view>

        <view class="line-form-item">
          <text class="line-form-label">宿舍楼栋</text>
          <view class="line-input-wrapper">
            <input class="line-form-input" v-model="form.dormBuilding" placeholder="请输入宿舍楼栋" placeholder-class="line-placeholder" />
            <view class="line-input-border"></view>
          </view>
        </view>

        <view class="line-form-item">
          <text class="line-form-label">邮箱</text>
          <view class="line-input-wrapper">
            <input class="line-form-input" v-model="form.email" type="email" placeholder="请输入邮箱" placeholder-class="line-placeholder" />
            <view class="line-input-border"></view>
          </view>
        </view>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <view class="line-bottom-bar">
      <view class="line-save-btn" @click="handleSave">
        <text>保存</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/request'
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()
const form = ref({
  nickname: '',
  studentId: '',
  phone: '',
  email: '',
  avatar: '',
  dormBuilding: ''
})

function getImageUrl(url?: string) {
  if (!url) return 'http://47.236.64.92/uploads/default-avatar.png'
  if (url.startsWith('http')) return url
  return `http://47.236.64.92${url}`
}

function goBack() {
  uni.navigateBack()
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      try {
        const result = await uploadAvatar(tempFilePath)
        form.value.avatar = result.url
        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    }
  })
}

async function uploadAvatar(filePath: string) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'http://47.236.64.92/api/auth/avatar',
      filePath,
      name: 'file',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            reject(new Error(data.msg || '上传失败'))
          }
        } catch {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}

function validateForm() {
  if (!form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return false
  }
  
  if (form.value.nickname.length < 2 || form.value.nickname.length > 20) {
    uni.showToast({ title: '昵称长度应在2-20个字符之间', icon: 'none' })
    return false
  }

  if (form.value.phone && !/^\d{1,11}$/.test(form.value.phone)) {
    uni.showToast({ title: '手机号不能超过11位数字', icon: 'none' })
    return false
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    uni.showToast({ title: '请输入正确的邮箱格式', icon: 'none' })
    return false
  }

  if (form.value.studentId && !/^\d{1,10}$/.test(form.value.studentId)) {
    uni.showToast({ title: '学号不能超过10位数字', icon: 'none' })
    return false
  }

  return true
}

async function handleSave() {
  if (!validateForm()) return

  uni.showLoading({ title: '保存中...' })
  try {
    const result = await request({
      url: '/auth/profile',
      method: 'PUT',
      data: {
        nickname: form.value.nickname.trim(),
        studentId: form.value.studentId.trim(),
        phone: form.value.phone.trim(),
        email: form.value.email.trim(),
        avatar: form.value.avatar,
        dormBuilding: form.value.dormBuilding
      }
    })
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    if (result.user) {
      userStore.updateUser(result.user)
    } else {
      userStore.updateUser(form.value)
    }
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}

onMounted(() => {
  if (userStore.user) {
    form.value = {
      nickname: userStore.user.nickname || '',
      studentId: userStore.user.studentId || '',
      phone: userStore.user.phone || '',
      email: userStore.user.email || '',
      avatar: userStore.user.avatar || '',
      dormBuilding: userStore.user.dormBuilding || ''
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-edit-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
}

.line-content-scroll {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 160rpx;
}

.line-avatar-section {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.line-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.line-avatar-wrapper {
  position: relative;
}

.line-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.line-avatar-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: $line-normal solid $line-primary;
  border-radius: 50%;
  pointer-events: none;
}

.line-avatar-tip {
  margin-top: 20rpx;
  font-size: $line-font-sm;
  color: $line-light;
}

.line-form-section {
  background-color: #fff;
  border: $line-normal solid $line-border;
  border-radius: $line-radius;
  padding: 20rpx 0;
  position: relative;
}

.line-form-section::before {
  content: '';
  position: absolute;
  top: -6rpx;
  left: 24rpx;
  right: 24rpx;
  height: 6rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-border 0rpx,
    $line-border 8rpx,
    transparent 8rpx,
    transparent 16rpx
  );
}

.line-form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: $line-thin dashed $line-border;
  &:last-child {
    border-bottom: none;
  }
}

.line-form-label {
  width: 160rpx;
  font-size: $line-font-md;
  color: $line-primary;
}

.line-input-wrapper {
  flex: 1;
  position: relative;
}

.line-form-input {
  width: 100%;
  font-size: $line-font-md;
  color: $line-primary;
}

.line-input-border {
  position: absolute;
  bottom: -8rpx;
  left: 0;
  right: 0;
  height: 2rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-border 0rpx,
    $line-border 6rpx,
    transparent 6rpx,
    transparent 12rpx
  );
}

.line-placeholder {
  color: $line-light;
}

.line-bottom-space {
  height: 40rpx;
}

.line-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: $line-thin solid $line-border;
  z-index: 100;
}

.line-save-btn {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: $line-normal solid $line-primary;
  border-radius: $line-radius;
  background-color: $line-primary;
  color: #fff;
  font-size: $line-font-lg;
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
