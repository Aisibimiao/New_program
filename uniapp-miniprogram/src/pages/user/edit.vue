<template>
  <view class="container">
    <view class="avatar-section">
      <view class="avatar-wrap" @click="chooseAvatar">
        <image class="avatar" :src="getImageUrl(form.avatar)" mode="aspectFill" />
        <text class="avatar-tip">点击更换头像</text>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
      </view>

      <view class="form-item">
        <text class="form-label">真实姓名</text>
        <input class="form-input" v-model="form.name" placeholder="请输入真实姓名" />
      </view>

      <view class="form-item">
        <text class="form-label">学号</text>
        <input class="form-input" v-model="form.studentId" placeholder="请输入学号" />
      </view>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" v-model="form.phone" type="number" placeholder="请输入手机号" />
      </view>

      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input class="form-input" v-model="form.email" type="email" placeholder="请输入邮箱" />
      </view>
    </view>

    <view class="save-btn" @click="handleSave">
      <text>保存</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/request'

const userStore = useUserStore()
const form = ref({
  nickname: '',
  name: '',
  studentId: '',
  phone: '',
  email: '',
  avatar: ''
})

function getImageUrl(url?: string) {
  if (!url) return 'http://localhost:3000/uploads/default-avatar.png'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
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
      url: 'http://localhost:3000/api/auth/avatar',
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

  if (form.value.phone && !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    uni.showToast({ title: '请输入正确的邮箱格式', icon: 'none' })
    return false
  }

  if (form.value.studentId && !/^[A-Za-z0-9]{4,20}$/.test(form.value.studentId)) {
    uni.showToast({ title: '学号格式不正确', icon: 'none' })
    return false
  }

  if (form.value.name && form.value.name.length > 50) {
    uni.showToast({ title: '真实姓名不能超过50个字符', icon: 'none' })
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
        name: form.value.name.trim(),
        studentId: form.value.studentId.trim(),
        phone: form.value.phone.trim(),
        email: form.value.email.trim(),
        avatar: form.value.avatar
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
      name: userStore.user.name || '',
      studentId: userStore.user.studentId || '',
      phone: userStore.user.phone || '',
      email: userStore.user.email || '',
      avatar: userStore.user.avatar || ''
    }
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.avatar-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}

.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-tip {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 10rpx 0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 160rpx;
  font-size: 30rpx;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.save-btn {
  margin: 40rpx 20rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>