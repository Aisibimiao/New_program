<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <view class="form-section">
        <view class="section-title">
          <text>商品图片</text>
        </view>
        <view class="upload-area">
          <view 
            class="upload-item" 
            v-for="(img, index) in images" 
            :key="index"
          >
            <image class="upload-image" :src="img" mode="aspectFill" />
            <view class="remove-btn" @click="removeImage(index)">
              <text>✕</text>
            </view>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="images.length < 6">
            <text class="upload-icon">+</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>商品名称</text>
        </view>
        <input 
          class="form-input" 
          v-model="form.name" 
          placeholder="请输入商品名称"
        />
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>商品描述</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.description" 
          placeholder="请输入商品描述"
          :maxlength="500"
        />
        <text class="textarea-count">{{ form.description.length }}/500</text>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>分类</text>
        </view>
        <view class="category-list">
          <view 
            class="category-item" 
            v-for="cat in categories" 
            :key="cat"
            :class="{ active: form.category === cat }"
            @click="form.category = cat"
          >
            <text>{{ cat }}</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>成色</text>
        </view>
        <view class="condition-list">
          <view 
            class="condition-item" 
            v-for="item in conditions" 
            :key="item.value"
            :class="{ active: form.condition === item.value }"
            @click="form.condition = item.value"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="price-row">
          <view class="price-item">
            <text class="price-label">原价</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input 
                class="price-input" 
                v-model="form.originalPrice" 
                placeholder="0"
                type="digit"
              />
            </view>
          </view>
          <view class="price-item">
            <text class="price-label">售价</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input 
                class="price-input" 
                v-model="form.price" 
                placeholder="0"
                type="digit"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
        <text>发布商品</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createGoods, uploadImage } from '@/api/goods'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const categories = ['数码产品', '服饰鞋包', '图书教材', '运动户外', '生活用品', '其他']

const conditions = [
  { label: '全新', value: 1 },
  { label: '几乎全新', value: 2 },
  { label: '轻微使用', value: 3 },
  { label: '明显使用', value: 4 }
]

const images = ref<string[]>([])
const form = ref({
  name: '',
  description: '',
  category: '数码产品',
  condition: 2,
  originalPrice: '',
  price: ''
})

const canSubmit = computed(() => {
  return images.value.length > 0 &&
         form.value.name &&
         form.value.description &&
         form.value.price
})

onMounted(() => {
  userStore.initFromStorage()
  if (!userStore.token) {
    uni.showModal({
      title: '请先登录',
      content: '发布商品需要先登录，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/login' })
        } else {
          uni.navigateBack()
        }
      }
    })
  }
})

async function chooseImage() {
  uni.chooseImage({
    count: 6 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '上传中...' })
      try {
        for (const filePath of res.tempFilePaths) {
          const url = await uploadImage(filePath)
          images.value.push(url)
        }
      } catch (err) {
        uni.showToast({ title: '上传失败', icon: 'none' })
        console.error('上传失败', err)
      } finally {
        uni.hideLoading()
      }
    }
  })
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function handleSubmit() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  uni.showLoading({ title: '发布中...' })

  try {
    await createGoods({
      name: form.value.name,
      description: form.value.description,
      category: form.value.category,
      condition: form.value.condition,
      originalPrice: parseFloat(form.value.originalPrice) || 0,
      price: parseFloat(form.value.price),
      images: images.value
    })

    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' })
    }, 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '发布失败', icon: 'none' })
    console.error('发布失败', err)
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding: 20rpx;
  padding-bottom: 160rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.remove-btn {
  position: absolute;
  top: -15rpx;
  right: -15rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #e74c3c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #ccc;
}

.upload-text {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  font-size: 30rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 30rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.textarea-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.category-list, .condition-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.category-item, .condition-item {
  padding: 20rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  &.active {
    background-color: #667eea;
    color: #fff;
  }
}

.price-row {
  display: flex;
  gap: 40rpx;
}

.price-item {
  flex: 1;
}

.price-label {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.price-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #333;
}

.price-input {
  flex: 1;
  height: 80rpx;
  font-size: 32rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 36rpx;
  font-weight: bold;
  &.disabled {
    opacity: 0.5;
  }
}
</style>
